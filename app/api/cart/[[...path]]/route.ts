import { NextRequest, NextResponse } from "next/server";

const WOOCOMMERCE_API = process.env.WOOCOMMERCE_STORE_API_URL!;

async function handleCartRequest(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  try {
    const { path = [] } = await context.params;

    const endpoint = path.join("/");
    const url = `${WOOCOMMERCE_API}/${endpoint}`;

    const headers = new Headers({
      "Content-Type": "application/json",
    });

    // Forward WooCommerce session and authentication headers
    const cookie = request.headers.get("cookie");
    const cartToken = request.headers.get("Cart-Token");
    const nonce = request.headers.get("Nonce");

    if (cookie) headers.set("Cookie", cookie);
    if (cartToken) headers.set("Cart-Token", cartToken);
    if (nonce) headers.set("Nonce", nonce);

    const body =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.text()
        : undefined;

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    // Forward updated WooCommerce session information
    const newCartToken = response.headers.get("Cart-Token");
    const newNonce = response.headers.get("Nonce");

    if (newCartToken) {
      nextResponse.headers.set("Cart-Token", newCartToken);
    }

    if (newNonce) {
      nextResponse.headers.set("Nonce", newNonce);
    }

    response.headers.getSetCookie().forEach((cookie) => {
      nextResponse.headers.append("Set-Cookie", cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error("WooCommerce cart proxy error:", error);

    return NextResponse.json(
      { message: "Unable to process cart request." },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleCartRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleCartRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  return handleCartRequest(request, context);
}