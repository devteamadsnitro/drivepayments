import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(req: Request): CookieOptions {
  // Railway termina TLS en su proxy; en local (http://localhost) la cookie no
  // puede ser Secure o el navegador la descarta.
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(req.headers.host ?? "");
  return { httpOnly: true, path: "/", sameSite: "strict", secure: !local };
}
