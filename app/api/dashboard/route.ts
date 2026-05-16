import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ scans: [], stats: emptyStats() });

  const scans = await prisma.scanHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { scannedAt: "desc" },
    take: 30
  });

  return NextResponse.json({
    scans,
    stats: {
      total: scans.length,
      safe: scans.filter((scan) => scan.riskLevel === "safe").length,
      moderate: scans.filter((scan) => scan.riskLevel === "moderate").length,
      avoid: scans.filter((scan) => scan.riskLevel === "avoid").length,
      averageScore: scans.length
        ? Math.round(scans.reduce((sum, scan) => sum + scan.healthScore, 0) / scans.length)
        : 0
    }
  });
}

function emptyStats() {
  return { total: 0, safe: 0, moderate: 0, avoid: 0, averageScore: 0 };
}
