// userRoutes.js
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import data from '../config/config.js';
import { authMiddleware } from '../auth/auth.js';

const router = express.Router();

// With no global body-parser, the proxy can stream the request body automatically.
// The `onProxyReq` handler is no longer needed.
const userProxy = createProxyMiddleware({
    target: data.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/users': '/user',
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ message: 'Proxy to UserService failed.' });
    }
});

// Use the proxy for all routes in this router
router.use('/', userProxy);

export { router as userRoutes };