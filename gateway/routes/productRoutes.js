import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import data from "../config/config.js";

const router = express.Router();

const productProxy = createProxyMiddleware({
  target: data.PRODUCT_SERVICE_URL, // http://localhost:5052
  changeOrigin: true,
  pathRewrite: {
    "^/api/products": "",
  },
  logLevel: "debug", // 👈 built-in detailed logging
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
    res.status(500).json({ message: "Proxy to ProductService failed." });
  },
});

router.use("/", productProxy);

export { router as productRoutes };
