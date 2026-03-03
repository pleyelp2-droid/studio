/**
 * @fileOverview Axiom Frontier - Serverless Heartbeat & Game Logic
 * This code is intended for Firebase Cloud Functions v2.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * World Heartbeat - Runs every 1 minute
 * Updates Civilization Index and deterministic world parameters.
 */
export const worldHeartbeat = onSchedule("every 1 minutes", async (event) => {
    const worldRef = db.collection("worldState").doc("global");
    const snap = await worldRef.get();
    const data = snap.data();

    if (!data) return;

    // Formula: CI = (0.2*econ) + (0.2*mil) + (0.15*stab) + (0.15*know) + (0.15*cult) - (0.15*corr)
    const ci = (0.2 * (data.economy || 0)) + 
               (0.2 * (data.military || 0)) + 
               (0.15 * (data.stability || 0)) + 
               (0.15 * (data.knowledge || 0)) + 
               (0.15 * (data.culture || 0)) - 
               (0.15 * (data.corruption || 0));

    await worldRef.update({
        civilizationIndex: ci,
        tick: admin.firestore.FieldValue.increment(1),
        lastHeartbeat: admin.firestore.Timestamp.now()
    });

    console.log(`Heartbeat processed. CI: ${ci}`);
});

/**
 * AxiomEnforcer - Validates critical game state changes
 */
export const enforceAxiom = onDocumentUpdated("players/{playerId}", async (event) => {
    const newValue = event.data?.after.data();
    const oldValue = event.data?.before.data();

    if (!newValue || !oldValue) return;

    // Prevent impossible level jumps
    if (newValue.level > oldValue.level + 1) {
        console.warn(`Suspicious level jump detected for player ${event.params.playerId}`);
        // Revert or flag account logic here
    }
});
