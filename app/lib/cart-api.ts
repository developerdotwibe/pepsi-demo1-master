const CART_API = "/api/cart";
const CART_TOKEN_KEY = "woocommerce_cart_token";

export async function cartRequest(
  endpoint = "cart",
  method = "GET",
  body?: Record<string, unknown>
) {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem(CART_TOKEN_KEY)
      : null;

  const response = await fetch(`${CART_API}/${endpoint}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Cart-Token": token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });

  const newToken = response.headers.get("Cart-Token");

  if (newToken) {
    sessionStorage.setItem(CART_TOKEN_KEY, newToken);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to process cart request.");
  }

  return data;
}