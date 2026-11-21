import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Local dev: serve /api/contact through Vite so the contact form works with `npm run dev`
// (on Vercel the same file in /api runs as a serverless function). Reads RESEND_API_KEY from .env.local.
function contactApi(env) {
  return {
    name: "contact-api",
    configureServer(server) {
      server.middlewares.use("/api/contact", async (req, res) => {
        Object.assign(process.env, env);
        let raw = "";
        for await (const chunk of req) raw += chunk;
        try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
        const shim = {
          setHeader: (k, v) => res.setHeader(k, v),
          status(code) { res.statusCode = code; return shim; },
          json(obj) { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); return shim; },
        };
        try {
          const mod = await server.ssrLoadModule("/api/contact.js");
          await mod.default(req, shim);
        } catch (e) {
          shim.status(500).json({ error: "Contact endpoint failed to start." });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return { plugins: [react(), contactApi(env)] };
});
