
const CART_API = "/api/cart";
const CART_TOKEN_KEY = "woocommerce_cart_token";

async function fetchCartWithToken(
  endpoint: string,
  method: string,
  token?: string,
  body?: Record<string, unknown>
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Cart-Token"] = token;
  }

  const response = await fetch(`${CART_API}/${endpoint}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || "Unable to process cart request.");
  }

  return {
    data,
    token: response.headers.get("Cart-Token") || token || null,
  };
}

// Create a guest cart token if one doesn't exist.
export async function ensureCartToken() {
  let token = localStorage.getItem(CART_TOKEN_KEY);

  if (token) return token;

  const result = await fetchCartWithToken("cart", "GET");

  if (!result.token) {
    throw new Error("Unable to initialize guest cart.");
  }

  localStorage.setItem(CART_TOKEN_KEY, result.token);

  return result.token;
}

// Always obtain the customer cart token after login.
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

  return data.cart_token as string;
}

// Merge guest products into the existing customer cart.
export async function mergeGuestCart(
  guestToken: string,
  customerToken: string
) {
  const guestResult = await fetchCartWithToken(
    "cart",
    "GET",
    guestToken
  );

  const guestItems = guestResult.data.items || [];

  const customerResult = await fetchCartWithToken(
    "cart",
    "GET",
    customerToken
  );

  let activeToken = customerResult.token || customerToken;

  for (const item of guestItems) {
    const result = await fetchCartWithToken(
      "cart/add-item",
      "POST",
      activeToken,
      {
        id: item.id,
        quantity: item.quantity,
        ...(item.variation?.length
          ? { variation: item.variation }
          : {}),
      }
    );

    activeToken = result.token || activeToken;
  }

  localStorage.setItem(CART_TOKEN_KEY, activeToken);
}

// Normal cart operations.
export async function cartRequest(
  endpoint = "cart",
  method = "GET",
  body?: Record<string, unknown>
) {
  const token = await ensureCartToken();

  const result = await fetchCartWithToken(
    endpoint,
    method,
    token,
    body
  );

  if (result.token) {
    localStorage.setItem(CART_TOKEN_KEY, result.token);
  }

  return result.data;
}
