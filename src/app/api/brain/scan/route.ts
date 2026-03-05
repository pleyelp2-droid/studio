import { NextResponse } from 'next/server';
import { GameBrain } from '@/lib/brain/GameBrain';

export async function POST(req: Request) {
  try {
    const { targetDir, tenantId } = await req.json();
    const brain = new GameBrain(tenantId);
    await brain.init(targetDir);
    return NextResponse.json({ 
      success: true,
      stats: brain.getStats(),
      matrix_status: 'ANALYZED'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
