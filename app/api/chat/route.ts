import { NextResponse } from "next/server";
import { ChatRequest, ChatErrorResponse } from "@/lib/types/chat";
import { routeChatRequest } from "@/lib/ai/provider-router";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequest;

    if (!body.provider || !body.model || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request body" } as ChatErrorResponse,
        { status: 400 }
      );
    }

    if (body.messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array cannot be empty" } as ChatErrorResponse,
        { status: 400 }
      );
    }

    const response = await routeChatRequest(body);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" } as ChatErrorResponse,
      { status: 500 }
    );
  }
}
