# Ouroboros Godot Setup Guide

## 1. Install Plugin
Install the **Godot Firebase** plugin from the Godot Asset Library.

## 2. Configuration
In `Project Settings -> Firebase`, enter:
* **API Key:** AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE
* **Project ID:** studio-5485353702-8ce01

## 3. Autoloads
Add the following scripts from `public/godot/` as Autoloads in your project settings:
1. `FirebaseConnector.gd`
2. `WorldSync.gd`

## 4. Design Workflow
Attach `TextureManager.gd` to any 3D objects you want to change based on the **Civilization Index**. When you use the **Admin Dashboard** to change world settings, Godot will receive the signal and update the textures instantly.
