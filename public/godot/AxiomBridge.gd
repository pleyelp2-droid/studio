extends Node

# AXIOM FRONTIER - THE ONE FILE BRIDGE
# Simple GDScript implementation for direct Firebase Auth & Firestore synchronization.
# Version: 1.0.4 // Ouroboros Collective

# --- PROJECT CONFIGURATION ---
var api_key = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
var project_id = "studio-5485353702-8ce01"

# --- INTERNAL STATE ---
var id_token = ""
var local_id = ""
var refresh_token = ""

# --- ENDPOINTS ---
var auth_url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + api_key
var firestore_url = "https://firestore.googleapis.com/v1/projects/" + project_id + "/databases/(default)/documents/"

# --- SIGNALS ---
signal auth_complete(success, message)
signal data_received(path, data)
signal data_error(path, message)

func connect_to_matrix(email, password):
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_auth_completed)
	
	var body = JSON.stringify({
		"email": email,
		"password": password,
		"returnSecureToken": true
	})
	
	var headers = ["Content-Type: application/json"]
	var err = http.request(auth_url, headers, HTTPClient.METHOD_POST, body)
	if err != OK:
		auth_complete.emit(false, "Connection failure")

func _on_auth_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		id_token = json["idToken"]
		local_id = json["localId"]
		refresh_token = json.get("refreshToken", "")
		auth_complete.emit(true, "Synchronized")
	else:
		var err_msg = "Unknown Error"
		if json and json.has("error"):
			err_msg = json["error"]["message"]
		auth_complete.emit(false, err_msg)

# --- FIRESTORE METHODS ---

func get_player_data():
	_get_doc("players/" + local_id)

func update_player_pos(x, y, z):
	var data = {
		"fields": {
			"position": {
				"mapValue": {
					"fields": {
						"x": {"doubleValue": x},
						"y": {"doubleValue": y},
						"z": {"doubleValue": z}
					}
				}
			}
		}
	}
	_patch_doc("players/" + local_id, data)

# --- INTERNAL HELPERS ---

func _get_doc(path):
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(res, code, heads, body):
		var json = JSON.parse_string(body.get_string_from_utf8())
		if code == 200:
			data_received.emit(path, json)
		else:
			data_error.emit(path, "Status: " + str(code))
	)
	var headers = ["Authorization: Bearer " + id_token]
	http.request(firestore_url + path, headers, HTTPClient.METHOD_GET)

func _patch_doc(path, data):
	var http = HTTPRequest.new()
	add_child(http)
	var headers = ["Authorization: Bearer " + id_token, "Content-Type: application/json"]
	http.request(firestore_url + path + "?updateMask.fieldPaths=position", headers, HTTPClient.METHOD_PATCH, JSON.stringify(data))