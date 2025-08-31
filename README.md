# EventHive – Where Events Come Alive

A comprehensive event management platform where organizers can easily create, publish, and manage events with flexible ticketing and promotions, while attendees can seamlessly discover, register, pay, and receive tickets via Email/WhatsApp along with timely reminders and smooth check-in experiences.

## 🎉 Features

### For Event Organizers

- **Event Creation & Publishing**: Create events with rich details, media, and flexible ticketing options
- **Ticket Management**: Multiple ticket types (General, VIP, Student, Early Bird) with pricing controls
- **Promotional Tools**: Create discount codes, early bird offers, and referral rewards
- **Analytics Dashboard**: Real-time sales analytics, revenue tracking, and attendee insights
- **Check-in System**: QR/Barcode scanning for seamless event entry management
- **Role-based Access**: Admin, Event Manager, and Volunteer permissions

### For Attendees

- **Event Discovery**: Browse and search events by category, date, location, and price
- **Smart Booking**: Multiple ticket booking with per-user limits and secure payments
- **Ticket Delivery**: Auto-generated tickets with QR codes via Email/WhatsApp
- **Notifications**: Automated reminders (24h and 1h before events)
- **Loyalty Program**: Earn points and rewards for repeat participation
- **Social Sharing**: Share events on WhatsApp, Instagram, Twitter, Facebook

### Technical Features

- **Real-time Updates**: Live availability updates and booking confirmations
- **Responsive Design**: Mobile-first design that works on all devices
- **Smart Filtering**: Advanced search with multiple criteria and sorting options
- **Payment Integration**: Internal payment simulator (provider-agnostic), ready for future gateways
- **QR Code Generation**: Automatic ticket generation with unique QR codes
- **Email/WhatsApp Integration**: Multi-channel ticket delivery and notifications

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Lucide React** - Icon library

### Backend

- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Database ORM with type safety
- **PostgreSQL** - Relational database
- **Better Auth** - Authentication and session management

### Payments & Services

