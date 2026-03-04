extends Node

# Axiom Frontier - One-File Firebase Bridge
# Pre-configured for your project environment.

const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID = "studio-5485353702-8ce01"

var id_token = ""
var local_id = ""
var refresh_token = ""

signal auth_completed(success, message)
signal data_received(collection, data)

func connect_to_matrix(email, password):
	var auth_url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
	var body = JSON.stringify({
		"email": email,
		"password": password,
		"returnSecureToken": true
	})
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_auth_request_completed)
	var err = http.request(auth_url, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)
	if err != OK:
		auth_completed.emit(false, "Failed to initiate request.")

func _on_auth_request_completed(result, response_code, headers, body):
	var response = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		id_token = response["idToken"]
		local_id = response["localId"]
		refresh_token = response["refreshToken"]
		auth_completed.emit(true, "Synchronized with Matrix.")
	else:
		var err_msg = "Auth Failure"
		if response and response.has("error"):
			err_msg = response["error"]["message"]
		auth_completed.emit(false, err_msg)

func get_player_data():
	if id_token == "": return
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(r, rc, h, b): 
		if rc == 200:
			var data = JSON.parse_string(b.get_string_from_utf8())
			data_received.emit("players", data)
	)
	http.request(url, ["Authorization: Bearer " + id_token], HTTPClient.METHOD_GET)

func get_world_state():
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/worldState/global"
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(r, rc, h, b): 
		if rc == 200:
			data_received.emit("worldState", JSON.parse_string(b.get_string_from_utf8()))
	)
	http.request(url, [], HTTPClient.METHOD_GET)

func update_position(x, y, z):
	if id_token == "": return
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id + "?updateMask.fieldPaths=position"
	
	# Firestore JSON structure for doubleValue
	var body = JSON.stringify({
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
	})
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request(url, ["Authorization: Bearer " + id_token, "Content-Type: application/json"], HTTPClient.METHOD_PATCH, body)