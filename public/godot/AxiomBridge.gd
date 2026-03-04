extends Node
# @fileOverview AxiomBridge.gd
# Standard-Library-only Firebase Bridge for Godot 4.x
# No plugins required. Drop into Autoload as 'AxiomBridge'.

const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID = "studio-5485353702-8ce01"

var auth_token = ""
var refresh_token = ""
var local_id = ""
var player_data = {}

signal matrix_connected
signal sync_complete(data)
signal auth_error(msg)

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

func _on_login_completed(result, response_code, headers, body):
	var response = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		auth_token = response["idToken"]
		refresh_token = response["refreshToken"]
		local_id = response["localId"]
		emit_signal("matrix_connected")
		pull_neural_signature()
	else:
		emit_signal("auth_error", response.get("error", {}).get("message", "Unknown Auth Failure"))

func pull_neural_signature():
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_pull_completed)
	http.request(url, ["Authorization: Bearer " + auth_token], HTTPClient.METHOD_GET)

func _on_pull_completed(result, response_code, headers, body):
	var response = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		# Convert Firestore fields to usable Dictionary
		var fields = response.get("fields", {})
		player_data = _flatten_firestore(fields)
		emit_signal("sync_complete", player_data)
	else:
		print("[AxiomBridge] Sync Error: ", body.get_string_from_utf8())

func push_neural_update(patch: Dictionary):
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id + "?updateMask.fieldPaths=" + ",".join(patch.keys())
	var body = JSON.stringify({"fields": _wrap_firestore(patch)})
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request(url, ["Authorization: Bearer " + auth_token, "Content-Type: application/json"], HTTPClient.METHOD_PATCH, body)

func _flatten_firestore(fields):
	var flat = {}
	for key in fields:
		var val_obj = fields[key]
		if "stringValue" in val_obj: flat[key] = val_obj["stringValue"]
		elif "integerValue" in val_obj: flat[key] = int(val_obj["integerValue"])
		elif "doubleValue" in val_obj: flat[key] = float(val_obj["doubleValue"])
		elif "booleanValue" in val_obj: flat[key] = val_obj["booleanValue"]
		elif "mapValue" in val_obj: flat[key] = _flatten_firestore(val_obj["mapValue"].get("fields", {}))
	return flat

func _wrap_firestore(dict):
	var wrapped = {}
	for key in dict:
		var val = dict[key]
		if typeof(val) == TYPE_STRING: wrapped[key] = {"stringValue": val}
		elif typeof(val) == TYPE_INT: wrapped[key] = {"integerValue": str(val)}
		elif typeof(val) == TYPE_FLOAT: wrapped[key] = {"doubleValue": val}
		elif typeof(val) == TYPE_BOOL: wrapped[key] = {"booleanValue": val}
	return wrapped
