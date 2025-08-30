import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Starting EventHive database seeding...");

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1494790108755-2616b0c8c9e4?w=150",
      bio: "Event organizer and community builder",
      address: "123 Main St, San Francisco, CA",
      dateOfBirth: new Date("1990-05-15"),
      gender: "female",
      website: "https://aliceevents.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      bio: "Tech enthusiast and workshop organizer",
      address: "456 Oak Ave, Seattle, WA",
      dateOfBirth: new Date("1985-08-22"),
      gender: "male",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: "Carol Williams",
      email: "carol@example.com",
      emailVerified: true,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      bio: "Music lover and concert organizer",
      address: "789 Pine St, Los Angeles, CA",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create attendee profiles
  const attendee1 = await prisma.attendeeProfile.create({
    data: {
      userId: user1.id,
      role: "EVENT_ORGANIZER",
      phoneNumber: "+1-555-0101",
      avatar: user1.image,
      loyaltyPoints: 250,
    },
  });

  const attendee2 = await prisma.attendeeProfile.create({
    data: {
      userId: user2.id,
      role: "EVENT_ORGANIZER",
      phoneNumber: "+1-555-0102",
      avatar: user2.image,
      loyaltyPoints: 150,
    },
  });

  const attendee3 = await prisma.attendeeProfile.create({
    data: {
      userId: user3.id,
      role: "ATTENDEE",
      phoneNumber: "+1-555-0103",
      avatar: user3.image,
      loyaltyPoints: 50,
    },
  });

  // Create sample events
  const event1 = await prisma.event.create({
    data: {
      title: "React & Next.js Workshop",
      description: "Learn the fundamentals of React and Next.js in this hands-on workshop. Perfect for beginners and intermediate developers looking to enhance their skills.",
      shortDescription: "Hands-on React & Next.js workshop for developers",
      startDate: new Date("2025-09-15"),
      endDate: new Date("2025-09-15"),
      startTime: "09:00",
      endTime: "17:00",
      location: "TechHub San Francisco, 123 Tech Street, San Francisco, CA",
      latitude: 37.7749,
      longitude: -122.4194,
      venueType: "INDOOR",
      eventType: "WORKSHOP",
      category: "Technology",
      tags: ["React", "Next.js", "JavaScript", "Web Development"],
      images: [
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"
      ],
      maxAttendees: 50,
      minAttendees: 10,
      contactEmail: "alice@example.com",
      contactPhone: "+1-555-0101",
      website: "https://reactworkshop.aliceevents.com",
      terms: "Please bring your laptop. Materials provided.",
      status: "PUBLISHED",
      organizerId: attendee1.id,
      publishedAt: new Date(),
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Summer Music Festival 2025",
      description: "Join us for an amazing day of live music featuring local and international artists. Food trucks, art installations, and great vibes guaranteed!",
      shortDescription: "One-day music festival with amazing artists",
      startDate: new Date("2025-07-20"),
      endDate: new Date("2025-07-20"),
      startTime: "12:00",
      endTime: "23:00",
      location: "Golden Gate Park, San Francisco, CA",
      latitude: 37.7694,
      longitude: -122.4862,
      venueType: "OUTDOOR",
      eventType: "CONCERT",
      category: "Music",
      tags: ["Music", "Festival", "Live Performance", "Outdoor"],
      images: [
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800"
      ],
      maxAttendees: 5000,
      contactEmail: "carol@example.com",
      contactPhone: "+1-555-0103",
      terms: "No outside food or drinks. Security check required.",
      status: "PUBLISHED",
      organizerId: attendee3.id,
      featuredUntil: new Date("2025-07-25"),
      publishedAt: new Date(),
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: "AI/ML Hackathon 2025",
      description: "48-hour hackathon focused on artificial intelligence and machine learning solutions. Teams will compete to build innovative AI applications.",
      shortDescription: "48-hour AI/ML hackathon with prizes",
      startDate: new Date("2025-10-05"),
      endDate: new Date("2025-10-07"),
      startTime: "18:00",
      endTime: "18:00",
      location: "Innovation Center, 789 Startup Blvd, Seattle, WA",
      latitude: 47.6062,
      longitude: -122.3321,
      venueType: "INDOOR",
      eventType: "HACKATHON",
      category: "Technology",
      tags: ["AI", "Machine Learning", "Hackathon", "Programming"],
      images: [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800"
      ],
      maxAttendees: 200,
      minAttendees: 20,
      contactEmail: "bob@example.com",
      contactPhone: "+1-555-0102",
      website: "https://aimlhackathon.com",
      terms: "Participants must form teams of 3-5 members. Bring your own laptop.",
      status: "PUBLISHED",
      organizerId: attendee2.id,
      publishedAt: new Date(),
    },
  });

  // Create tickets for events
  await prisma.ticket.create({
    data: {
      name: "Early Bird",
      eventId: event1.id,
      ticketType: "EARLY_BIRD",
      description: "Special early bird pricing - limited time offer!",
      price: 99.00,
      quantity: 20,
      maxPerUser: 2,
      saleStartDate: new Date("2025-01-01"),
      saleEndDate: new Date("2025-08-15"),
      perks: ["Workshop materials", "Lunch included", "Certificate"],
    },
  });

  await prisma.ticket.create({
    data: {
      name: "General Admission",
      eventId: event1.id,
      ticketType: "GENERAL",
      description: "Standard workshop admission",
      price: 129.00,
      quantity: 30,
      maxPerUser: 3,
      saleStartDate: new Date("2025-08-16"),
      saleEndDate: new Date("2025-09-14"),
      perks: ["Workshop materials", "Lunch included", "Certificate"],
    },
  });

  await prisma.ticket.create({
    data: {
      name: "General Admission",
      eventId: event2.id,
      ticketType: "GENERAL",
      price: 75.00,
      quantity: 3000,
      maxPerUser: 6,
      perks: ["Festival access", "Welcome drink"],
    },
  });

  await prisma.ticket.create({
    data: {
      name: "VIP Experience",
      eventId: event2.id,
      ticketType: "VIP",
      description: "Premium festival experience with exclusive perks",
      price: 250.00,
      quantity: 500,
      maxPerUser: 4,
      perks: ["VIP area access", "Meet & greet", "Premium food & drinks", "Merchandise"],
    },
  });

  await prisma.ticket.create({
    data: {
      name: "Participant",
      eventId: event3.id,
      ticketType: "GENERAL",
      description: "Hackathon participant registration",
      price: 25.00,
      quantity: 200,
      maxPerUser: 1,
      perks: ["Meals included", "Swag bag", "Mentorship access"],
    },
  });

  // Create some promotions
  await prisma.promotion.create({
    data: {
      eventId: event1.id,
      code: "NEWBIE20",
      name: "New Developer Discount",
      description: "20% off for first-time workshop attendees",
      discountType: "PERCENTAGE",
      discountValue: 20,
      maxUses: 10,
      validFrom: new Date("2025-01-01"),
      validUntil: new Date("2025-09-14"),
    },
  });

  await prisma.promotion.create({
    data: {
      eventId: event2.id,
      code: "SUMMER50",
      name: "Summer Special",
      description: "$50 off festival tickets",
      discountType: "FIXED_AMOUNT",
      discountValue: 50,
      maxUses: 100,
      validFrom: new Date("2025-06-01"),
      validUntil: new Date("2025-07-19"),
    },
  });

  console.log("✅ EventHive database seeding completed successfully!");
  console.log(`📊 Created:
    - 3 users and attendee profiles
    - 3 events (Workshop, Concert, Hackathon)
    - 5 ticket types
    - 2 promotional codes
  `);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
