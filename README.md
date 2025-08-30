To build EventHive, a comprehensive event management platform where organizers can easily
create, publish, and manage events with flexible ticketing and promotions, while attendees can
seamlessly discover, register, pay, and receive tickets via Email/WhatsApp along with timely
reminders and smooth check-in experiences.

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

- **Razorpay** - Payment gateway integration
- **Email Verification** - Secure user onboarding

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
- Razorpay account for payments

### Installation

1. **Clone the repository**

   ```bash
   git clone <repo link>
   cd <repo>
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/quickcourt"

   # Better Auth
   BETTER_AUTH_SECRET="your-auth-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"

   # Razorpay
   NEXT_PUBLIC_RAZORPAY_KEY_ID="your-razorpay-key-id"
   RAZORPAY_KEY_SECRET="your-razorpay-secret"

   # Email (for verification)
   RESEND_API_KEY="your-resend-api-key"
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   pnpm prisma generate

   # Run database migrations
   pnpm prisma db push

   # Seed the database (optional)
   pnpm tsx scripts/seed-basic.ts
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
│   ├── booking-actions.ts
│   └── venue-actions.ts
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # Venue owner dashboard
│   ├── profile/      # User profile pages
│   └── venues/       # Venue pages
├── components/       # React components
│   ├── auth/         # Authentication components
│   ├── forms/        # Form components
│   ├── home/         # Homepage components
│   ├── ui/           # Reusable UI components
│   └── venue/        # Venue-specific components
├── lib/              # Utility libraries
│   ├── auth.ts       # Better Auth configuration
│   ├── prisma.ts     # Database client
│   └── utils.ts      # Helper functions
├── schemas/          # Validation schemas
├── styles/           # Global styles
└── types/            # TypeScript type definitions

prisma/
└── schema.prisma     # Database schema

public/
└── assets/           # Static images and assets
    └── sports/       # Sport category images
```

## 🔧 Key Components

### Venue Booking System

- **VenueDetails.tsx**: Main booking interface with slot selection
- **Time Slot Logic**: Handles consecutive booking and availability checking
- **Payment Integration**: Razorpay integration with order creation and verification

### Authentication System

- **Better Auth**: Secure authentication with email verification
- **Session Management**: Client-side session handling with automatic redirects
- **Protected Routes**: Route protection for authenticated users

### Database Schema

- **Users & Profiles**: User management with player and owner profiles
- **Facilities & Courts**: Venue management with multiple courts per facility
- **Time Slots & Bookings**: Flexible booking system with time slot management
- **Payments**: Payment tracking and order management

## 🎯 API Endpoints

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/session` - Get current session

### Venues

- `GET /api/venues` - Get all venues
- `GET /api/venues/[id]` - Get venue details
- `GET /api/venues/[id]/timeslots` - Get available time slots

### Bookings

- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/[id]/cancel` - Cancel booking
- `GET /api/profile/bookings` - Get user bookings

### Payments

- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

## 🏗️ Key Features Implementation

### Smart Time Slot Filtering

```typescript
// Filters past time slots for today's date
if (isToday && slot.startTime <= now) {
  continue;
}
```

### Consecutive Booking Logic

```typescript
// Ensures consecutive slots are from the same court
const canSelectConsecutiveSlots = (startIndex: number, hours: number) => {
  const startSlot = timeSlots[startIndex];
  const sameCourtSlots = timeSlots.filter(
    (slot) => slot.courtId === startSlot.courtId,
  );
  // Check availability for consecutive hours
};
```

### Grouped Slot Display

```typescript
// Groups duplicate time slots by unique time periods
const getGroupedTimeSlots = () => {
  const timeGroups = new Map<string, GroupedSlot>();
  // Groups slots by time and shows court availability
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
NEXT_PUBLIC_RAZORPAY_KEY_ID="production-razorpay-key"
RAZORPAY_KEY_SECRET="production-razorpay-secret"
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


## 🙏 Acknowledgments

- **Odoo Hackathon** - For the opportunity and inspiration
