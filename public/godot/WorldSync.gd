extends Node

# Ouroboros World Sync
# Synchronizes world state (ticks, events) with Godot

signal on_tick_updated(new_tick)
signal on_event_triggered(event_data)

var last_tick = 0

func _process(_delta):
	# Poll for updates or handle WebSocket events
	pass

func _on_data_received(data):
	if data.has("tick") and data.tick != last_tick:
		last_tick = data.tick
		emit_signal("on_tick_updated", last_tick)
