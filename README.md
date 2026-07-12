# Muhandis.uz

Engineering & technology content platform built with Next.js 15 + Payload CMS 3.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Payload CMS 3.x** (co-located in the same app)
- **PostgreSQL** (via @payloadcms/db-postgres)
- **Tailwind CSS 3**
- **Deploy**: Railway (primary), Docker Compose / VPS (fallback)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Edit .env with your DATABASE_URI and PAYLOAD_SECRET

# Start dev server
npm run dev

# Seed categories
npx tsx scripts/seed.ts
```

## Project Structure

```
src/
├── app/
│   ├── (payload)/       # Payload admin (route group)
│   ├── [locale]/        # Public routes with locale prefix
│   │   ├── articles/    # Article hub + detail
│   │   ├── hackathons/  # Programs hub + detail
│   │   ├── projects/    # Student projects gallery + detail
│   │   ├── mentors/     # Mentor directory + profile
│   │   ├── team/        # Core team
│   │   ├── glossary/    # Bilingual engineering glossary
│   │   ├── about/       # Mission + computed stats
│   │   └── contact/     # Contact form (frontend only)
│   └── middleware.ts    # Locale routing (/uz/, /en/)
├── collections/         # Payload collection configs
├── components/          # Shared React components
├── globals/             # Payload global configs
└── utilities/           # Helpers (getPayload, richText)
```

## Deployment

### Railway (primary)

1. Push to GitHub
2. Create a new Railway project from the repo
3. Add a PostgreSQL plugin
4. Set environment variables:
   - `DATABASE_URI` from Railway Postgres plugin
   - `PAYLOAD_SECRET` (generate a random string)
   - `NEXT_PUBLIC_SERVER_URL` = your railway URL
5. Deploy — migrations run automatically

### Docker / VPS (fallback)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: muhandissuz
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URI: postgresql://postgres:secret@postgres:5432/muhandissuz
      PAYLOAD_SECRET: your-secret
      NEXT_PUBLIC_SERVER_URL: http://localhost:3000
    depends_on:
      - postgres

volumes:
  pgdata:
```

## WordPress Migration

```bash
# Install dependency
npm install -D fast-xml-parser

# Run migration
npx tsx scripts/migrate-wp.ts path/to/wordpress-export.xml
```

Check `scripts/migration-issues.json` for anything that couldn't be mapped.

## Future Options

- **Contributor role**: restricted access for students to submit draft projects
- **3D Model Viewer**: `<model-viewer>` web component wired to `StudentProjects.model3d`
