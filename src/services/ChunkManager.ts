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
    return generateChunk(x, z, seed);
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
      // Manifest new chunk based on Axioms
      const newChunk = generateChunk(x, z, seed);
      
      // PERSISTENCE: Record the manifestation in the ledger (non-blocking)
      setDoc(docRef, {
        ...newChunk,
        lastUpdate: serverTimestamp()
      }, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: newChunk,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

      return newChunk;
    }
  } catch (error) {
    console.error("[MATRIX_CORRUPTION] Persistence failure, falling back to heuristics:", error);
    return generateChunk(x, z, seed);
  }
}
