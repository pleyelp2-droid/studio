extends Node

## Ouroboros Axiom Bridge - Single File Solution
## Handles Firebase Auth and Firestore REST Synchronization for Godot.

const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID = "studio-5485353702-8ce01"

var auth_token = ""
var user_id = ""
var http_client = HTTPRequest.new()

signal matrix_connected(uid)
signal matrix_error(msg)

func _ready():
	add_child(http_client)
	http_client.request_completed.connect(_on_request_completed)

func connect_to_matrix(email, password):
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
	var body = JSON.stringify({
		"email": email,
		"password": password,
		"returnSecureToken": true
	})
	var headers = ["Content-Type: application/json"]
	http_client.request(url, headers, HTTPClient.METHOD_POST, body)

func sync_player_data(data: Dictionary):
	if auth_token == "": 
		push_error("Not authenticated with Matrix.")
		return
		
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + user_id + "?updateMask.fieldPaths=position&updateMask.fieldPaths=lastUpdate"
	
	# Mapping Godot Dictionary to Firestore REST Fields
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
		"lastUpdate": {"timestampValue": Time.get_datetime_string_from_system() + "Z"}
	}
	
	var body = JSON.stringify({"fields": fields})
	var headers = ["Authorization: Bearer " + auth_token, "Content-Type: application/json"]
	http_client.request(url, headers, HTTPClient.METHOD_PATCH, body)

func _on_request_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		if json.has("idToken"):
			auth_token = json["idToken"]
			user_id = json["localId"]
			matrix_connected.emit(user_id)
			print("[MATRIX] Connection Established: ", user_id)
	else:
		var err_msg = json.get("error", {}).get("message", "Unknown Error")
		matrix_error.emit(err_msg)
		push_error("[MATRIX] Protocol Error: ", err_msg)
