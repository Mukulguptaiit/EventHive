import { prisma } from "../src/lib/prisma";

// Helper function to generate random date within range
function getRandomDateBetween(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

async function main() {
  console.log("Creating comprehensive EventHive sample data...");

  // Create dates for spreading user registrations over the past 60 days
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Create organizer users
  const organizer1CreatedAt = getRandomDateBetween(
    sixtyDaysAgo,
    new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  );
  const organizer1 = await prisma.user.upsert({
    where: { email: "rajesh@musicfestival.com" },
    update: {},
    create: {
      name: "Rajesh Patel",
      email: "rajesh@musicfestival.com",
      emailVerified: true,
      createdAt: organizer1CreatedAt,
      updatedAt: organizer1CreatedAt,
    },
  });

  const organizer2CreatedAt = getRandomDateBetween(
    sixtyDaysAgo,
    new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
  );
  const organizer2 = await prisma.user.upsert({
    where: { email: "priya@techworkshops.com" },
    update: {},
    create: {
      name: "Priya Shah",
      email: "priya@techworkshops.com",
      emailVerified: true,
      createdAt: organizer2CreatedAt,
      updatedAt: organizer2CreatedAt,
    },
  });

  // Create additional event organizers
  const additionalOrganizers = [
    {
      name: "Amit Kumar",
      email: "amit@sportsevents.com",
      phone: "+919876543215",
    },
    {
      name: "Sneha Reddy",
      email: "sneha@businessconf.com",
      phone: "+919876543216",
    },
    {
      name: "Vikas Sharma",
      email: "vikas@hackathon.com",
      phone: "+919876543217",
    },
    {
      name: "Neha Gupta",
      email: "neha@culturalfest.com",
      phone: "+919876543218",
    },
    {
      name: "Rohit Mehta",
      email: "rohit@startupmeet.com",
      phone: "+919876543219",
    },
    {
      name: "Kavya Nair",
      email: "kavya@artexhibition.com",
      phone: "+919876543220",
    },
    {
      name: "Arjun Singh",
      email: "arjun@wellnessretreat.com",
      phone: "+919876543221",
    },
  ];

  const organizerUsers = [];
  for (const organizerData of additionalOrganizers) {
    const userCreatedAt = getRandomDateBetween(
      sixtyDaysAgo,
      new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    );
    const user = await prisma.user.upsert({
      where: { email: organizerData.email },
      update: {},
      create: {
        name: organizerData.name,
        email: organizerData.email,
        emailVerified: true,
        createdAt: userCreatedAt,
        updatedAt: userCreatedAt,
      },
    });
    organizerUsers.push({ user, phone: organizerData.phone });
  }

  console.log(`Created ${additionalOrganizers.length} additional event organizers`);

  // Create user profiles for organizers
  const organizerProfile1 = await prisma.userProfile.upsert({
    where: { userId: organizer1.id },
    update: {},
    create: {
      userId: organizer1.id,
      firstName: "John",
      lastName: "Organizer",
      phone: "+919876543210",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      timezone: "Asia/Kolkata",
      interests: ["Music", "Events", "Entertainment"],
  favoriteCategories: ["CONCERT", "FESTIVAL"],
      skillLevel: "ADVANCED",
      loyaltyPoints: 1000,
      loyaltyTier: "GOLD",
      referralCode: "ORG001",
    },
  });

  const organizerProfile2 = await prisma.userProfile.upsert({
    where: { userId: organizer2.id },
    update: {},
    create: {
      userId: organizer2.id,
      firstName: "Jane",
      lastName: "EventManager",
      phone: "+919876543211",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      timezone: "Asia/Kolkata",
  interests: ["Technology", "Education", "Wellness"],
  favoriteCategories: ["WORKSHOP", "CONFERENCE"],
      skillLevel: "PROFESSIONAL",
      loyaltyPoints: 1500,
      loyaltyTier: "PLATINUM",
      referralCode: "ORG002",
    },
  });

  const additionalOrganizerProfiles = [];
  for (const { user, phone } of organizerUsers) {
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: user.name.split(" ")[0],
        lastName: user.name.split(" ").slice(1).join(" "),
        phone: phone,
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        timezone: "Asia/Kolkata",
        interests: ["Events", "Management"],
  favoriteCategories: ["BUSINESS"],
        skillLevel: "INTERMEDIATE",
        loyaltyPoints: 500,
        loyaltyTier: "SILVER",
        referralCode: `ORG${Math.floor(Math.random() * 1000)}`,
      },
    });
    additionalOrganizerProfiles.push(profile);
  }

  // Create regular users
  const regularUsers = [
    { name: "John Doe", email: "john@example.com", phone: "+919876543213" },
    { name: "Jane Smith", email: "jane@example.com", phone: "+919876543214" },
    { name: "Rahul Kumar", email: "rahul@example.com", phone: "+919876543222" },
    {
      name: "Priyanka Sharma",
      email: "priyanka@example.com",
      phone: "+919876543223",
    },
    { name: "Akash Patel", email: "akash@example.com", phone: "+919876543224" },
    {
      name: "Shruti Reddy",
      email: "shruti@example.com",
      phone: "+919876543225",
    },
    {
      name: "Vikram Singh",
      email: "vikram@example.com",
      phone: "+919876543226",
    },
    { name: "Anita Mehta", email: "anita@example.com", phone: "+919876543227" },
    {
      name: "Deepak Gupta",
      email: "deepak@example.com",
      phone: "+919876543228",
    },
    { name: "Pooja Nair", email: "pooja@example.com", phone: "+919876543229" },
    {
      name: "Sanjay Joshi",
      email: "sanjay@example.com",
      phone: "+919876543230",
    },
    { name: "Riya Shah", email: "riya@example.com", phone: "+919876543231" },
    {
      name: "Arpit Agarwal",
      email: "arpit@example.com",
      phone: "+919876543232",
    },
    {
      name: "Swati Kulkarni",
      email: "swati@example.com",
      phone: "+919876543233",
    },
    { name: "Nitin Varma", email: "nitin@example.com", phone: "+919876543234" },
  ];

  const userProfiles = [];
  for (const userData of regularUsers) {
    const userCreatedAt = getRandomDateBetween(
      sixtyDaysAgo,
      new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    );
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        emailVerified: true,
        createdAt: userCreatedAt,
        updatedAt: userCreatedAt,
      },
    });

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: userData.name.split(" ")[0],
        lastName: userData.name.split(" ").slice(1).join(" "),
        phone: userData.phone,
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        timezone: "Asia/Kolkata",
  interests: ["Sports", "Music"],
  favoriteCategories: ["SPORTS", "CONCERT"],
        skillLevel: "BEGINNER",
        loyaltyPoints: 100,
        loyaltyTier: "BRONZE",
        referralCode: `USER${Math.floor(Math.random() * 1000)}`,
      },
    });
    userProfiles.push({ profile, user });
  }

  console.log(`Created ${regularUsers.length} regular users`);

  // Create comprehensive events
  const eventsData = [
    // Music Events
    {
      title: "Summer Music Festival 2024",
      description: "Join us for the biggest music festival of the year featuring top artists and DJs from around the world. Experience electrifying performances, amazing food, and unforgettable memories.",
      shortDescription: "The biggest music festival of the year",
      category: "CONCERT",
      status: "PUBLISHED",
      featured: true,
      trending: true,
      startDate: new Date("2024-09-15"),
      endDate: new Date("2024-09-15"),
      startTime: "18:00",
      endTime: "23:00",
      timezone: "Asia/Kolkata",
      location: "Mumbai",
      address: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      latitude: 19.0760,
      longitude: 72.8777,
      venueName: "BKC Grounds",
      venueType: "Outdoor",
      coverImage: "/assets/concert-event.jpg",
      images: ["/assets/concert-event.jpg", "/assets/hero-events.jpg"],
      videoUrl: null,
      isFree: false,
      minPrice: 1500,
      maxPrice: 5000,
      maxAttendees: 5000,
      currentAttendees: 1200,
      organizerId: organizerProfile1.id,
      tags: ["music", "festival", "summer", "live"],
      socialLinks: {
        facebook: "https://facebook.com/summermusicfest",
        twitter: "https://twitter.com/summermusicfest",
        instagram: "https://instagram.com/summermusicfest"
      },
      seoDescription: "Experience the biggest music festival of the year in Mumbai",
      seoKeywords: ["music festival", "summer", "Mumbai", "live music", "concerts"],
      allowWaitlist: true,
      allowCancellation: true,
      cancellationPolicy: "Full refund up to 7 days before event",
      refundPolicy: "100% refund for cancellations made 7+ days in advance",
      publishedAt: getRandomDateBetween(
        new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      ),
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      title: "Tech Workshop: AI & Machine Learning",
      description: "Learn the fundamentals of AI and ML from industry experts. Hands-on sessions, real-world projects, and networking opportunities with tech professionals.",
      shortDescription: "Master AI & ML fundamentals",
      category: "WORKSHOP",
      status: "PUBLISHED",
      featured: false,
      trending: true,
      startDate: new Date("2024-09-20"),
      endDate: new Date("2024-09-22"),
      startTime: "10:00",
      endTime: "18:00",
      timezone: "Asia/Kolkata",
      location: "Bangalore",
      address: "Koramangala, Bangalore, Karnataka 560034",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      latitude: 12.9352,
      longitude: 77.6245,
      venueName: "Tech Hub Bangalore",
      venueType: "Indoor",
      coverImage: "/assets/workshop-event.jpg",
      images: ["/assets/workshop-event.jpg"],
      videoUrl: null,
      isFree: false,
      minPrice: 500,
      maxPrice: 2000,
      maxAttendees: 100,
      currentAttendees: 85,
      organizerId: organizerProfile2.id,
      tags: ["technology", "AI", "machine learning", "workshop", "education"],
      socialLinks: {
        linkedin: "https://linkedin.com/company/techworkshops"
      },
      seoDescription: "Comprehensive AI & ML workshop in Bangalore",
      seoKeywords: ["AI workshop", "machine learning", "Bangalore", "tech education"],
      allowWaitlist: true,
      allowCancellation: true,
      cancellationPolicy: "Full refund up to 3 days before event",
      refundPolicy: "100% refund for cancellations made 3+ days in advance",
      publishedAt: getRandomDateBetween(
        new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      ),
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      title: "Basketball Championship 2024",
      description: "Inter-college basketball tournament with exciting prizes. Show your skills, compete with the best, and win amazing rewards.",
      shortDescription: "Inter-college basketball tournament",
      category: "SPORTS",
      status: "PUBLISHED",
      featured: true,
      trending: false,
      startDate: new Date("2024-09-25"),
      endDate: new Date("2024-09-27"),
      startTime: "16:00",
      endTime: "21:00",
      timezone: "Asia/Kolkata",
      location: "Delhi",
      address: "Jawaharlal Nehru Stadium, Delhi 110003",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      latitude: 28.6139,
      longitude: 77.2090,
      venueName: "JLN Stadium",
      venueType: "Indoor",
      coverImage: "/assets/sports-event.jpg",
      images: ["/assets/sports-event.jpg"],
      videoUrl: null,
      isFree: true,
      minPrice: 0,
      maxPrice: 0,
      maxAttendees: 1000,
      currentAttendees: 300,
      organizerId: additionalOrganizerProfiles[0].id,
      tags: ["sports", "basketball", "tournament", "college", "championship"],
      socialLinks: {},
      seoDescription: "Inter-college basketball championship in Delhi",
      seoKeywords: ["basketball", "tournament", "Delhi", "sports", "championship"],
      allowWaitlist: true,
      allowCancellation: false,
      cancellationPolicy: "No cancellations allowed",
      refundPolicy: "No refunds for free events",
      publishedAt: getRandomDateBetween(
        new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      ),
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      ),
    },
    // Additional events
    {
      title: "Startup Pitch Competition",
      description: "Pitch your innovative startup idea to investors and industry experts. Get feedback, network, and potentially secure funding.",
      shortDescription: "Pitch your startup to investors",
      category: "BUSINESS",
      status: "PUBLISHED",
      featured: false,
      trending: true,
      startDate: new Date("2024-10-05"),
      endDate: new Date("2024-10-05"),
      startTime: "14:00",
      endTime: "20:00",
      timezone: "Asia/Kolkata",
      location: "Mumbai",
      address: "Wework, BKC, Mumbai, Maharashtra 400051",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      latitude: 19.0760,
      longitude: 72.8777,
      venueName: "Wework BKC",
      venueType: "Indoor",
      coverImage: "/assets/workshop-event.jpg",
      images: ["/assets/workshop-event.jpg"],
      videoUrl: null,
      isFree: false,
      minPrice: 1000,
      maxPrice: 1000,
      maxAttendees: 200,
      currentAttendees: 150,
      organizerId: additionalOrganizerProfiles[4].id,
      tags: ["startup", "pitch", "investors", "business", "networking"],
      socialLinks: {},
      seoDescription: "Startup pitch competition in Mumbai",
      seoKeywords: ["startup", "pitch", "Mumbai", "investors", "business"],
      allowWaitlist: true,
      allowCancellation: true,
      cancellationPolicy: "Full refund up to 5 days before event",
      refundPolicy: "100% refund for cancellations made 5+ days in advance",
      publishedAt: getRandomDateBetween(
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      ),
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      title: "Hackathon: Build the Future",
      description: "24-hour coding challenge to build innovative solutions. Work with talented developers, learn new technologies, and win exciting prizes.",
      shortDescription: "24-hour coding challenge",
      category: "HACKATHON",
      status: "PUBLISHED",
      featured: true,
      trending: true,
      startDate: new Date("2024-10-15"),
      endDate: new Date("2024-10-16"),
      startTime: "09:00",
      endTime: "09:00",
      timezone: "Asia/Kolkata",
      location: "Bangalore",
      address: "IIIT Bangalore, Electronics City, Bangalore 560100",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      latitude: 12.9716,
      longitude: 77.5946,
      venueName: "IIIT Bangalore",
      venueType: "Indoor",
      coverImage: "/assets/workshop-event.jpg",
      images: ["/assets/workshop-event.jpg"],
      videoUrl: null,
      isFree: false,
      minPrice: 500,
      maxPrice: 500,
      maxAttendees: 300,
      currentAttendees: 250,
      organizerId: additionalOrganizerProfiles[2].id,
      tags: ["hackathon", "coding", "technology", "innovation", "24-hour"],
      socialLinks: {},
      seoDescription: "24-hour hackathon in Bangalore",
      seoKeywords: ["hackathon", "coding", "Bangalore", "technology", "innovation"],
      allowWaitlist: true,
      allowCancellation: true,
      cancellationPolicy: "Full refund up to 7 days before event",
      refundPolicy: "100% refund for cancellations made 7+ days in advance",
      publishedAt: getRandomDateBetween(
        new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      ),
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      title: "Cultural Festival: Unity in Diversity",
      description: "Celebrate India's rich cultural heritage through music, dance, art, and food. Experience the diversity that makes our country unique.",
      shortDescription: "Celebrate cultural diversity",
      category: "FESTIVAL",
      status: "PUBLISHED",
      featured: false,
      trending: false,
      startDate: new Date("2024-10-20"),
      endDate: new Date("2024-10-22"),
      startTime: "10:00",
      endTime: "22:00",
      timezone: "Asia/Kolkata",
      location: "Delhi",
      address: "India Gate, New Delhi, Delhi 110001",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      latitude: 28.6129,
      longitude: 77.2295,
      venueName: "India Gate Lawns",
      venueType: "Outdoor",
      coverImage: "/assets/hero-events.jpg",
      images: ["/assets/hero-events.jpg"],
      videoUrl: null,
      isFree: true,
      minPrice: 0,
      maxPrice: 0,
      maxAttendees: 5000,
      currentAttendees: 1200,
      organizerId: additionalOrganizerProfiles[3].id,
      tags: ["cultural", "festival", "diversity", "music", "dance", "art"],
      socialLinks: {},
      seoDescription: "Cultural festival celebrating diversity in Delhi",
      seoKeywords: ["cultural festival", "diversity", "Delhi", "music", "dance"],
      allowWaitlist: true,
      allowCancellation: false,
      cancellationPolicy: "No cancellations allowed",
      refundPolicy: "No refunds for free events",
      publishedAt: getRandomDateBetween(
        new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      ),
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      title: "Wellness Retreat: Mind & Body",
      description: "Escape the city and rejuvenate your mind and body. Yoga, meditation, spa treatments, and healthy food in a peaceful environment.",
      shortDescription: "Rejuvenate mind and body",
      category: "WORKSHOP",
      status: "PUBLISHED",
      featured: false,
      trending: true,
      startDate: new Date("2024-11-01"),
      endDate: new Date("2024-11-03"),
      startTime: "08:00",
      endTime: "20:00",
      timezone: "Asia/Kolkata",
      location: "Rishikesh",
      address: "Ananda Spa Resort, Rishikesh, Uttarakhand 249192",
      city: "Rishikesh",
      state: "Uttarakhand",
      country: "India",
      latitude: 30.0869,
      longitude: 78.2676,
      venueName: "Ananda Spa Resort",
      venueType: "Mixed",
      coverImage: "/assets/workshop-event.jpg",
      images: ["/assets/workshop-event.jpg"],
      videoUrl: null,
      isFree: false,
      minPrice: 15000,
      maxPrice: 25000,
      maxAttendees: 50,
      currentAttendees: 35,
      organizerId: additionalOrganizerProfiles[6].id,
      tags: ["wellness", "retreat", "yoga", "meditation", "spa", "peaceful"],
      socialLinks: {},
      seoDescription: "Wellness retreat in Rishikesh",
      seoKeywords: ["wellness retreat", "yoga", "meditation", "Rishikesh", "spa"],
      allowWaitlist: true,
      allowCancellation: true,
      cancellationPolicy: "Full refund up to 14 days before event",
      refundPolicy: "100% refund for cancellations made 14+ days in advance",
      publishedAt: getRandomDateBetween(
        new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      ),
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      ),
    },
  ];

  await prisma.event.createMany({
    data: eventsData as any,
    skipDuplicates: true,
  });

  console.log(`Created ${eventsData.length} events`);

  // Get all created events for ticket creation
  const events = await prisma.event.findMany({
    where: {
      title: {
        in: [
          "Summer Music Festival 2024",
          "Tech Workshop: AI & Machine Learning",
          "Basketball Championship 2024",
          "Startup Pitch Competition",
          "Hackathon: Build the Future",
          "Cultural Festival: Unity in Diversity",
          "Wellness Retreat: Mind & Body",
        ],
      },
    },
  });

  // Create tickets for each event
  let totalTickets = 0;
  for (const event of events) {
    if (event.isFree) {
      // Free event - create one free ticket type
      await prisma.ticket.create({
        data: {
          eventId: event.id,
          name: "Free Entry",
          type: "GENERAL" as any,
          description: "Free entry to the event",
          price: 0,
          currency: "INR",
          quantity: event.maxAttendees,
          soldQuantity: event.currentAttendees,
          availableQuantity: event.maxAttendees - event.currentAttendees,
          saleStartDate: event.createdAt,
          saleEndDate: event.startDate,
          maxPerUser: 1,
          minPerUser: 1,
          benefits: ["Event access"],
          isActive: true,
        },
      });
      totalTickets++;
    } else {
      // Paid event - create multiple ticket types
      const ticketTypes = [
        {
          name: "Early Bird",
          type: "EARLY_BIRD" as any,
          description: "Limited early bird tickets at discounted price",
          price: event.minPrice! * 0.8,
          originalPrice: event.minPrice,
          quantity: Math.floor(event.maxAttendees * 0.3),
          benefits: ["Early access", "Priority seating"],
        },
        {
          name: "General Admission",
          type: "GENERAL" as any,
          description: "Standard event access",
          price: event.minPrice!,
          originalPrice: null,
          quantity: Math.floor(event.maxAttendees * 0.5),
          benefits: ["Event access", "Standard seating"],
        },
        {
          name: "VIP",
          type: "VIP" as any,
          description: "Premium experience with exclusive benefits",
          price: event.maxPrice!,
          originalPrice: null,
          quantity: Math.floor(event.maxAttendees * 0.2),
          benefits: ["VIP seating", "Meet & Greet", "Swag bag", "Priority access"],
        },
      ];

      for (const ticketData of ticketTypes) {
        const soldQuantity = Math.floor(ticketData.quantity * 0.7); // 70% sold
        await prisma.ticket.create({
          data: {
            eventId: event.id,
            name: ticketData.name,
            type: ticketData.type,
            description: ticketData.description,
            price: ticketData.price,
            originalPrice: ticketData.originalPrice,
            currency: "INR",
            quantity: ticketData.quantity,
            soldQuantity: soldQuantity,
            availableQuantity: ticketData.quantity - soldQuantity,
            saleStartDate: event.createdAt,
            saleEndDate: event.startDate,
            maxPerUser: 4,
            minPerUser: 1,
            benefits: ticketData.benefits,
            isActive: true,
          },
        });
        totalTickets++;
      }
    }
  }

  console.log(`Created ${totalTickets} ticket types`);

  // Create sample bookings
  console.log("Creating sample bookings...");
  let totalBookings = 0;
  const paidEvents = events.filter(event => !event.isFree);

  for (const event of paidEvents) {
    const tickets = await prisma.ticket.findMany({
      where: { eventId: event.id },
    });

    // Create bookings for 70% of sold tickets
    for (const ticket of tickets) {
      const bookingCount = Math.floor(ticket.soldQuantity * 0.7);
      
      for (let i = 0; i < bookingCount; i++) {
        const randomUserProfile = userProfiles[Math.floor(Math.random() * userProfiles.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 tickets
        
        await prisma.booking.create({
          data: {
            eventId: event.id,
            ticketId: ticket.id,
            userId: randomUserProfile.profile.id,
            organizerId: event.organizerId,
            quantity: quantity,
            totalAmount: ticket.price * quantity,
            currency: "INR",
            status: "CONFIRMED",
            attendeeName: `${randomUserProfile.profile.firstName} ${randomUserProfile.profile.lastName}`,
            attendeeEmail: randomUserProfile.user.email,
            attendeePhone: randomUserProfile.profile.phone,
            paymentStatus: "SUCCESSFUL",
            qrCode: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            barcode: `BC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          },
        });
        totalBookings++;
      }
    }
  }

  console.log(`Created ${totalBookings} bookings`);

  // Create event reviews
  console.log("Creating event reviews...");
  let totalReviews = 0;
  const publishedEvents = events.filter(event => event.status === "PUBLISHED");

  for (const event of publishedEvents) {
    // Each event gets 3-8 reviews
    const reviewCount = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < reviewCount; i++) {
      const randomUserProfile = userProfiles[Math.floor(Math.random() * userProfiles.length)];

      // Rating distribution: mostly 4-5 stars (80%), some 3 star (15%), few 1-2 star (5%)
      let rating: number;
      const ratingRandom = Math.random();
      if (ratingRandom < 0.5) rating = 5;
      else if (ratingRandom < 0.8) rating = 4;
      else if (ratingRandom < 0.95) rating = 3;
      else rating = Math.floor(Math.random() * 2) + 1; // 1 or 2

      const comments = [
        "Amazing event! Had a great time.",
        "Well organized and professional.",
        "Good value for money, will attend again.",
        "Nice venue and great atmosphere.",
        "Could improve the food options.",
        "Staff was helpful and friendly.",
        "Amazing experience, highly recommended!",
        "Professional setup with quality content.",
        "Great networking opportunities.",
        "Well worth the investment.",
      ];

      try {
        await prisma.eventReview.create({
          data: {
            eventId: event.id,
            userId: randomUserProfile.profile.id,
            rating: rating,
            comment: Math.random() < 0.8 ? comments[Math.floor(Math.random() * comments.length)] : null,
            verified: Math.random() < 0.7, // 70% verified reviews
          },
        });
        totalReviews++;
      } catch {
        // Skip if duplicate review (one review per user per event)
        continue;
      }
    }
  }

  console.log(`Created ${totalReviews} event reviews`);

  // Create promotional codes
  console.log("Creating promotional codes...");
  const promotions = [
    {
      code: "EARLYBIRD20",
      name: "Early Bird 20% Off",
      description: "Get 20% off on early bird tickets",
      type: "percentage",
      value: 20,
      maxDiscount: 1000,
      maxUses: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      minOrderValue: 500,
      applicableTicketTypes: ["EARLY_BIRD", "GENERAL"],
    },
    {
      code: "STUDENT50",
      name: "Student Discount 50%",
      description: "50% off for students with valid ID",
      type: "percentage",
      value: 50,
      maxDiscount: 2000,
      maxUses: 200,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      minOrderValue: 200,
      applicableTicketTypes: ["GENERAL", "STUDENT"],
    },
    {
      code: "WELCOME100",
      name: "Welcome Bonus ₹100 Off",
      description: "₹100 off for new users",
      type: "fixed",
      value: 100,
      maxDiscount: 100,
      maxUses: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      minOrderValue: 500,
      applicableTicketTypes: ["GENERAL", "VIP"],
    },
  ];

  for (const promoData of promotions) {
    await prisma.promotion.create({
      data: promoData,
    });
  }

  console.log(`Created ${promotions.length} promotional codes`);

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("🎉 EVENTHIVE SAMPLE DATA CREATED SUCCESSFULLY!");
  console.log("=".repeat(50));
  console.log(`📊 Summary:`);
  console.log(
    `   • Users: ${additionalOrganizers.length + 2} event organizers + ${regularUsers.length} regular users`,
  );
  console.log(
    `   • Events: ${eventsData.length} (all published)`,
  );
  console.log(`   • Ticket Types: ${totalTickets}`);
  console.log(`   • Bookings: ${totalBookings}`);
  console.log(`   • Reviews: ${totalReviews}`);
  console.log(`   • Promotions: ${promotions.length}`);
  console.log(
    "\n🚀 Your EventHive platform is now ready for comprehensive testing!",
  );
  console.log("=".repeat(50));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
