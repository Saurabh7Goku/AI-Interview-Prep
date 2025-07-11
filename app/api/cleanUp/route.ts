// app/api/cleanup/route.ts
import { NextResponse } from "next/server";
import { deleteOldDocuments } from "@/firebase/cleanup";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CLEANUP_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedCount = await deleteOldDocuments("interviews", 7);
    return NextResponse.json({ message: `Deleted ${deletedCount} old documents`, deletedCount }, { status: 200 });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Failed to clean up old documents" }, { status: 500 });
  }
}