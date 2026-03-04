extends Node

# Axiom Frontier - Universal Godot Bridge
# Handles Authentication and Firestore Sync via Pure GDScript (HTTP)

const PROJECT_ID = "studio-5485353702-8ce01"
const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"

var auth_token: String = ""
var refresh_token: String = ""
var local_id: String = ""

signal connection_established(pilot_id)
signal matrix_sync_received(data)
signal error_detected(message)

func _ready():
	print("[AXIOM_BRIDGE] Initialized. Ready for neural handshake.")

# --- AUTHENTICATION ---

func connect_to_matrix(email: String, pass: String):
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
	var body = JSON.stringify({
		"email": email,
		"password": pass,
		"returnSecureToken": true
	})
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_login_completed)
	http.request(url, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

func _on_login_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		auth_token = json["idToken"]
		refresh_token = json["refreshToken"]
		local_id = json["localId"]
		print("[AXIOM_BRIDGE] Link established. ID: ", local_id)
		connection_established.emit(local_id)
		start_matrix_sync()
	else:
		var error_msg = json["error"]["message"] if json.has("error") else "Unknown connection failure"
		error_detected.emit(error_msg)

# --- FIRESTORE SYNC ---

func start_matrix_sync():
	sync_player_data()
	sync_world_state()

func sync_player_data():
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_player_sync_completed)
	http.request(url, ["Authorization: Bearer " + auth_token], HTTPClient.METHOD_GET)

func _on_player_sync_completed(result, response_code, headers, body):
	if response_code == 200:
		var data = JSON.parse_string(body.get_string_from_utf8())
		var fields = data.get("fields", {})
		matrix_sync_received.emit(fields)
	else:
		print("[AXIOM_BRIDGE] Sync failed: ", response_code)

func update_matrix_position(pos: Vector3):
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id + "?updateMask.fieldPaths=position"
	var body = JSON.stringify({
		"fields": {
			"position": {
				"mapValue": {
					"fields": {
						"x": {"doubleValue": pos.x},
						"y": {"doubleValue": pos.y},
						"z": {"doubleValue": pos.z}
					}
				}
			}
		}
	})
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request(url, ["Authorization: Bearer " + auth_token, "Content-Type: application/json"], HTTPClient.METHOD_PATCH, body)

func sync_world_state():
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/worldState/global"
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_world_sync_completed)
	http.request(url, [], HTTPClient.METHOD_GET)

func _on_world_sync_completed(result, response_code, headers, body):
	if response_code == 200:
		var data = JSON.parse_string(body.get_string_from_utf8())
		print("[AXIOM_BRIDGE] World State synchronized.")
	else:
		print("[AXIOM_BRIDGE] World sync failed.")
