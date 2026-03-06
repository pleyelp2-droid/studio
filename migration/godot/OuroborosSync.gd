extends Node3D

# --- OUROBOROS AUTO-SYNC MANAGER ---
# Handles real-time entity instancing and synchronization between Firebase and Godot.

var player_id = ""
var world_state = {}
var entity_nodes = {}

@export var entity_scene: PackedScene

func _ready():
	# 1. Initialize Firebase (Ensure GodotFirebase plugin is installed)
	Firebase.Auth.login_anonymous()
	Firebase.Auth.login_succeeded.connect(_on_login_success)
	
	# 2. Listen to Realtime World Pulse
	var rtdb_ref = Firebase.Database.get_ref("live_world")
	rtdb_ref.on_value_changed.connect(_on_world_tick)

func _on_login_success(auth):
	player_id = auth.localid
	print("Connected to Ouroboros Firebase as: ", player_id)
	
	# Load initial world state from Firestore
	var firestore_doc = Firebase.Firestore.collection("world_state").doc("current")
	firestore_doc.get_doc()
	firestore_doc.get_document_finished.connect(_on_state_loaded)

func _on_state_loaded(doc):
	world_state = doc.doc_fields
	print("World State Loaded. Tick: ", world_state.get("tick", 0))
	_apply_world_state(world_state)

func _on_world_tick(data):
	# This runs when the RTDB value changes
	world_state = data.data
	print("World Heartbeat received. Tick: ", world_state.get("tick", 0))
	_apply_world_state(world_state)

func _apply_world_state(state: Dictionary):
	if not state.has("entities"):
		return

	# Handle both dictionary and array entity formats
	var entities = state.entities
	if entities is Array:
		for entity in entities:
			if entity.has("id"):
				_ensure_entity_exists(entity.id)
				_update_entity_transform(entity.id, entity)
	elif entities is Dictionary:
		for entity_id in entities.keys():
			var entity = entities[entity_id]
			_ensure_entity_exists(entity_id)
			_update_entity_transform(entity_id, entity)

func _ensure_entity_exists(entity_id: String):
	if entity_nodes.has(entity_id):
		return

	if entity_scene == null:
		push_warning("No entity_scene assigned. Cannot render world entities.")
		return

	var node = entity_scene.instantiate()
	node.name = entity_id
	add_child(node)
	entity_nodes[entity_id] = node

func _update_entity_transform(entity_id: String, entity: Dictionary):
	if not entity_nodes.has(entity_id):
		return
	if not entity.has("position"):
		return

	var pos = entity["position"]
	entity_nodes[entity_id].global_position = Vector3(
		pos.get("x", 0.0),
		pos.get("y", 0.0),
		pos.get("z", 0.0)
	)

func sync_position(pos: Vector3):
	# High-speed position sync to RTDB
	var pos_ref = Firebase.Database.get_ref("live_positions/" + player_id)
	pos_ref.update({"x": pos.x, "y": pos.y, "z": pos.z})

func request_ai_quest():
	# Call the Firebase Cloud Function
	var function = Firebase.Functions.get_function("generateGameContent")
	function.execute({"type": "quest", "context": world_state})
	function.function_executed.connect(_on_quest_received)

func _on_quest_received(result):
	print("New AI Quest generated: ", result)