import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { HealthProfile } from "@/types";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ profile: { conditions: [] } });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return NextResponse.json({ profile: user?.healthProfile ? JSON.parse(user.healthProfile) : { conditions: [] } });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const profile = (await request.json()) as HealthProfile;
  await prisma.user.update({
    where: { id: session.user.id },
    data: { healthProfile: JSON.stringify(profile) }
  });
  return NextResponse.json({ profile });
}
