extends Node

# --- OUROBOROS AUTO-SYNC MANAGER ---
# This script connects Godot to your Firebase Backend automatically.

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
	# This runs every minute when the Firebase Heartbeat triggers
	world_state = data.data
	print("World Heartbeat received. Tick: ", world_state.get("tick", 0))
	_apply_world_state(world_state)

func _apply_world_state(state: Dictionary):
	if not state.has("entities"):
		return

	for entity_id in state.entities.keys():
		var entity = state.entities[entity_id]
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

	var position = entity["position"]
	entity_nodes[entity_id].global_position = Vector3(
		position.get("x", 0.0),
		position.get("y", 0.0),
		position.get("z", 0.0)
	)

func sync_position(pos: Vector3):
	# High-speed position sync
	var pos_ref = Firebase.Database.get_ref("live_positions/" + player_id)
	pos_ref.update({"x": pos.x, "y": pos.y, "z": pos.z})

func request_ai_quest():
	# Call the Firebase Cloud Function
	var function = Firebase.Functions.get_function("generateGameContent")
	function.execute({"type": "quest", "context": world_state})
	function.function_executed.connect(_on_quest_received)

func _on_quest_received(result):
	print("New AI Quest generated: ", result)