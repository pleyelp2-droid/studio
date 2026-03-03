extends Node
class_name WorldSync

# Updates the Godot Environment based on the Civilization Index (CI)

@export var world_environment: WorldEnvironment
@export var sun_light: DirectionalLight3D

func _process(_delta):
	# Periodically poll Firestore /worldState/global
	pass

func update_environment(ci: float):
	if !world_environment: return
	
	# Adjust environment based on CI formula: (0.2*econ) + (0.2*mil) + (0.15*stab)...
	# Higher CI -> More vibrant, "Chrome Era" lighting
	var energy = clamp(ci / 1000.0, 0.1, 1.5)
	world_environment.environment.sky_custom_fov = energy * 90.0
	sun_light.light_energy = energy
	
	print("World Sync: Updated environment with CI ", ci)
