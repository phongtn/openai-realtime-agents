import { NextResponse } from "next/server";

export async function GET() {
  try {
      // const apiEndpoint = "https://api.openai.com/v1/realtime/sessions";
      const apiEndpoint = "https://lang-tutor-722229371534.asia-southeast1.run.app/session";
      const response = await fetch(
      apiEndpoint,
      {
        method: "POST",
        headers: {
          Authorization: `${process.env.BACKEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2025-06-03",
        }),
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
