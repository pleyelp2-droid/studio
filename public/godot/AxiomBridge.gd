extends Node

## Ouroboros Axiom Bridge v1.0.4 (Single-File Edition)
## Purpose: Pure GDScript implementation for Firebase Auth and Firestore REST API.
## Usage: Add this script as an 'AxiomBridge' Autoload in Project Settings.

# CONFIGURATION
const PROJECT_ID = "studio-5485353702-8ce01"
const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"

# STATE
var auth_token: String = ""
var refresh_token: String = ""
var local_id: String = ""
var user_email: String = ""

# SIGNALS
signal login_successful(user_data)
signal login_failed(error_message)
signal data_received(collection, data)
signal sync_completed(success)

func _ready():
	print("[AXIOM_BRIDGE] Initialized. Protocol: REST_V1")

## 1. AUTHENTICATION
func connect_to_matrix(email: String, password: String):
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
	var payload = {
		"email": email,
		"password": password,
		"returnSecureToken": true
	}
	_send_request(url, HTTPClient.METHOD_POST, JSON.stringify(payload), "_on_auth_completed")

func _on_auth_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		auth_token = json["idToken"]
		refresh_token = json["refreshToken"]
		local_id = json["localId"]
		user_email = json["email"]
		print("[AXIOM_BRIDGE] Link established for user: ", user_email)
		login_successful.emit(json)
	else:
		var err = json.get("error", {}).get("message", "UNKNOWN_PROTOCOL_ERROR")
		login_failed.emit(err)

## 2. FIRESTORE SYNC
func get_agent_data(player_id: String = ""):
	if player_id == "": player_id = local_id
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + player_id
	_send_request(url, HTTPClient.METHOD_GET, "", "_on_data_received")

func update_agent_position(x: float, y: float, z: float):
	if auth_token == "": return
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id + "?updateMask.fieldPaths=position&updateMask.fieldPaths=lastUpdate"
	var payload = {
		"fields": {
			"position": {
				"mapValue": {
					"fields": {
						"x": {"doubleValue": x},
						"y": {"doubleValue": y},
						"z": {"doubleValue": z}
					}
				}
			},
			"lastUpdate": {"timestampValue": Time.get_datetime_string_from_system(true) + "Z"}
		}
	}
	_send_request(url, HTTPClient.METHOD_PATCH, JSON.stringify(payload), "_on_sync_completed", true)

func _on_data_received(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		data_received.emit("players", json)
	else:
		print("[AXIOM_BRIDGE] Data fetch failed: ", response_code)

func _on_sync_completed(result, response_code, headers, body):
	sync_completed.emit(response_code == 200)

## 3. INTERNAL HELPERS
func _send_request(url: String, method: int, body: String, callback: String, use_auth: bool = false):
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(self[callback])
	
	var headers = ["Content-Type: application/json"]
	if use_auth:
		headers.append("Authorization: Bearer " + auth_token)
		
	http.request(url, headers, method, body)
	# Cleanup node after call? Better to reuse, but for bridge simplicity we spawn.
	await http.request_completed
	http.queue_free()
