import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

/**
 * OUROBOROS AXIOM ENGINE - FIREBASE PORT
 * Updated for deterministic world heartbeat and entity synchronization.
 */

const GEMINI_API_KEY = functions.config().ouroboros?.gemini_key || process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// --- World Heartbeat (Scheduled every minute) ---
export const worldHeartbeat = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  const worldRef = db.collection('world_state').doc('current');
  const snap = await worldRef.get();
  const state = snap.data() || { tick: 0, gold_supply: 1000000, entities: {} };

  const newTick = (state.tick || 0) + 1;
  
  // Update World State using set with merge: true for deterministic bootstrap
  await worldRef.set({
    ...state,
    tick: newTick,
    last_pulse: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // Sync to RTDB for Godot Realtime with full entity snapshots
  await rtdb.ref('live_world').set({
    tick: newTick,
    timestamp: Date.now(),
    entities: state.entities || {}
  });

  return null;
});

// --- AI Content Generator ---
export const generateGameContent = functions.https.onCall(async (data, context) => {
  if (!genAI) throw new functions.https.HttpsError('failed-precondition', 'AI not configured');
  
  const { type, context: gameContext } = data;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Generate ${type} for Ouroboros MMO. Context: ${JSON.stringify(gameContext)}`;
  const result = await model.generateContent(prompt);
  const content = JSON.parse(result.response.text());

  // Store in Firestore
  await db.collection(type + 's').add({
    ...content,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  return content;
});