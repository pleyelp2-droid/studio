'use client';
/**
 * @fileOverview Ouroboros GPU Instancing Engine (Three.js implementation)
 * Based on High-Performance Babylon blueprint.
 * Optimized for rendering 1000+ world nodes with minimal draw calls.
 */

import * as THREE from 'three';

export interface InstanceConfig {
  id: string;
  mesh: THREE.Mesh;
  positions: THREE.Vector3[];
  rotations?: THREE.Euler[];
  scales?: THREE.Vector3[];
}

export class InstancedAssetEngine {
  /**
   * Creates an InstancedMesh group for a specific prefab.
   */
  static createInstancedGroup(config: InstanceConfig): THREE.InstancedMesh {
    const { mesh, positions, rotations, scales, id } = config;
    const count = positions.length;
    
    const instancedMesh = new THREE.InstancedMesh(
      mesh.geometry,
      mesh.material,
      count
    );
    
    instancedMesh.name = `instanced_${id}`;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      dummy.position.copy(positions[i]);
      
      if (rotations && rotations[i]) {
        dummy.rotation.copy(rotations[i]);
      }
      
      if (scales && scales[i]) {
        dummy.scale.copy(scales[i]);
      } else {
        dummy.scale.set(1, 1, 1);
      }
      
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }

  /**
   * Generates a simplified collision hull from a mesh.
   */
  static generateCollisionHull(mesh: THREE.Mesh): THREE.Box3 {
    const box = new THREE.Box3().setFromObject(mesh);
    return box;
  }
}