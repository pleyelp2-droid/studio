extends Node

# AxiomBridge.gd - Single-file Firebase Bridge for Godot
# Handles Authentication and Firestore REST Synchronization

const API_KEY = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
const PROJECT_ID = "studio-5485353702-8ce01"

var auth_token = ""
var user_id = ""

# Function to connect a pilot to the Ouroboros matrix
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
        print("[AXIOM_BRIDGE] Network initialization error.")

func _on_login_completed(_result, response_code, _headers, body):
    var json = JSON.parse_string(body.get_string_from_utf8())
    if response_code == 200:
        auth_token = json.idToken
        user_id = json.localId
        print("[AXIOM_BRIDGE] Neural link established. Pilot UID: ", user_id)
    else:
        var msg = json.error.message if json.has("error") else "Unknown Error"
        print("[AXIOM_BRIDGE] Handshake failed: ", msg)

# Function to sync any dictionary data to a Firestore document
func sync_world_data(collection_path, document_id, data_dict):
    if auth_token == "":
        print("[AXIOM_BRIDGE] Sync aborted: No active neural link.")
        return
        
    var url = "https://firestore.googleapis.com/v1/projects/" + PROJECT_ID + "/databases/(default)/documents/" + collection_path + "/" + document_id + "?updateMask.fieldPaths=lastUpdate"
    var fs_data = {"fields": _convert_to_fs_json(data_dict)}
    
    var http = HTTPRequest.new()
    add_child(http)
    http.request(url, ["Authorization: Bearer " + auth_token, "Content-Type: application/json"], HTTPClient.METHOD_PATCH, JSON.stringify(fs_data))

func _convert_to_fs_json(dict):
    var fs_fields = {}
    for key in dict:
        var val = dict[key]
        if typeof(val) == TYPE_STRING:
            fs_fields[key] = {"stringValue": val}
        elif typeof(val) == TYPE_INT or typeof(val) == TYPE_FLOAT:
            fs_fields[key] = {"doubleValue": float(val)}
        elif typeof(val) == TYPE_BOOL:
            fs_fields[key] = {"booleanValue": val}
        elif typeof(val) == TYPE_DICTIONARY:
            fs_fields[key] = {"mapValue": {"fields": _convert_to_fs_json(val)}}
    return fs_fields
