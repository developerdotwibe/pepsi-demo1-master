const CART_API = "/api/cart";
const CART_TOKEN_KEY = "woocommerce_cart_token";

export async function initializeCustomerCart(authToken: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/cart-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success || !data.cart_token) {
    throw new Error(data.message || "Unable to initialize customer cart.");
  }

  sessionStorage.setItem(CART_TOKEN_KEY, data.cart_token);

  return data.cart_token;
}

export async function cartRequest(
  endpoint = "cart",
  method = "GET",
  body?: Record<string, unknown>
) {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem(CART_TOKEN_KEY)
      : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Cart-Token"] = token;
  }

  const response = await fetch(`${CART_API}/${endpoint}`, {
    method,
    credentials: "include",
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });

  const newToken = response.headers.get("Cart-Token");

  if (newToken && typeof window !== "undefined") {
    sessionStorage.setItem(CART_TOKEN_KEY, newToken);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to process cart request.");
  }

  return data;
}
