extends Node

# Axiom Frontier - Single File Godot Bridge
# Handles Firebase Auth and Firestore REST Synchronization

const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID = "studio-5485353702-8ce01"

var auth_token = ""
var refresh_token = ""
var local_id = ""

signal auth_complete(success, message)
signal sync_complete(success, data)

func connect_to_matrix(email, password):
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

func _on_login_completed(_result, response_code, _headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		auth_token = json.idToken
		refresh_token = json.refreshToken
		local_id = json.localId
		auth_complete.emit(true, "Synchronized with Ouroboros")
	else:
		auth_complete.emit(false, json.error.message)

func commit_pilot_state(data: Dictionary):
	if auth_token == "": return
	
	var url = "https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/players/%s?updateMask.fieldPaths=position&updateMask.fieldPaths=lastUpdate" % [PROJECT_ID, local_id]
	
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
		"lastUpdate": {"stringValue": Time.get_datetime_string_from_system(true) + "Z"}
	}
	
	var body = JSON.stringify({"fields": fields})
	var headers = [
		"Content-Type: application/json",
		"Authorization: Bearer " + auth_token
	]
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(r, rc, h, b): sync_complete.emit(rc == 200, b.get_string_from_utf8()))
	http.request(url, headers, HTTPClient.METHOD_PATCH, body)
