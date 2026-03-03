extends Node

# WorldSync.gd
# This script should be attached to a global Autoload node.
# It polls or listens to the worldState/global document in Firestore.

signal world_updated(civilization_index, current_tick)

var civilization_index: float = 0.0
var current_tick: int = 0
var era: String = "Primitive"

func _process(_delta):
	# In a production Godot app, you'd use a timer or Firestore's real-time listener.
	# For prototyping, we'll assume a signal is fired when the Firestore document changes.
	pass

func on_firestore_update(data: Dictionary):
	civilization_index = data.get("civilizationIndex", 0.0)
	current_tick = data.get("tick", 0)
	
	# Determine Era for texturing logic
	if civilization_index < 400:
		era = "Primitive"
	elif civilization_index < 800:
		era = "Industrial"
	else:
		era = "Chrome"
		
	emit_signal("world_updated", civilization_index, current_tick)
	print("Ouroboros: World Sync - Era is ", era, " at Tick ", current_tick)
