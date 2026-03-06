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
 * Portiert von server.ts & tick-engine.ts
 */

const GEMINI_API_KEY = functions.config().ouroboros?.gemini_key || process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// --- Math Engines (1:1 Port von Tick-Engine) ---
const calculateCI = (city: any) => {
  return (0.2 * (city.economy_power || 0)) + 
         (0.2 * (city.military_power || 0)) + 
         (0.15 * (city.stability || 0)) + 
         (0.15 * (city.knowledge_index || 0)) + 
         (0.15 * (city.cultural_unity || 0)) - 
         (0.15 * (city.corruption_index || 0));
};

// --- World Heartbeat (Geplant jede Minute) ---
export const worldHeartbeat = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
  const worldRef = db.collection('world_state').doc('current');
  const snap = await worldRef.get();
  const state = snap.data() || { tick: 0, gold_supply: 1000000, entities: {} };

  const newTick = (state.tick || 0) + 1;
  
  // Update World State
  // Nutzt set mit merge: true, um Bootstrap deterministisch zu machen.
  await worldRef.set({
    ...state,
    tick: newTick,
    last_pulse: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // Synchronisation mit RTDB für Godot Realtime
  await rtdb.ref('live_world').set({
    tick: newTick,
    timestamp: Date.now(),
    entities: state.entities || {}
  });

  return null;
});

// --- AI Content Generator ---
export const generateGameContent = functions.https.onCall(async (data, context) => {
  if (!genAI) throw new functions.https.HttpsError('failed-precondition', 'AI nicht konfiguriert');
  
  const { type, context: gameContext } = data;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Erzeuge ${type} für das Ouroboros MMO. Kontext: ${JSON.stringify(gameContext)}`;
  const result = await model.generateContent(prompt);
  const content = JSON.parse(result.response.text());

  // In Firestore speichern
  await db.collection(type + 's').add({
    ...content,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  return content;
});
