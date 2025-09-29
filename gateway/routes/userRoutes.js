import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import data from "../config/config.js";

const router = express.Router();

// Create a proxy middleware for user routes. Whenever the request corresponds to /api/user, redirect to user service running on USER_SERVICE_URL
const userProxy = createProxyMiddleware({
  target: data.USER_SERVICE_URL, 
  changeOrigin: true,
  pathRewrite: {
    "^/api/users": "", 
  },
  logLevel: "debug", 
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
