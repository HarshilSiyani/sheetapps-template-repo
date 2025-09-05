# CORS Configuration Fix for SheetApps API

## The Problem
The API at `https://sheet-apps-nextjs.vercel.app/api/v1/` is returning:
```
Access-Control-Allow-Origin: null
```

This blocks requests from localhost development environments.

## Server-Side Fix Required

### For Next.js API Routes (Vercel Deployment)

If your API is built with Next.js API routes, update your API handler:

```javascript
// In your API route file (e.g., pages/api/v1/sheets/[...params].js or app/api/v1/sheets/[...params]/route.js)

export async function handler(req, res) {
  // CORS headers
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:5173',  // Vite default
    'https://your-production-domain.com'
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Access-Control-Max-Age', '3600');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Your existing API logic here
}
```

### For Next.js 13+ App Router

```javascript
// app/api/v1/sheets/[...params]/route.js

import { NextResponse } from 'next/server';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002', 
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:5173',
  'https://your-production-domain.com'
];

export async function GET(request) {
  const origin = request.headers.get('origin');
  
  // Your existing API logic
  const response = NextResponse.json(data);
  
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  
  return response;
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin');
  
  const response = new NextResponse(null, { status: 200 });
  
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  response.headers.set('Access-Control-Max-Age', '3600');
  
  return response;
}
```

### Using Vercel Configuration (vercel.json)

Alternatively, you can configure CORS at the Vercel level:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, Authorization" }
      ]
    }
  ]
}
```

### For Express/Node.js Backend

If using Express:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:5173',
      'https://your-production-domain.com'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

app.use(cors(corsOptions));
```

## Quick Fix for Development (Less Secure)

For development only, you could allow all origins:

```javascript
// WARNING: Only use this for development!
res.setHeader('Access-Control-Allow-Origin', '*');
```

## Testing the Fix

After deploying the fix, test with:

```bash
curl -I -X OPTIONS \
  -H "Origin: http://localhost:3004" \
  -H "Access-Control-Request-Method: GET" \
  https://sheet-apps-nextjs.vercel.app/api/v1/sheets/test
```

You should see:
```
Access-Control-Allow-Origin: http://localhost:3004
```

Not:
```
Access-Control-Allow-Origin: null
```

## Important Notes

1. **Never use `Access-Control-Allow-Origin: null`** - it's not valid and browsers will reject it
2. **For production**, use a specific list of allowed origins rather than `*`
3. **Remember to handle OPTIONS preflight requests** - they're sent before the actual request
4. **Include all necessary headers** that your client might send (like `x-api-key`)

## Recommended Immediate Action

Since the API is deployed on Vercel, the fastest fix is to:

1. Add the `vercel.json` configuration to your API repository
2. Or update your API route handlers with proper CORS headers
3. Redeploy to Vercel

The CORS error will be resolved immediately after deployment.