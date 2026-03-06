<!-- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Help!
seed Db with "npx prisma db seed" -->



# SunCity Insurance – Insurer Pricing & Quoting Portal

A secure, role-based web application built for SunCity Hot Water certified insurers.  
Allows quick pricing of hot water systems, generation of locked quotes, direct lead submission to the SunCity CRM (UnityCRM), and branded PDF downloads — all with strict admin approval workflows.

Live demo: https://sun-city-insurance.vercel.app (or your custom domain)

## What the App Does

Insurers (approved partners) can:
- Log in securely (email + password)
- Use a real-time pricing tool:
  - Select region (e.g. Sunshine Coast, Brisbane Southside)
  - Choose system type (Electric, Heat Pump, Solar Thermosiphon, Solar Split)
  - Add optional extras
  - See instant pricing (ex-GST, GST, total inc-GST)
- Enter customer details (name, email, phone, suburb, postcode, property type, existing system type & location)
- Confirm & lock the quote → creates immutable record
- Download branded PDF with logo, customer info, system details, and full price breakdown
- Automatically send lead to SunCity CRM (UnityCRM) with correct enum codes and UTM source "App"

Admins can:
- Receive email notifications for new registrations (via Resend)
- Approve or reject new insurers via secure links
- (Future: view all quotes, users, leads)

## Tech Stack

- **Framework**: Next.js 14+ (App Router) – Server Components + Client Components
- **Language**: TypeScript
- **Database**: PostgreSQL (hosted on Neon serverless)
- **ORM**: Prisma (migrations, seeding, type-safe queries)
- **Authentication**: NextAuth.js (Credentials provider – email/password)
- **Password Hashing**: bcrypt
- **Email Sending**: Resend (transactional emails with approval links)
- **PDF Generation**: @react-pdf/renderer (branded PDFs with logo & dynamic data)
- **Styling**: Tailwind CSS (with brand-specific pastel colors)
- **Deployment**: Vercel (automatic CI/CD, env vars)
- **Other libraries**:
  - React Hook Form / Zod (form validation – if used)
  - React PDF for client previews (optional)

## Features Implemented

- Secure registration with pending approval
- Admin approval/rejection via email links (Resend)
- Role-based access (admin vs insurer)
- Real-time pricing calculator (region + system + extras)
- Customer details form with required fields
- Immutable quote confirmation + snapshot in DB
- Branded PDF download (logo, customer info, price breakdown)
- Direct integration with UnityCRM lead endpoint
- UTM tracking (`utm_source: "App"`)
- Local + production env separation

## Getting Started (Local Development)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/sun-city-insurance.git
cd sun-city-insurance


2. Install dependenciesbash

npm install

3. Set up environment variablesCreate .env in the root folder:env

# Database (Neon or local Postgres)
DATABASE_URL="postgresql://user:pass@your-host.neon.tech/dbname?sslmode=require"

# NextAuth (required for sessions)
NEXTAUTH_SECRET="your-random-32-char-secret"          # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# CMS / UnityCRM integration
CMS_API_KEY="your-unity-crm-key"
CMS_API_SECRET="your-unity-crm-secret"

# Resend (email sending)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
ADMIN_EMAIL="admin@suncityhotwater.com.au"
RESEND_FROM_EMAIL="admin@suncityhotwater.com.au"  # After domain verification

# App base URL (used in emails & CMS payload)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

4. Run Prisma migrations & seed the databasebash

# Apply schema migrations
npx prisma migrate dev

# Seed regions, systems, extras, etc. (check prisma/seed.ts for data)
npx prisma db seed

5. Start the development serverbash

npm run dev

Open http://localhost:3000 in your browser.Production Deployment (Vercel)Push code to GitHub
Go to vercel.com → New Project → Import GitHub repo
Add all environment variables in Vercel → Settings → Environment Variables (Production scope)Use the same keys/values as .env.local
Especially: DATABASE_URL (production Neon), NEXTAUTH_SECRET, NEXTAUTH_URL (your live domain), CMS_API_*, RESEND_API_KEY, etc.

Deploy → Vercel handles build & hosting
After deploy:Verify domain in Resend dashboard → add DNS records for suncityhotwater.com.au
Test full flow: register → approval email → login → quote → PDF → CMS lead

Database SeedingTo populate test data (regions, systems, extras, prices):bash

npx prisma db seed

This runs the seed script (prisma/seed.ts or prisma/seed.js). Run after migrations or when resetting DB.Contributing & HelpFound a bug? Open an issue with steps to reproduce.
Want a new feature? Fork → branch → PR.
Questions or need help? Open an issue or contact Oop Design.

Built with  for SunCity Hot Water partners to make quoting fast, secure, and accurate.Last updated: March 2026

##
# app/api/elevenlabs/middleware/ai-lead/route.ts
is used as the middleware to convert the Human nameing into the suncity Dataset for SYSTEM_TYPE, enquiry_types, property_types & system_locations
the endpoint will become 
# http://localhost:3000/api/elevenlabs/middleware/ai-lead
# or 
# https://sun-city-insurance.vercel.app/api/elevenlabs/middleware/ai-lead
##