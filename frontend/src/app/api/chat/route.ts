import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Proxy request to backend FastAPI server running at http://127.0.0.1:8000/api/chat
    const backendRes = await fetch("http://127.0.0.1:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      return new Response(JSON.stringify({ error: "Backend error" }), {
        status: backendRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(backendRes.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return new Response(JSON.stringify({ error: "Failed to connect to FastAPI backend server" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
