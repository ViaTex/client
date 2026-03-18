# Client Env Debug

This folder stores local environment templates for debugging frontend-backend integration.

## How to use

1. Copy `env/env.local.example` to `.env.local` in the client root.
2. Restart the Next.js dev server after updates.

## Required variable

- `NEXT_PUBLIC_API_URL`

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
