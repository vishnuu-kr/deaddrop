# DeadDrop — Ghost Protocol Messaging

> *Zero accounts. Zero identities. Zero traces.*

DeadDrop is an anonymous, link-based geofenced messaging platform built on a **"ghost protocol"** architecture. The Operator creates encrypted dead-drops at any location on Earth. The Agent receives a burner link — the *only* thing that can decrypt the message. Once read, the drop self-destructs permanently.

## Architecture

```
Operator (Sender)                    Server (Blind Courier)              Agent (Recipient)
─────────────────                    ──────────────────                  ──────────────────
1. Click map to target
2. Type message
3. Generate AES-256 key    ───►    Store encrypted blob              Fetch encrypted blob
   (Web Crypto API)                 + coordinates only                 + proximity check
4. Build burner link                                      ◄───       Decrypt with URL hash key
   key in #hash (never sent)                                       5. Read message
                                                                      6. BURN (server deletes payload)
```

### Zero-Knowledge Design

| Entity | Knows | Does NOT Know |
|--------|-------|---------------|
| **Server** | Coordinates, encrypted blob, radius | Message content, encryption key, sender identity, recipient identity |
| **Operator** | Message, target location, burner link | Whether the Agent has read it |
| **Agent** | URL (contains key in #hash) | Who sent it, what it says until in range |

## Tech Stack

- **Frontend & API:** Next.js 15 (React 19) + TypeScript
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Maps:** Leaflet + CartoDB Dark Matter (free, open-source, no API key)
- **Encryption:** Web Crypto API (browser-native AES-256-GCM)
- **Styling:** Tailwind CSS 4

## Database Schema

A single lean table. The server is a blind courier — it knows nothing about the content.

```sql
CREATE TABLE dead_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encrypted_payload TEXT NOT NULL,    -- AES-256-GCM ciphertext (base64)
  iv TEXT NOT NULL,                    -- Initialization vector
  target_location GEOGRAPHY(Point),    -- PostGIS coordinates
  unlock_radius INTEGER NOT NULL,      -- Proximity threshold in meters
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
  is_burned BOOLEAN DEFAULT FALSE,     -- Self-destruct flag
  burn_count INTEGER DEFAULT 0
);
```

## Getting Started

### 1. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Enable the **PostGIS** extension (Database → Extensions)
3. Run the SQL in `database/schema.sql` in the SQL Editor

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

### Operator Flow (Create)

1. Open the app → click **[ CREATE DEAD DROP ]**
2. Click anywhere on the map (or use your current location)
3. Adjust the unlock radius (10m–500m)
4. Type your message
5. Click **[ DEPLOY DEAD DROP ]**
   - A random AES-256 key is generated in your browser
   - Your message is encrypted locally
   - Only the encrypted blob + coordinates are stored in the database
   - You receive a **burner link** with the key embedded in the URL hash
6. Share the link with the Agent

### Agent Flow (Track & Unlock)

1. Open the burner link
2. The app extracts the key from `#hash` (never sent to server)
3. The radar view guides you toward the target:
   - **Far range (>500m):** Abstract radar with compass arrow and proximity meter
   - **Near range (<500m):** Tactical map showing your position vs. the target pin
4. When you enter the unlock radius, the message decrypts automatically
5. **The drop burns:** the server deletes the encrypted payload permanently
6. Even with the same link, no one can ever decrypt it again

### The Burn (Self-Destruct)

When the Agent is within range:

1. The client fetches the encrypted payload from the database
2. The message is decrypted locally using the URL hash key
3. The client calls `POST /api/burn` with their coordinates
4. **Server validates proximity** (zero-trust — prevents spoofing)
5. If valid, the server permanently deletes the encrypted payload
6. The Agent sees the decrypted message with a "BURNED" confirmation

## Security Model

### What's Protected

- **Message content:** Encrypted AES-256-GCM, key never leaves the client
- **Sender/Recipient identity:** Non-existent. No accounts, no profiles, no metadata
- **Server knowledge:** Only coordinates and ciphertext
- **Replay attacks:** Burn-on-read means each drop works exactly once

### Anti-Spoofing

- **Zero-trust proximity validation:** The server independently verifies the Agent's coordinates before allowing decryption
- **Accuracy thresholds:** Rejects GPS readings that are suspiciously precise or too inaccurate
- **24-hour expiration:** Drops auto-expire even if never read

### Limitations

- GPS spoofing via browser dev tools is theoretically possible
- The server trusts the coordinates sent to the burn endpoint (mitigated by server-side validation)
- For higher assurance, a native mobile app with attestation would be needed

## Project Structure

```
dead-drop/
├── app/
│   ├── api/burn/          # Server-side burn endpoint (zero-trust validation)
│   ├── create/            # Operator: map → encrypt → deploy
│   ├── track/[id]/        # Agent: radar/map → unlock → burn
│   ├── layout.tsx         # Root layout (no auth)
│   └── page.tsx           # Landing page (cyberpunk terminal aesthetic)
├── lib/
│   ├── crypto/encryption.ts   # Web Crypto API (AES-256-GCM)
│   ├── geo/                   # Haversine, bearing, validation
│   └── supabase/              # Database clients
├── database/schema.sql        # Complete PostGIS schema
└── types/database.ts          # TypeScript definitions
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/burn` | POST | Server-side proximity validation + payload destruction |

All other operations are performed directly against Supabase from the client (RLS allows anonymous read/write).

## Key Concepts

- **Burner Link:** `https://app.com/track/{uuid}#{key}` — The key is after the `#` and is **never transmitted to any server**
- **Zero-Knowledge:** The server stores encrypted blobs it cannot read
- **Ghost Protocol:** No identities, no sessions, no cookies, no accounts
- **Dead Drop:** A physical-location-based message delivery system inspired by espionage tradecraft

## License

MIT
