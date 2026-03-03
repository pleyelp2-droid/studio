extends MeshInstance3D

# Ouroboros Texture Manager
# Reacts to Civilization Index changes by swapping materials

@export var primitive_material: Material
@export var industrial_material: Material
@export var chrome_material: Material

func _ready():
	# Register listener with WorldSync
	var world_sync = get_node("/root/WorldSync")
	if world_sync:
		world_sync.connect("on_civilization_index_changed", _on_ci_changed)

func _on_ci_changed(ci: float):
	if ci < 400:
		set_surface_override_material(0, primitive_material)
	elif ci < 800:
		set_surface_override_material(0, industrial_material)
	else:
		set_surface_override_material(0, chrome_material)
