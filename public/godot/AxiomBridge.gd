extends Node
# @fileOverview Axiom Frontier - Godot Single-File Bridge
# Handshakes with Firebase Auth & Syncs with Firestore. No plugins needed.

const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID = "studio-5485353702-8ce01"

var id_token = ""
var local_id = ""
var player_data = {}

signal matrix_connected
signal sync_complete(success)

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
		id_token = json.idToken
		local_id = json.localId
		print("[AXIOM_BRIDGE] Link established. ID: ", local_id)
		matrix_connected.emit()
		fetch_player_profile()
	else:
		print("[AXIOM_BRIDGE] Handshake failed: ", json.error.message)

func fetch_player_profile():
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_profile_fetched)
	http.request(url, ["Authorization: Bearer " + id_token], HTTPClient.METHOD_GET)

func _on_profile_fetched(_result, response_code, _headers, body):
	if response_code == 200:
		var json = JSON.parse_string(body.get_string_from_utf8())
		player_data = json.fields
		print("[AXIOM_BRIDGE] Profile materialized: ", player_data.displayName.stringValue)
		sync_complete.emit(true)

func update_matrix_pos(x, y, z):
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id + "?updateMask.fieldPaths=position"
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