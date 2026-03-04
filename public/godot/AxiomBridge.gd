extends Node

# Axiom Frontier - Godot Bridge Protocol v1.0.4
# Pure GDScript implementation for Firebase Auth & Firestore REST
# No external plugins required. Just add this as an Autoload.

const PROJECT_ID = "studio-5485353702-8ce01"
const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"

var auth_token = ""
var refresh_token = ""
var user_id = ""

signal auth_complete(success, message)
signal data_received(collection, data)

func connect_to_matrix(email, password):
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
	var body = JSON.stringify({
		"email": email,
		"password": password,
		"returnSecureToken": true
	})
	_make_request(url, body, "_on_auth_response")

func _on_auth_response(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		auth_token = json.idToken
		refresh_token = json.refreshToken
		user_id = json.localId
		emit_signal("auth_complete", true, "Session Materialized")
	else:
		var err_msg = "Unknown Protocol Error"
		if json.has("error"): err_msg = json.error.message
		emit_signal("auth_complete", false, err_msg)

func get_player_data():
	if user_id == "": return
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + user_id
	_make_request(url, "", "_on_data_response", HTTPClient.METHOD_GET)

func _on_data_response(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		emit_signal("data_received", "players", json)

func _make_request(url, body, callback, method = HTTPClient.METHOD_POST):
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(Callable(self, callback))
	
	var headers = ["Content-Type: application/json"]
	if auth_token != "":
		headers.append("Authorization: Bearer " + auth_token)
	
	http.request(url, headers, method, body)
