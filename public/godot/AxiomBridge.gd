extends Node

# AXIOM FRONTIER - GODOT BRIDGE PROTOCOL v1.0.0
# Add this script as an Autoload named 'AxiomBridge' in Project Settings.

const API_KEY: String = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID: String = "studio-5485353702-8ce01"

var id_token: String = ""
var refresh_token: String = ""
var local_id: String = ""
var is_connected: bool = false

signal connection_established
signal connection_failed(error_message)
signal data_synchronized(data)

# --- AUTHENTICATION ---

func connect_to_matrix(email: String, password: String) -> void:
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
	var body = JSON.stringify({
		"email": email,
		"password": password,
		"returnSecureToken": true
	})
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_login_completed)
	http.request(url, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

func _on_login_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		id_token = json["idToken"]
		refresh_token = json["refreshToken"]
		local_id = json["localId"]
		is_connected = true
		connection_established.emit()
		print("[AXIOM_BRIDGE] Link established for Pilot: ", local_id)
	else:
		var err = json.get("error", {}).get("message", "UNKNOWN_ERROR")
		connection_failed.emit(err)
		printerr("[AXIOM_BRIDGE] Connection refused: ", err)

# --- FIRESTORE SYNC ---

func sync_player_data(data: Dictionary) -> void:
	if not is_connected: return
	
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id + "?updateMask.fieldPaths=position&updateMask.fieldPaths=lastUpdate"
	
	# Firestore REST API requires specific field typing
	var fields = {
		"position": {
			"mapValue": {
				"fields": {
					"x": {"doubleValue": data.get("x", 0.0)},
					"y": {"doubleValue": data.get("y", 0.0)},
					"z": {"doubleValue": data.get("z", 0.0)}
				}
			}
		},
		"lastUpdate": {
			"timestampValue": Time.get_datetime_string_from_system() + "Z"
		}
	}
	
	var body = JSON.stringify({"fields": fields})
	var http = HTTPRequest.new()
	add_child(http)
	http.request(url, [
		"Content-Type: application/json",
		"Authorization: Bearer " + id_token
	], HTTPClient.METHOD_PATCH, body)

func get_world_state() -> void:
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/worldState/global"
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(r, c, h, b):
		if c == 200:
			var data = JSON.parse_string(b.get_string_from_utf8())
			data_synchronized.emit(data)
	)
	http.request(url, ["Authorization: Bearer " + id_token], HTTPClient.METHOD_GET)
