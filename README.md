# 🚀 AI Resume Screener

> Automated resume screening system built with Next.js, OpenAI, and modern TypeScript stack. Features ATS optimization, skill gap analysis, and professional career coaching powered by AI.

## ✨ Features

- **📄 Multi-format Resume Parsing** — Upload PDF and DOCX with `pdf-parse` + `mammoth`
- **🤖 AI-powered Analysis** — Multi-stage pipeline using OpenAI SDK for resume scoring, ATS optimization, and skill gap detection
- **📊 Job Progress Tracking** — Real-time checkpoint-based progress with `BullMQ` + Upstash Redis
- **💼 Career Coaching** — AI-driven suggestions for professional development
- **🔐 Secure Auth** — NextAuth v5 + Prisma adapter + Cloudflare Turnstile bot protection
- **📧 Email Notifications** — Nodemailer + Resend for transactional emails
- **🎨 Modern UI** — Tailwind CSS v4 + Radix-style components + react-day-picker
- **⚡ Optimistic State** — Zustand stores + TanStack Query for client/server state

## 🛠 Tech Stack

| Layer     | Technology                                                 |
| --------- | ---------------------------------------------------------- |
| Framework | Next.js 16.2.4 (App Router) + React 19.2.4                 |
| Language  | TypeScript 5                                               |
| Styling   | Tailwind CSS v4 + tailwind-variants + tailwind-merge       |
| Auth      | NextAuth v5 (beta) + Prisma adapter + Cloudflare Turnstile |
| Database  | PostgreSQL via Prisma 7 + Supabase                         |
| Queue     | BullMQ + Upstash Redis + ioredis                           |
| AI        | OpenAI SDK v6                                              |
| Email     | Nodemailer + Resend                                        |
| State     | Zustand + TanStack Query                                   |
| Forms     | react-hook-form + Zod validation                           |
| PDF/DOCX  | react-pdf + mammoth + pdf-parse                            |
| Container | Docker (multi-stage build) + docker-compose                |

## 📁 Project Structure

```
.
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (sign-in, sign-up)
│   ├── (dashboard)/              # Authenticated dashboard pages
│   ├── api/                      # API route handlers
│   ├── globals.css               # Global Tailwind styles
│   └── layout.tsx                # Root layout
├── components/
│   ├── features/                 # Feature-specific components
│   ├── providers/                # React context providers
│   ├── shared/                  # Reusable shared components
│   └── ui/                      # Base UI primitives
├── lib/
│   ├── errors/                   # Custom error classes
│   ├── helpers/                  # Utility helpers
│   ├── hooks/                    # Shared React hooks
│   ├── queue/                    # BullMQ queue setup
│   ├── types/                    # Shared TypeScript types
│   ├── utils/                    # Utility functions
│   ├── axios.ts                  # Axios instance config
│   ├── db.ts                     # Prisma client singleton
│   ├── open-ai.ts                # OpenAI client
│   ├── smpt.ts                   # Nodemailer SMTP config
│   ├── supabase-admin.ts         # Supabase admin client
│   └── tanstack-query.ts         # TanStack Query config
├── prisma/
│   ├── migrations/               # Database migrations
│   └── schema.prisma             # Prisma schema
├── public/                       # Static assets
├── schemas/                      # Zod validation schemas
├── scripts/
│   └── start-worker.ts           # BullMQ worker entry
├── services/
│   ├── client/                   # Client-side API services
│   └── server/                   # Server-side API services
├── stores/                       # Zustand state stores
├── const/                        # Constants (navigation, prompts)
├── auth.ts                       # NextAuth config
├── auth.config.ts                # Auth providers config
├── proxy.ts                      # Next.js middleware proxy
├── routes.ts                     # Route definitions
├── next.config.ts                # Next.js config
├── tsconfig.json                 # TypeScript config
├── eslint.config.mjs             # ESLint config
├── prettier.config.json          # Prettier config
├── commitlint.config.js          # Commitlint (conventional commits)
├── Dockerfile                    # Multi-stage Docker build
└── docker-compose.yaml           # Docker compose for local dev
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (or Supabase project)
- Upstash Redis account
- OpenAI API key
- Cloudflare Turnstile site/secret keys
- Resend API key (or SMTP credentials)

### Installation

```bash
# Clone the repository
git clone https://github.com/ilhamdhiya01/AI-Resume-Screener.git
cd AI-Resume-Screener

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, OPENAI_API_KEY, etc.

# Run database migrations
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma generate
```

### Development

```bash
# Run Next.js dev server (port 3002)
pnpm dev

# Run BullMQ worker in separate terminal
pnpm worker

# Run both concurrently
pnpm dev:all
```

Open [http://localhost:3002](http://localhost:3002) to see the app.

### Build

```bash
pnpm build
pnpm start
```

### Linting & Formatting

```bash
pnpm lint          # ESLint
pnpm format        # Prettier
```

## 🐳 Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Or build standalone image
docker build -t ai-resume-screener .
```

The Dockerfile uses multi-stage build for optimized production image size.

## 📝 Scripts

| Script         | Description                           |
| -------------- | ------------------------------------- |
| `pnpm dev`     | Start Next.js dev server on port 3002 |
| `pnpm worker`  | Start BullMQ worker process           |
| `pnpm dev:all` | Run dev server + worker concurrently  |
| `pnpm build`   | Production build                      |
| `pnpm start`   | Start production server               |
| `pnpm lint`    | Run ESLint                            |
| `pnpm format`  | Format with Prettier                  |
| `pnpm prepare` | Install Husky git hooks               |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint + husky)
4. Push to the branch
5. Open a Pull Request

Commit types allowed: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## 📄 License

This project is private and proprietary. All rights reserved.

## 👤 Author

**Ilham Dhiya Ulhaq** — [@ilhamdhiya01](https://github.com/ilhamdhiya01)
