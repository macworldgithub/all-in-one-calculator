import { NextResponse } from "next/server";
import { getCalculatorsIndex } from "@/lib/calculators";

export async function GET() {
  try {
    const calculators = getCalculatorsIndex();
    return NextResponse.json(
      {
        status: "ok",
        service: "all-in-one-calculator",
        calculatorCount: calculators.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      {
        status: "error",
        service: "all-in-one-calculator",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
