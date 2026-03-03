extends Node

# Ouroboros Firebase Connector
# Handles authentication and initial connection parameters.

var api_key: String = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
var project_id: String = "studio-5485353702-8ce01"

func _ready():
	print("Ouroboros: Initializing Firebase Connection...")
	# If using the Godot-Firebase plugin, it typically reads from project settings.
	# If manual, you would initialize your HTTP requests here.
	if Engine.has_meta("Firebase"):
		print("Ouroboros: Firebase Plugin Detected.")
	else:
		print("Ouroboros: Warning - Firebase Plugin not found in project.")

func get_auth_config() -> Dictionary:
	return {
		"apiKey": api_key,
		"authDomain": project_id + ".firebaseapp.com",
		"projectId": project_id
	}
