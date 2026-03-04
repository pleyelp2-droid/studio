extends Node

## Axiom Frontier - One-File Bridge Protocol
## Handles Authentication and Firestore Sync via HTTP (No Plugins Required)

# --- CONFIGURATION ---
const PROJECT_ID = "studio-5485353702-8ce01"
const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"

# --- SIGNALS ---
signal auth_complete(user_data)
signal auth_failed(error_message)
signal data_received(collection, document_id, data)
signal data_error(error_message)

# --- INTERNAL STATE ---
var id_token: String = ""
var local_id: String = ""
var refresh_token: String = ""

var _http_auth: HTTPRequest
var _http_firestore: HTTPRequest

func _ready():
	# Initialize HTTP Nodes
	_http_auth = HTTPRequest.new()
	_http_firestore = HTTPRequest.new()
	add_child(_http_auth)
	add_child(_http_firestore)
	
	_http_auth.request_completed.connect(_on_auth_request_completed)
	_http_firestore.request_completed.connect(_on_firestore_request_completed)

# --- PUBLIC API ---

## Connect to the Ouroboros Matrix
func connect_to_matrix(email: String, password: String):
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
	var body = JSON.stringify({
		"email": email,
		"password": password,
		"returnSecureToken": true
	})
	var headers = ["Content-Type: application/json"]
	_http_auth.request(url, headers, HTTPClient.METHOD_POST, body)

## Get Player Data
func fetch_player_data(player_id: String):
	_firestore_get("players", player_id)

## Update Player Position
func update_position(player_id: String, x: float, y: float, z: float):
	var fields = {
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
	_firestore_patch("players", player_id, fields)

# --- PRIVATE HELPERS ---

func _firestore_get(collection: String, document: String):
	var url = "https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/%s/%s" % [PROJECT_ID, collection, document]
	var headers = ["Authorization: Bearer " + id_token]
	_http_firestore.request(url, headers, HTTPClient.METHOD_GET)

func _firestore_patch(collection: String, document: String, fields: Dictionary):
	var url = "https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/%s/%s?updateMask.fieldPaths=position" % [PROJECT_ID, collection, document]
	var headers = [
		"Authorization: Bearer " + id_token,
		"Content-Type: application/json"
	]
	var body = JSON.stringify({"fields": fields})
	_http_firestore.request(url, headers, HTTPClient.METHOD_PATCH, body)

func _on_auth_request_completed(result, response_code, headers, body):
	var response = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		id_token = response["idToken"]
		local_id = response["localId"]
		refresh_token = response["refreshToken"]
		auth_complete.emit(response)
		print("[AXIOM_BRIDGE] Connection Established: ", local_id)
	else:
		var err = response.get("error", {}).get("message", "Unknown Auth Error")
		auth_failed.emit(err)
		printerr("[AXIOM_BRIDGE] Auth Failed: ", err)

func _on_firestore_request_completed(result, response_code, headers, body):
	var response = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		# Simple parser for Firestore JSON format
		var data = _parse_firestore_document(response)
		data_received.emit("collection", response.name.split("/")[-1], data)
	else:
		data_error.emit(body.get_string_from_utf8())

func _parse_firestore_document(doc: Dictionary) -> Dictionary:
	var result = {}
	if not doc.has("fields"): return result
	
	for key in doc["fields"]:
		var field = doc["fields"][key]
		if field.has("stringValue"): result[key] = field["stringValue"]
		elif field.has("doubleValue"): result[key] = field["doubleValue"]
		elif field.has("integerValue"): result[key] = int(field["integerValue"])
		elif field.has("booleanValue"): result[key] = field["booleanValue"]
		elif field.has("mapValue"): result[key] = _parse_firestore_document(field["mapValue"])
	return result
