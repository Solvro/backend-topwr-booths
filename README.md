# Backend ToPWR Booths

Booth occupancy monitoring API built with AdonisJS 6, PostgreSQL, and Lucid ORM.

## Overview

The service stores:

- booth metadata in `booths`
- occupancy history in `booth_statuses` (append-only)
- uploaded files in `file_entries`

Devices send status every minute. A booth is considered offline when its latest status is older than 3 minutes.

## Features

- Token-secured write endpoints (`x-api-token`)
- Booth registry endpoint (`POST /api/v1/booths`)
- Historical status tracking (`booth_statuses`)
- File upload with generated miniatures (Sharp + Drive)
- Public URLs for original and miniature images
- Swagger docs at `/api/v1/docs`

## Quick Start

```bash
# 1) Install dependencies
npm install

# 2) Configure environment
cp .env.example .env

# 3) Fresh database setup
node ace migration:fresh

# 4) Generate API token (save it)
node ace generate:token "test-device"

# 5) Start server
npm run dev

# 6) Open docs
open http://localhost:3333/api/v1/docs
```

## Environment

Required values are in `.env.example`:

- `APP_URL` - base URL for generated file links
- `MINIATURE_MAX_HEIGHT_PX` - thumbnail max height
- `MINIATURE_MAX_PROCESSING_TIME_S` - Sharp processing timeout
- DB connection vars (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`)

## API Endpoints

| Method | Path                      | Auth  | Description                                        |
| ------ | ------------------------- | ----- | -------------------------------------------------- |
| POST   | `/api/v1/files`           | Token | Upload file, returns `key` (`uuid.ext`)            |
| GET    | `/api/v1/files/:key`      | -     | Get file metadata (`url`, `miniaturesUrl`)         |
| POST   | `/api/v1/booths`          | Token | Create booth metadata                              |
| POST   | `/api/v1/status`          | Token | Append booth status and optionally update metadata |
| GET    | `/api/v1/status`          | -     | Get latest status for all booths                   |
| GET    | `/api/v1/status/:boothId` | -     | Get latest status for one booth                    |
| GET    | `/api/v1/healthcheck`     | -     | Health endpoint                                    |

Uploaded files are also served publicly by Drive:

- original: `/uploads/:key`
- miniature: `/uploads/miniatures/:key`

## Request Examples

### 1) Upload booth photo

```bash
curl -X POST http://localhost:3333/api/v1/files \
  -H "x-api-token: YOUR_TOKEN" \
  -F "file=@/path/to/photo.jpg"
```

Example response:

```json
{ "key": "7f73b6d8-0f8e-4f9a-a4e0-c95f2f1f3a20.jpg" }
```

### 2) Create booth with metadata

```bash
curl -X POST http://localhost:3333/api/v1/booths \
  -H "x-api-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booth_id": "booth-1",
    "booth_name": "Main Booth",
    "photo_key": "7f73b6d8-0f8e-4f9a-a4e0-c95f2f1f3a20.jpg",
    "localization": "Building C, floor 1, near the main stairs"
  }'
```

### 3) Send occupancy update

```bash
curl -X POST http://localhost:3333/api/v1/status \
  -H "x-api-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booth_id": "booth-1",
    "booth_name": "Main Booth",
    "is_occupied": true
  }'
```

### 4) Read current status

```bash
curl http://localhost:3333/api/v1/status
curl http://localhost:3333/api/v1/status/booth-1
```

## Testing

```bash
# Run static checks
npm run typecheck

# Run API smoke script (expects running server and valid token)
./test-api.sh YOUR_TOKEN
```

## License

AGPL-3.0
