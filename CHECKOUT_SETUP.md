# Checkout System Setup Guide

This guide will help you set up the complete checkout system with Stripe payment processing and order management.

## Features Implemented

✅ **Complete Checkout Flow**
- Shipping and billing address forms with validation
- Address management for logged-in users
- Payment method selection (Card/Cash on Delivery)
- Order processing and database integration
- Order confirmation page
- Error handling and user feedback

✅ **Payment Processing**
- Stripe integration for card payments
- Test mode configuration
- Payment intent creation and confirmation
- Cash on delivery option

✅ **User Experience**
- Saved addresses for logged-in users
- Form validation with real-time feedback
- Responsive design
- Loading states and error handling
- Order summary with live updates

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stripe Setup

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete the account setup process

2. **Get API Keys**
   - Go to the Stripe Dashboard
   - Navigate to Developers > API Keys
   - Copy your Publishable key and Secret key
   - Add them to your `.env.local` file

3. **Test Mode**
   - The system is configured for test mode by default
   - Use test card numbers for testing:
     - Success: `4242 4242 4242 4242`
     - Decline: `4000 0000 0000 0002`
     - Requires authentication: `4000 0025 0000 3155`

## Database Setup

The checkout system uses the following database tables (already created in `lib/create-user-tables.sql`):

- `profiles` - User profile information
- `addresses` - Shipping and billing addresses
- `orders` - Order information
- `order_items` - Individual items in each order

## File Structure

```
components/checkout/
├── CheckoutForm.tsx          # Main checkout form with validation
├── OrderSummary.tsx          # Order summary sidebar
└── StripePayment.tsx         # Stripe payment component

lib/
├── order-api.ts              # Order processing functions
└── create-user-tables.sql    # Database schema

app/
├── api/
│   ├── create-payment-intent/route.ts  # Stripe payment intent API
│   └── process-order/route.ts          # Order processing API
├── checkout/page.tsx         # Main checkout page
└── thank-you/page.tsx        # Order confirmation page
```

## Usage

### For Logged-in Users
1. User can select from saved addresses
2. Form pre-fills with saved information
3. Option to save new addresses
4. Seamless checkout experience

### For Guest Users
1. Complete address forms manually
2. All required fields validated
3. Same payment options available

### Payment Methods
1. **Credit/Debit Card**: Stripe integration with secure processing
2. **Cash on Delivery**: Order processed without payment

## Testing the Checkout Flow

1. **Add items to cart** from any product page
2. **Navigate to checkout** via cart or direct link
3. **Fill out forms** with test data
4. **Select payment method**:
   - For card: Use Stripe test cards
   - For cash on delivery: Skip payment step
5. **Complete order** and get redirected to confirmation page

## Error Handling

The system includes comprehensive error handling for:
- Form validation errors
- Payment processing failures
- Network connectivity issues
- Database errors
- Invalid order data

## Customization

### Styling
- All components use Tailwind CSS
- Color scheme matches the site's gold theme (`#D4AF37`)
- Responsive design for all screen sizes

### Validation
- Uses Zod for schema validation
- Real-time form validation
- Custom error messages

### Payment
- Stripe Elements for secure card input
- Custom styling to match site theme
- Support for multiple payment methods

## Production Considerations

1. **Switch to Live Mode**
   - Update Stripe keys to live mode
   - Test thoroughly with real cards
   - Set up webhooks for payment confirmations

2. **Email Notifications**
   - Implement email service (SendGrid, Resend, etc.)
   - Create email templates
   - Set up order confirmation emails

3. **Security**
   - Validate all inputs server-side
   - Use HTTPS in production
   - Implement rate limiting
   - Set up proper error logging

4. **Monitoring**
   - Set up Stripe webhooks
   - Monitor payment success rates
   - Track order processing metrics

## Support

For issues or questions about the checkout system:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Test with Stripe test cards first
4. Check database connections and permissions




