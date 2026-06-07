# Creo Photo Finder

A standalone AI face recognition event photo finder built with Next.js, Tailwind CSS, PostgreSQL, Prisma, AWS S3, and CompreFace.

## What this MVP does

- Secure admin login with protected admin pages
- Event create/edit/open/close flow
- Public QR code per event
- Multi-photo upload to S3
- Preview image generation
- CompreFace face detection, face indexing, and selfie recognition
- Guest PIN gate, consent, selfie search, and matched-photo results
- Event-specific face data and protected preview access

This app intentionally does not include payments, M-PAiSA, print orders, paid downloads, or order status.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in PostgreSQL, AWS S3, CompreFace, app URL, and session secret values.
3. Install dependencies:

```bash
npm install
```

4. Create the database schema and first admin:

```bash
npm run prisma:migrate
npm run seed
```

5. Start the app:

```bash
npm run dev
```

## AWS notes

The AWS user needs permission for:

- S3: `PutObject`, `GetObject`, `DeleteObject`

Images are stored in S3 with private objects. Guests only see previews through protected app routes that issue short-lived signed URLs.

## CompreFace notes

Run CompreFace separately from this app and create:

- One Face Recognition service API key
- One Face Detection service API key

CompreFace REST docs describe adding subject examples at `/api/v1/recognition/faces` and recognizing uploaded images at `/api/v1/recognition/recognize`. This app stores each detected event face as an event-prefixed CompreFace subject, then filters guest matches back to the selected event.

CompreFace is distributed as a Docker Compose stack, so host it separately from the Render Next.js web service, for example on an AWS EC2 instance, DigitalOcean droplet, Fly.io machine, or another Docker-capable server. Set `COMPREFACE_BASE_URL` to the public HTTPS URL for that CompreFace API.

## Render

Use `render.yaml` as a starting point for the Next.js app. Set the environment variables in Render and run migrations before first use. The build command includes `prisma migrate deploy` for production migrations.
