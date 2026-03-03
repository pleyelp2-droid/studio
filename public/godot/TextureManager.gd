extends Node

# TextureManager.gd
# Apply this to objects in your scene to react to the Civilization Index.

export(NodePath) var mesh_instance_path
onready var mesh_instance = get_node(mesh_instance_path)

func _ready():
	# Connect to the WorldSync signal
	WorldSync.connect("world_updated", self, "_on_world_updated")

func _on_world_updated(ci, tick):
	var era = WorldSync.era
	update_appearance(era)

func update_appearance(era: String):
	if !mesh_instance: return
	
	var mat = mesh_instance.get_surface_material(0)
	if !mat: return
	
	match era:
		"Primitive":
			mat.albedo_color = Color(0.6, 0.4, 0.2) # Dusty/Sand
		"Industrial":
			mat.albedo_color = Color(0.4, 0.4, 0.5) # Metallic/Iron
		"Chrome":
			mat.albedo_color = Color(0.2, 0.8, 1.0) # Neon/Electric
