import cors from 'cors';

const allowedOrigin = process.env.CLIENT_APP_URI;

export const corsPolicy = cors({
  origin: allowedOrigin,
  methods: 'GET,PUT,PATCH,POST,DELETE',
  // `X-Csrf-Token` must be provided, otherwise the request would be blocked
  // allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Csrf-Token'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin',],
  // credentials must be allowed, othewise cookies won't be sent to the client
  credentials: true,
});
