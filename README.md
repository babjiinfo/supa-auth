# Supabase Compliance Checker

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Overview

This application helps Supabase users check and ensure compliance with best practices. It checks the following:

- **MFA**: Whether Multi-Factor Authentication is enabled for all users.
- **RLS**: Whether Row-Level Security is enabled for all tables.

The app provides options to view compliance results and log evidence, and offers an option to auto-fix certain issues.

## Features

1. **Authenticate with Supabase**

   - Authenticate users through Supabase.

2. **Run Compliance Checks**

   - **MFA Check**: List all users and determine whether MFA is enabled.
   - **RLS Check**: List all tables and determine whether Row-Level Security (RLS) is enabled.

3. **Log Evidence**

   - Collect and store logs of the checks with timestamps.

4. **Bonus Features**
   - **Auto-Fix**: Automatically fix certain compliance issues such as enabling MFA, RLS, and PITR.
   - **AI Help**: Use AI (via OpenAI or other models) to assist users in resolving compliance issues.

## Getting Started

### Prerequisites

Before you can start, you need to have a Supabase account and project. You’ll also need an API key to interact with Supabase via the app.

Clone this repository:

```bash
git clone https://github.com/babjiinfo/supa-auth/
cd supa-auth
```

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
