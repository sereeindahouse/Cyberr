import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ensureMongoCollections } from "../mongodb";
import { apiLimiter, oauthCallbackLimiter } from "../rateLimit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  if (process.env.MONGODB_URI) {
    try {
      await ensureMongoCollections();
      console.log("[MongoDB] reports and tags collections are ready");
    } catch (error) {
      console.error("[MongoDB] Collection initialization failed:", error);
    }
  } else {
    console.warn(
      "[MongoDB] MONGODB_URI is not set — reports will only live in process memory " +
        "and are LOST ON RESTART. Set MONGODB_URI in .env for real persistence."
    );
  }

  const app = express();
  const server = createServer(app);
  // The site is served behind a TLS-terminating proxy; trust exactly one
  // hop so req.ip (rate limiting) and the cookie Secure flag (X-Forwarded-Proto)
  // see the real client instead of the proxy. AUDIT.md S6.
  app.set("trust proxy", 1);
  // 8 MB is generous for the report payloads this API accepts (the router
  // caps a single report at ~1.8 MB) and stops anonymous bulk-upload abuse
  // that a 50 MB limit would happily accept.
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ limit: "8mb", extended: true }));
  // Per-IP rate limits on every public endpoint (AUDIT.md §5.4): the tRPC
  // API, the signed-URL proxy, and a far tighter budget for the OAuth
  // callback which mints sessions.
  app.use("/api", apiLimiter);
  app.use("/manus-storage", apiLimiter);
  app.use("/api/oauth/callback", oauthCallbackLimiter);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  const altPort = port === 3003 ? 3000 : 3003;
  if (await isPortAvailable(altPort)) {
    try {
      const altServer = createServer(app);
      altServer.listen(altPort, () => {
        console.log(`Also running on http://localhost:${altPort}/`);
      });
    } catch {}
  }
}

startServer().catch(console.error);