- **Payments** - Provider-agnostic internal flow (swap in your gateway later)
- **Email Verification** - Secure user onboarding
- **WhatsApp Business API** - Ticket delivery and notifications
- **QR Code Generation** - Unique ticket identification

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **pnpm** - Fast package manager

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database
- (Optional) Payment gateway account if you plan to integrate a real provider
- WhatsApp Business API (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/eventhive.git
   cd eventhive
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/eventhive"

  # Better Auth
  # Use a 64-char hex string, e.g. run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  BETTER_AUTH_SECRET="<64-char-hex-secret>"
  BETTER_AUTH_URL="http://localhost:4000"

  # Payments
  # Using internal payment simulator (no keys required)

   # Email (for verification and tickets)
   RESEND_API_KEY="your-resend-api-key"

   # WhatsApp Business API (optional)
   WHATSAPP_API_TOKEN="your-whatsapp-token"
   WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   pnpm prisma generate

   # Run database migrations
   pnpm prisma db push

   # Seed the database (optional)
   pnpm tsx scripts/seed-events.ts
   ```

5. **Start Development Server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── actions/           # Server actions for data fetching
│   ├── event-actions.ts
│   ├── booking-actions.ts
│   ├── ticket-actions.ts
│   └── payment-actions.ts
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # Organizer dashboard
│   ├── events/       # Event pages
│   └── profile/      # User profile pages
├── components/       # React components
│   ├── auth/         # Authentication components
│   ├── events/       # Event-related components
│   ├── forms/        # Form components
│   ├── home/         # Homepage components
│   ├── ui/           # Reusable UI components
│   └── dashboard/    # Dashboard components
├── lib/              # Utility libraries
│   ├── auth.ts       # Better Auth configuration
│   ├── prisma.ts     # Database client
│   ├── qr-generator.ts # QR code generation
│   └── utils.ts      # Helper functions
├── schemas/          # Validation schemas
├── styles/           # Global styles
└── types/            # TypeScript type definitions

prisma/
└── schema.prisma     # Database schema

public/
└── assets/           # Static images and assets
    └── events/       # Event category images
```

## 🔧 Key Components

### Event Management System

- **Event Creation**: Rich form with media uploads, pricing, and scheduling
- **Ticket Types**: Flexible ticket configuration with benefits and restrictions
- **Promotional System**: Discount codes, early bird offers, and referral rewards

### Booking & Payment System

- **Secure Booking**: Multi-step booking process with attendee information
- **Payment Integration**: Internal simulator with a simple confirmation flow
- **Ticket Generation**: Automatic PDF and QR code generation

### Notification System

- **Multi-channel Delivery**: Email, WhatsApp, SMS, and push notifications
- **Automated Reminders**: 24h and 1h before event notifications
- **Smart Scheduling**: Intelligent notification timing and delivery

### Check-in System

- **QR Code Scanning**: Fast and secure event entry
- **Real-time Validation**: Prevent duplicate check-ins
- **Staff Dashboard**: Volunteer and staff management interface

## 🎯 API Endpoints

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/session` - Get current session

### Events

- `GET /api/events` - Get all events with filters
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### Bookings

- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]/cancel` - Cancel booking
- `GET /api/profile/bookings` - Get user bookings

### Payments

- Payment flows are handled via internal server actions (create/confirm/cancel) using a simulator by default

### Notifications

- `POST /api/notifications/send` - Send notification
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]/read` - Mark as read

## 🏗️ Key Features Implementation

### Event Discovery & Search

```typescript
// Advanced filtering with multiple criteria
const filterEvents = (events: Event[], filters: EventFilters) => {
  return events.filter(event => {
    if (filters.category && event.category !== filters.category) return false;
    if (filters.date && event.startDate < filters.date) return false;
    if (filters.price && event.minPrice > filters.price) return false;
    if (filters.location && !event.city.includes(filters.location)) return false;
    return true;
  });
};
```

### Promotional System

```typescript
// Apply promotional codes with validation
const applyPromotion = (promotion: Promotion, booking: Booking) => {
  if (promotion.type === 'percentage') {
    return booking.totalAmount * (promotion.value / 100);
  } else if (promotion.type === 'fixed') {
    return Math.min(promotion.value, promotion.maxDiscount || Infinity);
  }
  return 0;
};
```

### QR Code Generation

```typescript
// Generate unique QR codes for tickets
const generateTicketQR = async (bookingId: string, eventId: string) => {
  const qrData = JSON.stringify({ bookingId, eventId, timestamp: Date.now() });
  return await QRCode.toDataURL(qrData);
};
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add Environment Variables**
4. **Deploy**

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
BETTER_AUTH_SECRET="secure-production-secret"
BETTER_AUTH_URL="https://your-domain.com"
RESEND_API_KEY="production-resend-key"
WHATSAPP_API_TOKEN="production-whatsapp-token"
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run type checking
pnpm type-check
```

## 📱 Mobile Features

- **Progressive Web App**: Installable on mobile devices
- **Push Notifications**: Real-time event updates and reminders
- **Offline Support**: Basic functionality without internet
- **Mobile-optimized UI**: Touch-friendly interface design

## 🔒 Security Features

- **JWT Authentication**: Secure user sessions
- **Role-based Access Control**: Granular permissions
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM safety
- **Rate Limiting**: API abuse prevention

## 🌟 Future Enhancements

- **Live Streaming**: Hybrid event support
- **Virtual Reality**: Immersive event experiences
- **AI Recommendations**: Smart event suggestions
- **Blockchain Tickets**: NFT-based ticketing
- **Multi-language Support**: Internationalization

## 👥 Team

- **Your Name** - Full Stack Developer - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- **EventHive Community** - For feedback and suggestions
- **Open Source Contributors** - For amazing libraries and tools

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Contact us at support@eventhive.com
- Join our Discord community

---

**EventHive** - Where Events Come Alive! 🎉
Seeded user admin@eventhive.com with password Admin@123
Seeded user organizer@eventhive.com with password Organizer@123
Seeded user attendee@eventhive.com with password Attendee@123