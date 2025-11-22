import { NextResponse } from 'next/server';

export async function GET() {
  // Mock list for UI demo
  return NextResponse.json({
    predictions: [
      { id: 'p-001', title: 'Galatasaray maçı kazanır mı?', endsAt: Math.floor(Date.now() / 1000) + 7200 },
      { id: 'p-002', title: 'BTC bugün +%1 üstünde kapanır mı?', endsAt: Math.floor(Date.now() / 1000) + 86400 },
      { id: 'p-003', title: 'ETH haftayı $4k üstünde kapatır mı?', endsAt: Math.floor(Date.now() / 1000) + 604800 }
    ]
  });
}


