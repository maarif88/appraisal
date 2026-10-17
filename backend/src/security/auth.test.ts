import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { createAuth } from "./auth.js";
import { createAnalysisGuard } from "./analysisGuard.js";
const config = {
  username: "test-admin",
  password: "test-admin-password-1234",
  secret: "s".repeat(48),
  production: true,
  origins: ["https://workspace.test"],
};
function request(
  body: any = {},
  token = "",
  origin = "https://workspace.test",
): any {
  return {
    body,
    headers: { cookie: token ? "appraisal_session=" + token : "" },
    get: (name: string) => (name === "origin" ? origin : undefined),
  };
}
function response(): any {
  return {
    code: 200,
    body: null,
    token: "",
    options: null,
    set() {
      return this;
    },
    status(n: number) {
      this.code = n;
      return this;
    },
    json(body: any) {
      this.body = body;
      return this;
    },
    cookie(_name: string, token: string, opts: any) {
      this.token = token;
      this.options = opts;
    },
    clearCookie() {
      this.token = "";
    },
  };
}
describe("private workspace security", () => {
  it("blocks anonymous API access, persists sessions, revokes logout and password rotation", () => {
    const db = new Database(":memory:");
    try {
      const a = createAuth(db, config);
      let next = 0;
      const guest = response();
      a.requireAuth(request(), guest, () => {
        next++;
      });
      expect(guest.code).toBe(401);
      expect(next).toBe(0);
      const login = response();
      a.login(
        request({ username: config.username, password: config.password }),
        login,
      );
      expect(login.code).toBe(200);
      expect(login.options.httpOnly).toBe(true);
      expect(login.options.secure).toBe(true);
      expect(login.options.sameSite).toBe("strict");
      const signed = request({}, login.token);
      expect(createAuth(db, config).identity(signed)).toBe(config.username);
      expect(
        createAuth(db, {
          ...config,
          password: "rotated-password-1234",
        }).identity(signed),
      ).toBe(null);
      a.logout(signed, response());
      expect(a.identity(signed)).toBe(null);
    } finally {
      db.close();
    }
  });
  it("fails closed with missing secret and rejects foreign origin before credential checks", () => {
    const db = new Database(":memory:");
    try {
      const no = createAuth(db, { ...config, secret: "" }),
        r = response();
      no.requireAuth(request(), r, () => {
        throw Error("unsafe");
      });
      expect(r.code).toBe(503);
      const cross = response();
      createAuth(db, config).login(
        request(
          { username: config.username, password: config.password },
          "",
          "https://evil.test",
        ),
        cross,
      );
      expect(cross.code).toBe(403);
    } finally {
      db.close();
    }
  });
  it("rejects expired tokens in persistent storage", () => {
    const db = new Database(":memory:");
    try {
      const auth = createAuth(db, config),
        r = response();
      auth.login(
        request({ username: config.username, password: config.password }),
        r,
      );
      db.prepare("UPDATE auth_sessions SET expires_at=0").run();
      expect(auth.identity(request({}, r.token))).toBe(null);
    } finally {
      db.close();
    }
  });
  it("retains daily analysis claims across guard instances and enforces one running job", () => {
    const db = new Database(":memory:");
    try {
      const one = createAnalysisGuard(db, 2, 1);
      expect(one.claim("project-1")).toBe(true);
      expect(one.claim("project-2")).toBe(false);
      one.release();
      expect(one.claim("project-1")).toBe(false);
      const restarted = createAnalysisGuard(db, 2, 1);
      expect(restarted.claim("project-1")).toBe(false);
      expect(restarted.claim("project-2")).toBe(true);
      restarted.release();
      expect(restarted.claim("project-3")).toBe(false);
    } finally {
      db.close();
    }
  });
});
