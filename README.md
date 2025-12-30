# Alkhemmy.com

A modern e-commerce platform built with Next.js 15, React 18, Stripe, and Supabase.

## 🚀 Features

- **Modern Stack**: Built with Next.js 15, React 18.3, TypeScript 5.7
- **Payment Processing**: Integrated Stripe checkout and payment handling
- **Database**: Supabase for authentication and data management
- **UI Components**: Beautiful UI with Radix UI and Tailwind CSS
- **Admin Panel**: Complete admin dashboard for managing products and orders
- **Responsive Design**: Mobile-first responsive design
- **Type Safety**: Full TypeScript support

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- Stripe account

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/KhamareClarke/alkhemmy.com.git
cd alkhemmy.com
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Set up the database:
```bash
npm run setup-db
npm run setup-category-tables
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📚 Documentation

For detailed setup instructions, refer to:
- [Supabase Setup](./SUPABASE_SETUP.md)
- [Stripe Configuration](./STRIPE_CONFIGURATION.md)
- [Admin Setup](./ADMIN_SETUP.md)
- [Checkout Setup](./CHECKOUT_SETUP.md)
- [Password Reset Setup](./PASSWORD_RESET_SETUP.md)

## 🏗️ Project Structure

```
alkhemmy.com/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions and configurations
├── hooks/           # Custom React hooks
├── scripts/         # Database and migration scripts
└── public/          # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup-db` - Initialize database
- `npm run migrate-data` - Migrate data
- `npm run setup-category-tables` - Set up category tables

## 🎨 Tech Stack

- **Framework**: Next.js 15.1.3
- **UI Library**: React 18.3.1
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI
- **Payment**: Stripe
- **Database**: Supabase
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion

## 📦 Recent Updates (December 2024)

- ✅ Updated to Next.js 15.1.3
- ✅ Updated React to 18.3.1
- ✅ Updated all Radix UI components to latest versions
- ✅ Updated Stripe SDK to latest version
- ✅ Updated Supabase client to 2.47.10
- ✅ Updated TypeScript to 5.7.2
- ✅ Updated all dependencies for security and performance
- ✅ Improved Next.js configuration for better image handling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👤 Author

**Khamare Clarke**
- GitHub: [@KhamareClarke](https://github.com/KhamareClarke)

## 🐛 Issues

If you encounter any issues, please report them on the [GitHub Issues](https://github.com/KhamareClarke/alkhemmy.com/issues) page.
