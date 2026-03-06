import http from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// --- Configuration ---
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// --- Global Error Handling ---
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

// --- World State ---
interface Agent {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  state: string;
}

interface RenderEntity {
  id: string;
  type: 'npc' | 'object';
  position: { x: number; y: number; z: number };
  asset: {
    scene: string;
    texture: string;
  };
}

interface CityState {
  id: string;
  name: string;
  population: number;
  military_power: number;
  economy_power: number;
  stability: number;
  knowledge_index: number;
  corruption_index: number;
  expansion_pressure: number;
  cultural_unity: number;
  ci: number; 
}

let worldState = {
  tick: 0,
  region_state: 'Stable',
  biome_type: 'Temperate Forest',
  active_players: 0,
  recent_events: [] as string[],
  
  economy: {
    total_gold_supply: 1000000,
    total_items_supply: 5000,
    market_liquidity: 0.8,
    tax_pool: 15000,
    inflation_index: 0,
    wealth_distribution_index: 0.4
  },

  cities: [
    {
      id: 'city_01',
      name: 'Arelor Prime',
      population: 0.8,
      military_power: 0.6,
      economy_power: 0.7,
      stability: 0.9,
      knowledge_index: 0.5,
      corruption_index: 0.1,
      expansion_pressure: 0.4,
      cultural_unity: 0.8,
      ci: 0.75
    }
  ] as CityState[],

  agents: [
    { id: 'agent_01', name: 'Arelor Guard', x: 10, y: 0, z: 10, state: 'IDLE' },
    { id: 'agent_02', name: 'Forest Stalker', x: -20, y: 0, z: 15, state: 'WANDERING' }
 ] as Agent[],

 entities: [] as RenderEntity[]
};

function buildRenderableEntities(agents: Agent[]): RenderEntity[] {
  return agents.map((agent) => ({
    id: agent.id,
    type: 'npc',
    position: { x: agent.x, y: agent.y, z: agent.z },
    asset: {
      scene: 'res://scenes/Entity.tscn',
      texture: 'res://textures/default_npc.png'
    }
  }));
}

function syncRenderableState() {
  worldState.entities = buildRenderableEntities(worldState.agents);
}

syncRenderableState();

function calculateCI(city: CityState): number {
  const ci = (0.2 * city.economy_power) + 
             (0.2 * city.military_power) + 
             (0.15 * city.stability) + 
             (0.15 * city.knowledge_index) + 
             (0.15 * city.cultural_unity) - 
             (0.15 * city.corruption_index);
  return Math.max(0, Math.min(1, ci));
}

nextApp.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    const { pathname } = parsedUrl;

    if (pathname === '/api/world-state') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(worldState));
      return;
    }

    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`Godot/Client connected from ${ip}`);
    worldState.active_players++;

    syncRenderableState();
    ws.send(JSON.stringify({ type: 'INIT', state: worldState }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'MOVE') {
          console.log(`Player moved to: ${data.x}, ${data.y}, ${data.z}`);
        }
      } catch (e) {
        console.error('WS Message Parse Error:', e);
      }
    });

    ws.on('close', () => {
      worldState.active_players--;
      console.log(`Client ${ip} disconnected`);
    });
  });

  setInterval(() => {
    worldState.tick++;
    
    worldState.agents.forEach(agent => {
      agent.x += (Math.random() - 0.5) * 2;
      agent.z += (Math.random() - 0.5) * 2;
    });

    worldState.cities.forEach(city => {
      if (worldState.tick % 10 === 0) {
        city.economy_power = Math.min(1, city.economy_power + 0.01);
        city.military_power = Math.min(1, city.military_power + 0.005);
        city.ci = calculateCI(city);
        
        if (city.ci < 0.25) {
          worldState.recent_events.push(`${city.name} is struggling. Buildings decaying.`);
        }
      }
    });

    syncRenderableState();
    const stateUpdate = JSON.stringify({ type: 'TICK', state: worldState });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(stateUpdate);
      }
    });
  }, 1000);

  server.listen(PORT, () => {
    console.log(`Arelorian Hybrid Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Next.js preparation failed:', err);
});