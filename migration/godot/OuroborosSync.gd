extends Node3D

# --- OUROBOROS AUTO-SYNC MANAGER ---
# Dieses Script verbindet Godot automatisch mit deinem Firebase-Backend.

var player_id = ""
var world_state = {}
var entity_nodes = {}

@export var entity_scene: PackedScene

func _ready():
	# 1. Firebase initialisieren (GodotFirebase Plugin muss installiert sein)
	Firebase.Auth.login_anonymous()
	Firebase.Auth.login_succeeded.connect(_on_login_success)
	
	# 2. Auf Echtzeit-Welt-Pulse hören
	var rtdb_ref = Firebase.Database.get_ref("live_world")
	rtdb_ref.on_value_changed.connect(_on_world_tick)

func _on_login_success(auth):
	player_id = auth.localid
	print("Verbunden mit Ouroboros Firebase als: ", player_id)
	
	# Initialen Welt-Status aus Firestore laden
	var firestore_doc = Firebase.Firestore.collection("world_state").doc("current")
	firestore_doc.get_doc()
	firestore_doc.get_document_finished.connect(_on_state_loaded)

func _on_state_loaded(doc):
	world_state = doc.doc_fields
	print("Welt-Status geladen. Tick: ", world_state.get("tick", 0))
	_apply_world_state(world_state)

func _on_world_tick(data):
	# Läuft jede Minute, wenn der Firebase-Heartbeat auslöst
	world_state = data.data
	print("Welt-Heartbeat empfangen. Tick: ", world_state.get("tick", 0))
	_apply_world_state(world_state)

func _apply_world_state(state: Dictionary):
	if not state.has("entities"):
		return

	# Entities als Liste behandeln (RenderEntity Array)
	var entities = state.get("entities", [])
	if entities is Array:
		for entity in entities:
			var entity_id = entity.get("id", "unbekannt")
			_ensure_entity_exists(entity_id)
			_update_entity_transform(entity_id, entity)
	# Entities als Dictionary behandeln (Legacy-Support)
	elif state.entities is Dictionary:
		for entity_id in state.entities.keys():
			var entity = state.entities[entity_id]
			_ensure_entity_exists(entity_id)
			_update_entity_transform(entity_id, entity)

func _ensure_entity_exists(entity_id: String):
	if entity_nodes.has(entity_id):
		return

	if entity_scene == null:
		push_warning("Keine entity_scene zugewiesen. Kann Welt-Entities nicht rendern.")
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
	# Hochgeschwindigkeits-Positions-Sync
	var pos_ref = Firebase.Database.get_ref("live_positions/" + player_id)
	pos_ref.update({"x": pos.x, "y": pos.y, "z": pos.z})

func request_ai_quest():
	# Firebase Cloud Function aufrufen
	var function = Firebase.Functions.get_function("generateGameContent")
	function.execute({"type": "quest", "context": world_state})
	function.function_executed.connect(_on_quest_received)

func _on_quest_received(result):
	print("Neue KI Quest generiert: ", result)
