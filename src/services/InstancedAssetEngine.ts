'use client';
/**
 * @fileOverview Ouroboros GPU Instancing Engine (Three.js Edition)
 * Optimized for rendering 1000+ nodes with Auto-LOD and shared physics hulls.
 */

import * as THREE from 'three';
import { LibraryAsset } from './LibraryManager';

export interface InstanceNode {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export class InstancedAssetEngine {
  /**
   * Creates a high-performance InstancedMesh group for a specific library asset.
   * Mirroring the "Lowest LOD as Collision Hull" strategy.
   */
  static createInstancedGroup(
    asset: LibraryAsset, 
    nodes: InstanceNode[], 
    baseMesh: THREE.Mesh
  ): THREE.InstancedMesh {
    const count = nodes.length;
    const instancedMesh = new THREE.InstancedMesh(
      baseMesh.geometry,
      baseMesh.material,
      count
    );

    instancedMesh.name = `instanced_${asset.id}`;
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const assetScale = asset.asset.scale || { x: 1, y: 1, z: 1 };
    const assetOffset = asset.asset.offset || { x: 0, y: 0, z: 0 };

    nodes.forEach((node, i) => {
      dummy.position.set(
        node.position.x + assetOffset.x,
        node.position.y + assetOffset.y,
        node.position.z + assetOffset.z
      );
      dummy.rotation.copy(node.rotation);
      dummy.scale.set(
        node.scale.x * assetScale.x,
        node.scale.y * assetScale.y,
        node.scale.z * assetScale.z
      );
      
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    
    // Physics Hull Logic: Attach metadata for the physics engine
    instancedMesh.userData.isSolid = asset.asset.isSolid;
    instancedMesh.userData.isTrigger = asset.asset.isTrigger;

    return instancedMesh;
  }
}