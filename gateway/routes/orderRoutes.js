import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import data from "../config/config.js";

const router = express.Router();

// Create a proxy middleware for order routes. Whenever the request corresponds to /api/orders, redirect to order service running on ORDER_SERVICE_URL
const orderProxy = createProxyMiddleware({
  target: data.ORDER_SERVICE_URL, 
  changeOrigin: true,
  pathRewrite: {
    "^/api/orders": "",
  },
  logLevel: "debug", 
  onProxyReq: (proxyReq, req, res) => {
    console.log("[Gateway] Incoming URL:", req.originalUrl);
    console.log(
      "[Gateway] Forwarding to:",
      data.PRODUCT_SERVICE_URL + proxyReq.path
    );
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(
      "[Gateway] Response from target:",
      proxyRes.statusCode,
      req.originalUrl
    );
  },
  onError: (err, req, res) => {
    console.error("[Gateway] Proxy error:", err.message);
    res.status(500).json({ message: "Proxy to OrderService failed." });
  },
});

router.use("/", orderProxy);

export { router as orderRoutes };
