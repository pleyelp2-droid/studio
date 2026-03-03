'use client';
/**
 * @fileOverview Axiom Frontier - Economy Management Service
 * Handles market price discovery, supply/demand tracking, and marketplace listings.
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  runTransaction,
  orderBy,
  limit
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { marketPrice, resourceDecay } from '@/lib/math-engine';

const { firestore: db } = initializeFirebase();

const BASE_PRICES: Record<string, number> = {
  WOOD: 5, STONE: 8, IRON_ORE: 15, SILVER_ORE: 30,
  GOLD_ORE: 60, DIAMOND: 200, ANCIENT_RELIC: 500, SUNLEAF_HERB: 12
};

/**
 * Fetches the global economic state (Supply/Demand trackers)
 */
async function getEconomicState() {
  if (!db) return null;
  const ref = doc(db, 'worldState', 'economy');
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  
  // Default trackers if not exists
  return {
    supply: { WOOD: 1000, STONE: 800, IRON_ORE: 500, SILVER_ORE: 200, GOLD_ORE: 100, DIAMOND: 20, ANCIENT_RELIC: 10, SUNLEAF_HERB: 300 },
    demand: { WOOD: 900, STONE: 750, IRON_ORE: 520, SILVER_ORE: 210, GOLD_ORE: 110, DIAMOND: 25, ANCIENT_RELIC: 15, SUNLEAF_HERB: 280 }
  };
}

/**
 * Calculates current market price for a resource
 */
export async function getCurrentPrice(resourceType: string): Promise<number> {
  const state = await getEconomicState();
  if (!state) return BASE_PRICES[resourceType] || 10;

  const base = BASE_PRICES[resourceType] || 10;
  const supply = state.supply[resourceType] || 1;
  const demand = state.demand[resourceType] || 1;
  return marketPrice(base, demand, supply);
}

/**
 * Records a tick-based economic summary to Firestore
 */
export async function recordEconomicSummary(tickNumber: number): Promise<void> {
  if (!db) return;

  const state = await getEconomicState();
  if (!state) return;

  const prices: Record<string, number> = {};
  for (const res of Object.keys(BASE_PRICES)) {
    prices[res] = marketPrice(BASE_PRICES[res], state.demand[res] || 1, state.supply[res] || 1);
  }

  const gdp = Object.entries(prices).reduce((sum, [res, price]) => {
    return sum + price * (state.supply[res] || 0);
  }, 0);

  // Get active listing count for trade volume
  const q = query(collection(db, 'marketplace'), where('status', '==', 'ACTIVE'));
  const tradeSnap = await getDocs(q);
  const tradeVolume = tradeSnap.size;

  await setDoc(doc(collection(db, 'economicSummaries')), {
    tickNumber,
    totalSupply: state.supply,
    totalDemand: state.demand,
    priceIndex: prices,
    gdp,
    inflationRate: 0,
    tradeVolume,
    createdAt: serverTimestamp()
  });
}

/**
 * Creates a new market listing and updates supply
 */
export async function createMarketListing(
  sellerUid: string, 
  itemName: string, 
  resourceType: string,
  quantity: number
): Promise<any> {
  if (!db) return null;

  const price = await getCurrentPrice(resourceType);

  return await runTransaction(db, async (transaction) => {
    const econRef = doc(db, 'worldState', 'economy');
    const econSnap = await transaction.get(econRef);
    const econData = econSnap.exists() ? econSnap.data() : { supply: {}, demand: {} };

    const newSupply = (econData.supply[resourceType] || 0) + quantity;
    
    // Update global supply tracker
    transaction.set(econRef, {
      ...econData,
      supply: { ...econData.supply, [resourceType]: newSupply },
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Create listing
    const listingRef = doc(collection(db, 'marketplace'));
    const listing = {
      sellerUid,
      itemName,
      resourceType,
      quantity,
      pricePerUnit: price,
      status: 'ACTIVE',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    transaction.set(listingRef, listing);

    return { id: listingRef.id, ...listing };
  });
}

/**
 * Retrieves historical economic snapshots
 */
export async function getEconomicSummaries(limitCount = 10) {
  if (!db) return [];
  const q = query(collection(db, 'economicSummaries'), orderBy('tickNumber', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
