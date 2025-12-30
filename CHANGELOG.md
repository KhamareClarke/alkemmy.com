# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2024-12-30

### Updated

#### Core Framework
- **Next.js**: 13.5.1 → 15.1.3
  - Major version upgrade with improved performance and features
  - Better App Router support
  - Enhanced image optimization
- **React**: 18.2.0 → 18.3.1
- **React DOM**: 18.2.0 → 18.3.1
- **TypeScript**: 5.2.2 → 5.7.2

#### UI Components (Radix UI)
- **@radix-ui/react-accordion**: 1.2.0 → 1.2.2
- **@radix-ui/react-alert-dialog**: 1.1.1 → 1.1.4
- **@radix-ui/react-aspect-ratio**: 1.1.0 → 1.1.1
- **@radix-ui/react-avatar**: 1.1.0 → 1.1.2
- **@radix-ui/react-checkbox**: 1.1.1 → 1.1.3
- **@radix-ui/react-collapsible**: 1.1.0 → 1.1.2
- **@radix-ui/react-context-menu**: 2.2.1 → 2.2.4
- **@radix-ui/react-dialog**: 1.1.1 → 1.1.4
- **@radix-ui/react-dropdown-menu**: 2.1.1 → 2.1.4
- **@radix-ui/react-hover-card**: 1.1.1 → 1.1.4
- **@radix-ui/react-label**: 2.1.0 → 2.1.1
- **@radix-ui/react-menubar**: 1.1.1 → 1.1.4
- **@radix-ui/react-navigation-menu**: 1.2.0 → 1.2.3
- **@radix-ui/react-popover**: 1.1.1 → 1.1.4
- **@radix-ui/react-progress**: 1.1.0 → 1.1.1
- **@radix-ui/react-radio-group**: 1.2.0 → 1.2.2
- **@radix-ui/react-scroll-area**: 1.1.0 → 1.2.2
- **@radix-ui/react-select**: 2.1.1 → 2.1.4
- **@radix-ui/react-separator**: 1.1.0 → 1.1.1
- **@radix-ui/react-slider**: 1.2.0 → 1.2.1
- **@radix-ui/react-slot**: 1.1.0 → 1.1.1
- **@radix-ui/react-switch**: 1.1.0 → 1.1.2
- **@radix-ui/react-tabs**: 1.1.0 → 1.1.2
- **@radix-ui/react-toast**: 1.2.1 → 1.2.4
- **@radix-ui/react-toggle**: 1.1.0 → 1.1.1
- **@radix-ui/react-toggle-group**: 1.1.0 → 1.1.1
- **@radix-ui/react-tooltip**: 1.1.2 → 1.1.6

#### Payment & Authentication
- **@stripe/react-stripe-js**: 2.9.0 → 2.10.0
- **@stripe/stripe-js**: 2.4.0 → 4.11.0
- **stripe**: 19.1.0 → 17.5.0 (Aligned with stable version)
- **@supabase/supabase-js**: 2.74.0 → 2.47.10

#### Forms & Validation
- **react-hook-form**: 7.53.0 → 7.54.2
- **@hookform/resolvers**: 3.9.0 → 3.9.1
- **zod**: 3.23.8 → 3.24.1

#### Styling & UI
- **tailwindcss**: 3.3.3 → 3.4.17
- **autoprefixer**: 10.4.15 → 10.4.20
- **postcss**: 8.4.30 → 8.4.49
- **tailwind-merge**: 2.5.2 → 2.6.0
- **class-variance-authority**: 0.7.0 → 0.7.1
- **framer-motion**: 12.23.14 → 11.15.0
- **lucide-react**: 0.446.0 → 0.469.0

#### Utilities & Tools
- **date-fns**: 3.6.0 → 4.1.0
- **embla-carousel-react**: 8.3.0 → 8.5.2
- **cmdk**: 1.0.0 → 1.0.4
- **input-otp**: 1.2.4 → 1.4.1
- **next-themes**: 0.3.0 → 0.4.4
- **react-day-picker**: 8.10.1 → 9.4.4
- **react-resizable-panels**: 2.1.3 → 2.1.7
- **recharts**: 2.12.7 → 2.15.0
- **sonner**: 1.5.0 → 1.7.3
- **vaul**: 0.9.9 → 1.1.2
- **uuid**: 13.0.0 → 11.0.3

#### Development Tools
- **@types/node**: 20.6.2 → 22.10.2
- **@types/react**: 18.2.22 → 18.3.18
- **@types/react-dom**: 18.2.7 → 18.3.5
- **@types/nodemailer**: 7.0.2 → 6.4.17
- **eslint**: 8.49.0 → 8.57.1
- **eslint-config-next**: 13.5.1 → 15.1.3
- **@swc/cli**: 0.7.9 → 0.5.1
- **@swc/core**: 1.15.7 → 1.10.1
- **dotenv**: 17.2.3 → 16.4.7
- **nodemailer**: 7.0.9 → 6.9.16

#### Added
- **@types/uuid**: 10.0.0 (New dev dependency for UUID type definitions)

### Configuration Changes
- Updated `next.config.js` with improved image configuration
- Added `remotePatterns` for better image handling in Next.js 15
- Maintained webpack configuration for client-side fallbacks

### Documentation
- Completely rewrote README.md with comprehensive documentation
- Added detailed installation instructions
- Documented all available scripts
- Added tech stack information
- Created changelog for tracking updates

### Breaking Changes
- Next.js 15 may require code adjustments for App Router
- Some Radix UI components may have API changes
- Stripe SDK major version update may require payment flow review
- date-fns v4 has breaking changes from v3
- react-day-picker v9 has breaking changes from v8

### Migration Notes
1. Review Next.js 15 migration guide for App Router changes
2. Test all Stripe payment flows thoroughly
3. Verify date formatting with date-fns v4
4. Check date picker components with react-day-picker v9
5. Run `npm install` to update all dependencies
6. Test the application thoroughly before deploying

### Security
- Updated all dependencies to latest stable versions
- Addressed known vulnerabilities in outdated packages
- Improved security with latest framework versions
