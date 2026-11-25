"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent < HTMLFormElement > ) => {
	e.preventDefault();
	setMessage("");
	try {
		setLoading(true);
		const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		});
		const data = await response.json();
		if (!response.ok || !data.success || !data.token) {
			throw new Error(data.message || "Invalid username or password.");
		}
		sessionStorage.setItem("auth_token", data.token);
		const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/profile`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${data.token}`,
				"Content-Type": "application/json",
			},
		});
		const profileData = await profileResponse.json();
		if (!profileResponse.ok) {
			throw new Error(profileData.message || "Unable to fetch user profile.");
		}
		console.log("Logged-in user:", profileData);
		setMessage("Login successful.");
		setMessageType("success");
	}
	catch (error) {
		setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
		setMessageType("error");
	}
	finally {
		setLoading(false);
	}
  };

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
