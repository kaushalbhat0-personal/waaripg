<!-- BEGIN:nextjs-agent-rules -->
<!-- This is NOT the Next.js you know -->
<!-- This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. -->
<!-- END:nextjs-agent-rules -->

# WaaRi PG & Hostel Management

## Architecture
- Feature-first architecture under `src/features/`
- Shared components under `src/shared/`
- Business logic in `src/services/`
- Data access in `src/repositories/`
- Supabase client in `src/lib/supabase/`

## Conventions
- Server Actions for mutations
- Server Components by default
- "use client" only when needed
- Strict TypeScript everywhere
- Zod for validation
- React Hook Form for forms
- DataTable for table views
- PageContainer + PageHeader for pages

## Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint
- `npm run format` - Prettier
- `npm run typecheck` - TypeScript check
- `npm run db:types` - Regenerate Supabase types
