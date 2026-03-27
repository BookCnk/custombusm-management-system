import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test connection with simple query
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    return NextResponse.json({
      success: true,
      message: "✅ เชื่อมต่อ Supabase สำเร็จ!",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    
    return NextResponse.json({
      success: false,
      message: "❌ เชื่อมต่อไม่สำเร็จ",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
