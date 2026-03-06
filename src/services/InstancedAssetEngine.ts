'use client';
/**
 * @fileOverview Ouroboros GPU Instancing Engine (Three.js)
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
   * Creates an InstancedMesh for a specific prefab.
   * Mirroring the high-performance Babylon pattern for Three.js.
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
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      dummy.position.copy(positions[i]);
      if (rotations && rotations[i]) dummy.rotation.copy(rotations[i]);
      if (scales && scales[i]) dummy.scale.copy(scales[i]);
      else dummy.scale.set(1, 1, 1);
      
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    return instancedMesh;
  }
}
