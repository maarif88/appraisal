import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import type Database from "better-sqlite3";
export interface AuthConfig {
  username: string;
  password: string;
  secret: string;
  production: boolean;
  origins: string[];
}
export function createAuth(db: Database.Database, config: AuthConfig) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS auth_sessions (token_hash TEXT PRIMARY KEY, username TEXT NOT NULL, expires_at INTEGER NOT NULL, credential_version TEXT NOT NULL)",
  );
  const configured = () =>
    Boolean(
      config.username &&
      config.password.length >= 12 &&
      config.secret.length >= 43 &&
      !/example|change.?me|ypym.*secret/i.test(config.secret),
    );
  const digest = (value: string) =>
    crypto.createHmac("sha256", config.secret).update(value).digest("hex");
  const version = () => digest(config.username + "\0" + config.password);
  const cookieName = "appraisal_session";
  function cookie(req: Request): string {
    return (
      (req.headers.cookie || "")
        .split(";")
        .map((x) => x.trim())
        .find((x) => x.startsWith(cookieName + "="))
        ?.slice(cookieName.length + 1) || ""
    );
  }
  function originAllowed(req: Request): boolean {
    const origin = req.get("origin");
    return !origin || config.origins.includes(origin);
  }
  function identity(req: Request): string | null {
    if (!configured()) return null;
    const token = cookie(req);
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const row = db
      .prepare(
        "SELECT username,expires_at,credential_version FROM auth_sessions WHERE token_hash=?",
      )
      .get(digest(token)) as any;
    return row &&
      row.expires_at > Date.now() &&
      row.credential_version === version() &&
      row.username === config.username
      ? row.username
      : null;
  }
  function requireAuth(req: Request, res: Response, next: NextFunction) {
    res.set("Cache-Control", "no-store");
    if (!configured()) {
      res
        .status(503)
        .json({
          error: "Private workspace login is not configured on this server.",
        });
      return;
    }
    if (!originAllowed(req)) {
      res.status(403).json({ error: "Origin not allowed" });
      return;
    }
    if (!identity(req)) {
      res.status(401).json({ error: "Sign in to access this workspace." });
      return;
    }
    next();
  }
  function session(req: Request, res: Response) {
    res.set("Cache-Control", "no-store");
    res.json({ authenticated: !!identity(req), configured: configured() });
  }
  function login(req: Request, res: Response) {
    res.set("Cache-Control", "no-store");
    if (!configured()) {
      res
        .status(503)
        .json({
          error: "Private workspace login is not configured on this server.",
        });
      return;
    }
    if (!originAllowed(req)) {
      res.status(403).json({ error: "Origin not allowed" });
      return;
    }
    const { username, password } = req.body || {};
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      password.length > 1024
    ) {
      res.status(401).json({ error: "Incorrect username or password" });
      return;
    }
    const a = crypto
      .createHash("sha256")
      .update(username + "\0" + password)
      .digest();
    const b = crypto
      .createHash("sha256")
      .update(config.username + "\0" + config.password)
      .digest();
    if (!crypto.timingSafeEqual(a, b)) {
      res.status(401).json({ error: "Incorrect username or password" });
      return;
    }
    db.prepare(
      "DELETE FROM auth_sessions WHERE expires_at<=? OR credential_version<>?",
    ).run(Date.now(), version());
    const token = crypto.randomBytes(32).toString("base64url"),
      maxAge = 8 * 3600 * 1000;
    db.prepare("INSERT INTO auth_sessions VALUES(?,?,?,?)").run(
      digest(token),
      config.username,
      Date.now() + maxAge,
      version(),
    );
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: config.production,
      sameSite: "strict",
      path: "/",
      maxAge,
    });
    res.json({ authenticated: true });
  }
  function logout(req: Request, res: Response) {
    if (!originAllowed(req)) {
      res.status(403).json({ error: "Origin not allowed" });
      return;
    }
    db.prepare("DELETE FROM auth_sessions WHERE token_hash=?").run(
      digest(cookie(req)),
    );
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: config.production,
      sameSite: "strict",
      path: "/",
    });
    res.json({ authenticated: false });
  }
  return { requireAuth, session, login, logout, identity };
}
