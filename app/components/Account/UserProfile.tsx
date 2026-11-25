"use client";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export default function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div className="login-wrapper user-profile">
      <h1>My Account</h1>
      <p className="login-subtitle">Your account details</p>

      <div className="profile-details">
        <div className="profile-field">
          <label>Name</label>
          <p>{user.name}</p>
        </div>

        <div className="profile-field">
          <label>Username</label>
          <p>{user.username}</p>
        </div>

        <div className="profile-field">
          <label>Email Address</label>
          <p>{user.email}</p>
        </div>
      </div>

      <button
        type="button"
        className="login-submit logout-btn"
        onClick={onLogout}
      >
        Log Out
      </button>
    </div>
  );
}