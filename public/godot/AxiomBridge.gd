extends Node

# AXIOM FRONTIER - THE ONE-FILE BRIDGE (V1.0.6)
# Just add this script as an 'Autoload' named 'AxiomBridge' in your Godot project.

# --- CONFIGURATION ---
const FIREBASE_API_KEY: String = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID: String = "studio-5485353702-8ce01"

# --- INTERNAL STATE ---
var auth_token: String = ""
var refresh_token: String = ""
var local_id: String = "" # The User UID
var player_data: Dictionary = {}

signal login_successful
signal login_failed(reason)
signal data_received(data)
signal data_updated

# --- AUTHENTICATION ---

func connect_to_matrix(email: String, password: String):
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + FIREBASE_API_KEY
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
		auth_token = json["idToken"]
		refresh_token = json["refreshToken"]
		local_id = json["localId"]
		emit_signal("login_successful")
		sync_player_data()
	else:
		var error_msg = json["error"]["message"] if json.has("error") else "Unknown connection error"
		emit_signal("login_failed", error_msg)

# --- FIRESTORE SYNC ---

func sync_player_data():
	if local_id == "": return
	
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_data_received)
	http.request(url, ["Authorization: Bearer " + auth_token], HTTPClient.METHOD_GET)

func _on_data_received(_result, response_code, _headers, body):
	if response_code == 200:
		var json = JSON.parse_string(body.get_string_from_utf8())
		player_data = _parse_firestore_doc(json["fields"])
		emit_signal("data_received", player_data)
	else:
		print("[AXIOM_ERROR] Failed to fetch player data: ", response_code)

func update_matrix_state(new_fields: Dictionary):
	if local_id == "" or auth_token == "": return
	
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id + "?updateMask.fieldPaths=position&updateMask.fieldPaths=hp"
	var body = { "fields": _convert_to_firestore_fields(new_fields) }
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(_r, code, _h, _b): if code == 200: emit_signal("data_updated"))
	http.request(url, [
		"Authorization: Bearer " + auth_token,
		"Content-Type: application/json"
	], HTTPClient.METHOD_PATCH, JSON.stringify(body))

# --- UTILS ---

func _parse_firestore_doc(fields: Dictionary) -> Dictionary:
	var result = {}
	for key in fields.keys():
		var val_obj = fields[key]
		if val_obj.has("stringValue"): result[key] = val_obj["stringValue"]
		elif val_obj.has("integerValue"): result[key] = int(val_obj["integerValue"])
		elif val_obj.has("doubleValue"): result[key] = float(val_obj["doubleValue"])
		elif val_obj.has("booleanValue"): result[key] = val_obj["booleanValue"]
		elif val_obj.has("mapValue"): result[key] = _parse_firestore_doc(val_obj["mapValue"]["fields"])
	return result

func _convert_to_firestore_fields(data: Dictionary) -> Dictionary:
	var fields = {}
	for key in data.keys():
		var val = data[key]
		if typeof(val) == TYPE_STRING: fields[key] = {"stringValue": val}
		elif typeof(val) == TYPE_INT: fields[key] = {"integerValue": str(val)}
		elif typeof(val) == TYPE_FLOAT: fields[key] = {"doubleValue": val}
		elif typeof(val) == TYPE_BOOL: fields[key] = {"booleanValue": val}
		elif typeof(val) == TYPE_DICTIONARY: fields[key] = {"mapValue": {"fields": _convert_to_firestore_fields(val)}}
	return fields
