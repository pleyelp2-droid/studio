extends Node

# Axiom Frontier - Godot Bridge Protocol v1.0.0
# Eine einzige Datei für Auth, Firestore & Realtime-Sync.
# Setup: Als "Autoload" in Godot unter Projekt-Einstellungen hinzufügen.

const API_KEY: String = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID: String = "studio-5485353702-8ce01"

var auth_token: String = ""
var user_id: String = ""
var is_connected: bool = false

signal on_auth_result(success, message)
signal on_data_update(path, data)

# 1. AUTHENTIFIZIERUNG
func connect_to_matrix(email: String, pass: String):
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + API_KEY
	var body = JSON.stringify({
		"email": email,
		"password": pass,
		"returnSecureToken": true
	})
	
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_auth_completed.bind(http))
	http.request(url, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

func _on_auth_completed(result, response_code, headers, body, http_node):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		auth_token = json["idToken"]
		user_id = json["localId"]
		is_connected = true
		on_auth_result.emit(true, "Neural Link Established")
	else:
		on_auth_result.emit(false, json.get("error", {}).get("message", "Unknown Error"))
	http_node.queue_free()

# 2. FIRESTORE DATEN LESEN
func get_doc(path: String):
	var url = "https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/%s" % [PROJECT_ID, path]
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_doc_received.bind(http, path))
	
	var headers = []
	if auth_token != "":
		headers.append("Authorization: Bearer " + auth_token)
		
	http.request(url, headers, HTTPClient.METHOD_GET)

func _on_doc_received(result, response_code, headers, body, http_node, path):
	if response_code == 200:
		var json = JSON.parse_string(body.get_string_from_utf8())
		# Firestore liefert Daten in einem speziellen 'fields' Format. 
		# Diese Bridge könnte hier eine automatische Konvertierung machen.
		on_data_update.emit(path, json)
	http_node.queue_free()

# 3. SPIELER-POSITION AKTUALISIEREN (WRITE)
func update_player_pos(x: float, y: float, z: float):
	if not is_connected: return
	
	var url = "https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/players/%s?updateMask.fieldPaths=position" % [PROJECT_ID, user_id]
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
	http.request(url, ["Authorization: Bearer " + auth_token, "Content-Type: application/json"], HTTPClient.METHOD_PATCH, body)
	http.request_completed.connect(func(r, rc, h, b): http.queue_free())