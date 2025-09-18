import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import data from "../config/config.js";

const router = express.Router();

const userProxy = createProxyMiddleware({
  target: data.USER_SERVICE_URL, // http://localhost:5005
  changeOrigin: true,
  pathRewrite: {
    "^/api/users": "", // ✅ adjust if your backend expects `/user/...`
  },
  logLevel: "debug", // enables built-in detailed logs
  onProxyReq: (proxyReq, req, res) => {
    console.log("[User Gateway] Incoming URL:", req.originalUrl);
    console.log(
      "[User Gateway] Forwarding to:",
      data.USER_SERVICE_URL + proxyReq.path
    );
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(
      "[User Gateway] Response from target:",
      proxyRes.statusCode,
      req.originalUrl
    );
  },
  onError: (err, req, res) => {
    console.error("[User Gateway] Proxy error:", err.message);
    res.status(500).json({ message: "Proxy to UserService failed." });
  },
});

router.use("/", userProxy);

export { router as userRoutes };
