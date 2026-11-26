"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import UserProfile from "./UserProfile";
import {initializeCustomerCart, mergeGuestCart} from "@/app/lib/cart-api";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const fetchProfile = async (token: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/profile`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success || !data.user) {
      throw new Error(data.message || "Unable to fetch user profile.");
    }

    setUser(data.user);
  };

  // Check existing login session when page loads
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setCheckingProfile(false);
        return;
      }

      try {
        const customerCartToken = await initializeCustomerCart(token);
        localStorage.setItem("woocommerce_cart_token", customerCartToken);
        await fetchProfile(token);
      } catch (error) {
        localStorage.removeItem("auth_token");
        console.error("Profile verification failed:", error);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkLogin();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Invalid username or password.");
      }

      // Capture guest cart token before initializing customer cart
      const guestCartToken = localStorage.getItem("woocommerce_cart_token");

      // Save authentication token
      localStorage.setItem("auth_token", data.token);

      // Get the logged-in customer's WooCommerce cart token
      const customerCartToken = await initializeCustomerCart(data.token);

      // Merge guest cart products into the customer's existing cart
      if (guestCartToken && guestCartToken !== customerCartToken) {
        await mergeGuestCart(guestCartToken, customerCartToken);
      } else {
        localStorage.setItem("woocommerce_cart_token", customerCartToken);
      }

      // Fetch profile details
      await fetchProfile(data.token);

      setMessage("Login successful.");
      setMessageType("success");

      setPassword("");
    } catch (error) {
      localStorage.removeItem("auth_token");

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");

    try {
      if (token) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error("Logout API failed:", data.message);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("woocommerce_cart_token");

      setUser(null);
      setUsername("");
      setPassword("");
      setMessage("");
    }
  };

  if (checkingProfile) {
    return <div className="login-wrapper">Loading account...</div>;
  }

  // Show profile instead of login form
  if (user) {
    return <UserProfile user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="login-wrapper">
      <h1>My Account</h1>
      <p className="login-subtitle">Sign in to your account</p>

      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username or Email Address</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username or email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        <button
          type="submit"
          className="login-submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="create-account-link">
          <p>
            Don't have an account?{" "}
            <Link href="/register">Create Account</Link>
          </p>
        </div>

        {message && (
          <p
            className="login-message"
            style={{
              color: messageType === "success" ? "green" : "red",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}