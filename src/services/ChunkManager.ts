'use client';
/**
 * @fileOverview Axiom Frontier - Chunk Management Service
 * Handles the loading and persistence of world chunks in Firestore.
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { generateChunk } from '@/lib/math-engine';
import { Chunk } from '@/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const { firestore: db } = initializeFirebase();

/**
 * Retrieves a chunk from Firestore or generates it locally if missing.
 * Implements the Matrix Persistence logic with non-blocking updates.
 */
export async function getChunk(x: number, z: number, seed: number): Promise<Chunk> {
  if (!db) {
    console.warn("[MATRIX_CORE] Firestore disconnected. Using local manifestation.");
    const data = generateChunk(x, z, seed);
    return { ...data, id: data.id, entropy: 0, stabilityIndex: 1, corruptionLevel: 0, resourceData: data.resources, logicField: [], lastUpdate: new Date(), logicString: data.fieldString } as any;
  }

  const chunkId = `${x}_${z}`;
  const docRef = doc(db, 'chunks', chunkId);

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        ...data, 
        id: docSnap.id,
        lastUpdate: data.lastUpdate?.toDate() || new Date() 
      } as Chunk;
    } else {
      const data = generateChunk(x, z, seed);
      const newChunk: any = {
        id: data.id,
        x: data.x,
        z: data.z,
        seed: data.seed,
        biome: data.biome.toUpperCase(),
        entropy: 0.05,
        stabilityIndex: 0.95,
        corruptionLevel: 0.01,
        resourceData: data.resources,
        logicField: [],
        lastUpdate: serverTimestamp(),
        logicString: data.fieldString
      };
      
      setDoc(docRef, newChunk, { merge: true }).catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newChunk,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

      return { ...newChunk, lastUpdate: new Date() };
    }
  } catch (error) {
    console.error("[MATRIX_CORRUPTION] Persistence failure, falling back to heuristics:", error);
    const data = generateChunk(x, z, seed);
    return { ...data, id: data.id, entropy: 0, stabilityIndex: 1, corruptionLevel: 0, resourceData: data.resources, logicField: [], lastUpdate: new Date(), logicString: data.fieldString } as any;
  }
}
