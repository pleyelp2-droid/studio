extends Node
/**
 * @fileOverview AxiomBridge.gd - Single File Firebase Solution
 * Handles Authentication and Firestore Sync via Pure GDScript (HTTP).
 * 
 * INSTRUCTIONS:
 * 1. Add this script as an Autoload named 'AxiomBridge'.
 * 2. Call connect_to_matrix(email, password) to login.
 */

const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID = "studio-5485353702-8ce01"

var auth_token = ""
var user_id = ""
var http_auth: HTTPRequest
var http_firestore: HTTPRequest

signal matrix_connected(uid)
signal sync_completed(data)
signal error_occurred(message)

func _ready():
	http_auth = HTTPRequest.new()
	http_firestore = HTTPRequest.new()
	add_child(http_auth)
	add_child(http_firestore)
	http_auth.request_completed.connect(_on_auth_completed)
	http_firestore.request_completed.connect(_on_firestore_completed)

func connect_to_matrix(email, password):
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
	var body = JSON.stringify({
		"email": email,
		"password": password,
		"returnSecureToken": true
	})
	var headers = ["Content-Type: application/json"]
	http_auth.request(url, headers, HTTPClient.METHOD_POST, body)

func commit_to_ledger(collection: String, doc_id: String, fields: Dictionary):
	if auth_token == "":
		emit_signal("error_occurred", "Not authenticated")
		return
		
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/" + collection + "/" + doc_id + "?updateMask.fieldPaths=lastUpdate"
	for key in fields.keys():
		url += "&updateMask.fieldPaths=" + key
		
	var formatted_fields = {}
	for key in fields.keys():
		var val = fields[key]
		if typeof(val) == TYPE_STRING: formatted_fields[key] = {"stringValue": val}
		elif typeof(val) == TYPE_FLOAT or typeof(val) == TYPE_INT: formatted_fields[key] = {"doubleValue": val}
		elif typeof(val) == TYPE_BOOL: formatted_fields[key] = {"booleanValue": val}
	
	var body = JSON.stringify({"fields": formatted_fields})
	var headers = [
		"Content-Type: application/json",
		"Authorization: Bearer " + auth_token
	]
	http_firestore.request(url, headers, HTTPClient.METHOD_PATCH, body)

func _on_auth_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		auth_token = json.idToken
		user_id = json.localId
		emit_signal("matrix_connected", user_id)
		print("[AXIOM_BRIDGE] Connection established: ", user_id)
	else:
		emit_signal("error_occurred", json.error.message)

func _on_firestore_completed(result, response_code, headers, body):
	if response_code == 200:
		emit_signal("sync_completed", JSON.parse_string(body.get_string_from_utf8()))
	else:
		print("[AXIOM_BRIDGE] Firestore Sync Error: ", response_code)
