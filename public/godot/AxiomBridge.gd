extends Node

# Axiom Frontier - Unified Single-File Bridge for Godot
# Handles Firebase Authentication and Firestore synchronization via REST API.
# Add this script as an Autoload named 'AxiomBridge'.

const PROJECT_ID = "studio-5485353702-8ce01"
const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"

var id_token: String = ""
var local_id: String = ""
var refresh_token: String = ""

signal login_success(uid)
signal login_failed(error)
signal data_synced

# Call this to initiate the neural link
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
	var err = http.request(url, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)
	if err != OK:
		login_failed.emit("Request Error")

func _on_login_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		id_token = json["idToken"]
		local_id = json["localId"]
		refresh_token = json["refreshToken"]
		login_success.emit(local_id)
		print("[AXIOM_BRIDGE] Neural link established for: ", local_id)
	else:
		var err_msg = "Unknown Auth Error"
		if json and json.has("error"):
			err_msg = json["error"]["message"]
		login_failed.emit(err_msg)
		print("[AXIOM_BRIDGE] Link failed: ", err_msg)

# Synchronize local Godot data to the React dashboard (Firestore)
func sync_agent_data(data: Dictionary):
	if id_token == "": 
		print("[AXIOM_BRIDGE] Sync aborted: Not authenticated.")
		return
	
	var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/players/" + local_id + "?updateMask.fieldPaths=position&updateMask.fieldPaths=hp&updateMask.fieldPaths=lastUpdate"
	
	# Mapping basic types to Firestore JSON structure
	var fields = {}
	for key in data.keys():
		var val = data[key]
		if typeof(val) == TYPE_FLOAT or typeof(val) == TYPE_INT:
			fields[key] = {"doubleValue": val}
		elif typeof(val) == TYPE_STRING:
			fields[key] = {"stringValue": val}
		elif typeof(val) == TYPE_DICTIONARY:
			# Simple nested mapping for position {x, y, z}
			var map_val = {}
			for sub_k in val.keys():
				map_val[sub_k] = {"doubleValue": val[sub_k]}
			fields[key] = {"mapValue": {"fields": map_val}}
	
	var body = JSON.stringify({"fields": fields})
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(res, code, head, b): 
		data_synced.emit()
		http.queue_free()
	)
	http.request(url + "&key=" + API_KEY, ["Authorization: Bearer " + id_token, "Content-Type: application/json"], HTTPClient.METHOD_PATCH, body)
