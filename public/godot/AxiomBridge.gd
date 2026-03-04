extends Node

# AxiomBridge.gd - Single File Firebase Bridge for Godot
# Add this as an Autoload named 'AxiomBridge'

const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID = "studio-5485353702-8ce01"
const AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
const FIRESTORE_URL = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/"

var id_token = ""
var local_id = ""
var refresh_token = ""

signal auth_complete(success, message)
signal data_received(collection, data)

# Call this to establish the neural link
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
	http.request(AUTH_URL, headers, HTTPClient.METHOD_POST, body)

func _on_auth_completed(result, response_code, headers, body):
	var body_str = body.get_string_from_utf8()
	var json = JSON.parse_string(body_str)
	if response_code == 200:
		id_token = json.idToken
		local_id = json.localId
		refresh_token = json.refreshToken
		auth_complete.emit(true, "Synchronized")
		sync_player_data()
	else:
		var err_msg = "Auth Failed"
		if json and json.has("error"):
			err_msg = json.error.message
		auth_complete.emit(false, err_msg)

func sync_player_data():
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_player_data_received)
	
	var url = FIRESTORE_URL + "players/" + local_id
	var headers = ["Authorization: Bearer " + id_token]
	http.request(url, headers, HTTPClient.METHOD_GET)

func _on_player_data_received(result, response_code, headers, body):
	if response_code == 200:
		var json = JSON.parse_string(body.get_string_from_utf8())
		if json and json.has("fields"):
			var data = _parse_firestore_fields(json.fields)
			data_received.emit("players", data)

# Helper to recursively parse Firestore REST field format into a standard dictionary
func _parse_firestore_fields(fields):
	var result = {}
	for key in fields:
		var val_obj = fields[key]
		var val = null
		if val_obj.has("stringValue"): val = val_obj.stringValue
		elif val_obj.has("integerValue"): val = int(val_obj.integerValue)
		elif val_obj.has("doubleValue"): val = float(val_obj.doubleValue)
		elif val_obj.has("booleanValue"): val = val_obj.booleanValue
		elif val_obj.has("mapValue") and val_obj.mapValue.has("fields"): 
			val = _parse_firestore_fields(val_obj.mapValue.fields)
		result[key] = val
	return result