import React, { useEffect, useState } from "react";
import "./WorkspaceAuth.css";
export default function WorkspaceAuth({
  children,
  title = "Private workspace",
}) {
  const [state, setState] = useState("loading"),
    [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    const check = async () => {
      try {
        const r = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const s = await r.json();
        if (live)
          setState(
            s.authenticated
              ? "signed-in"
              : s.configured
                ? "signed-out"
                : "unconfigured",
          );
      } catch {
        if (live) {
          setState("signed-out");
          setError("Unable to reach the workspace. Please try again.");
        }
      }
    };
    check();
    const timer = setInterval(check, 60000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, []);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await r.json();
      if (!r.ok)
        throw Error(
          r.status === 429
            ? "Too many attempts. Please try again later."
            : data.error || "Sign-in failed",
        );
      setPassword("");
      setState("signed-in");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      const r = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!r.ok) throw Error("Sign-out failed. Please try again.");
      setState("signed-out");
      setPassword("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (state === "loading")
    return (
      <main className="workspace-auth">
        <p role="status">Checking access…</p>
      </main>
    );
  if (state === "signed-in")
    return (
      <>
        <div className="workspace-auth-controls">
          <button type="button" onClick={logout} disabled={busy}>
            Sign out
          </button>
          {error && <span role="alert">{error}</span>}
        </div>
        {children}
      </>
    );
  return (
    <main className="workspace-auth">
      <form onSubmit={login} className="workspace-auth-form">
        <h1>{title}</h1>
        <p>Sign in to access this workspace.</p>
        {state === "unconfigured" ? (
          <p role="alert">
            Workspace access has not been configured. Please contact the
            administrator.
          </p>
        ) : (
          <>
            <label htmlFor="workspace-user">Username</label>
            <input
              id="workspace-user"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              maxLength={254}
            />
            <label htmlFor="workspace-password">Password</label>
            <input
              id="workspace-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              maxLength={1024}
            />
            <button type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </>
        )}
        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  );
}
