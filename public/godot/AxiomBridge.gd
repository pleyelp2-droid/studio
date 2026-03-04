extends Node
# @fileOverview Axiom Frontier - Godot Bridge Protocol v1.0.6
# Handles Firebase Auth and Firestore REST Sync without plugins.

const PROJECT_ID = "studio-5485353702-8ce01"
const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"

var auth_token = ""
var user_id = ""
var http_client = HTTPClient.new()

signal matrix_connected
signal matrix_sync_complete(data)

func _ready():
	print("[AXIOM_BRIDGE] Protocol Initialized.")

func connect_to_matrix(email, password):
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
	var body = JSON.stringify({
		"email": email,
		"password": password,
		"returnSecureToken": true
	})
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_auth_completed)
	http.request(url, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

func _on_auth_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		auth_token = json.idToken
		user_id = json.localId
		print("[AXIOM_BRIDGE] Neural Link Established: ", user_id)
		emit_signal("matrix_connected")
		sync_player_data()
	else:
		print("[AXIOM_BRIDGE] Authentication Failed: ", json.error.message)

func sync_player_data():
	if auth_token == "": return
	
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + user_id
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_sync_completed)
	http.request(url, ["Authorization: Bearer " + auth_token])

func _on_sync_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		print("[AXIOM_BRIDGE] Matrix Sync Success.")
		emit_signal("matrix_sync_complete", json)
	else:
		print("[AXIOM_BRIDGE] Sync Error: ", response_code)

func commit_to_ledger(data_dict: Dictionary):
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + user_id + "?updateMask.fieldPaths=position&updateMask.fieldPaths=lastUpdate"
	# REST API requires structured Firestore JSON, for simplicity we use a helper in a full version
	# This bridge demonstrates the connectivity.
	print("[AXIOM_BRIDGE] Committing to permanent ledger...")
