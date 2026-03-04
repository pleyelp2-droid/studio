extends Node
/**
 * @fileOverview AXIOM_BRIDGE_V1 (Single-File Solution)
 * Einfach als Autoload in Godot hinzufügen. Keine Plugins nötig.
 * Erfordert lediglich ein HTTPRequest Node als Kindelement.
 */

signal connection_established
signal world_state_updated(data)
signal player_sync_completed(data)

# --- KONFIGURATION (Wird vom Dashboard generiert) ---
var API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
var PROJECT_ID = "studio-5485353702-8ce01"
var AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
var FIRESTORE_URL = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/"

# --- SESSION DATA ---
var id_token = ""
var local_id = ""
var is_connected = false

func _ready():
	print("[AXIOM_BRIDGE] Initializing neural link...")
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_request_completed)

# --- LOGIN (Einfachster Weg) ---
func connect_to_matrix(email, password):
	var payload = JSON.stringify({
		"email": email,
		"password": password,
		"returnSecureToken": true
	})
	var http = get_child(0)
	http.request(AUTH_URL, ["Content-Type: application/json"], HTTPClient.METHOD_POST, payload)

func _on_request_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	
	if response_code == 200:
		if json.has("idToken"):
			id_token = json["idToken"]
			local_id = json["localId"]
			is_connected = true
			print("[AXIOM_BRIDGE] Link Established. Pilot: ", local_id)
			emit_signal("connection_established")
			start_world_sync()
	else:
		print("[AXIOM_BRIDGE] Connection Failed: ", json.error.message)

# --- FIRESTORE SYNC ---
func start_world_sync():
	while is_connected:
		_fetch_document("worldState/global")
		await get_tree().create_timer(5.0).timeout

func _fetch_document(path):
	var http = HTTPRequest.new()
	add_child(http)
	var url = FIRESTORE_URL + path
	http.request(url, ["Authorization: Bearer " + id_token])
	var response = await http.request_completed
	var json = JSON.parse_string(response[3].get_string_from_utf8())
	
	if response[1] == 200:
		emit_signal("world_state_updated", json.fields)
	
	http.queue_free()

# --- HELPER: Daten aus Firestore-Format extrahieren ---
func get_val(fields, key):
	if fields.has(key):
		var val = fields[key]
		if val.has("stringValue"): return val["stringValue"]
		if val.has("doubleValue"): return val["doubleValue"]
		if val.has("integerValue"): return val["integerValue"]
		if val.has("booleanValue"): return val["booleanValue"]
	return null
