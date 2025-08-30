import { prisma } from "../src/lib/prisma";

// Helper function to generate random date within range
function getRandomDateBetween(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

async function main() {
  console.log("Creating comprehensive sample data...");

  // Create dates for spreading user registrations over the past 60 days
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Create owner users
  const owner1CreatedAt = getRandomDateBetween(
    sixtyDaysAgo,
    new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  );
  const owner1 = await prisma.user.upsert({
    where: { email: "rajesh@sbrbadminton.com" },
    update: {},
    create: {
      name: "Rajesh Patel",
      email: "rajesh@sbrbadminton.com",
      emailVerified: true,
      createdAt: owner1CreatedAt,
      updatedAt: owner1CreatedAt,
    },
  });

  const owner2CreatedAt = getRandomDateBetween(
    sixtyDaysAgo,
    new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
  );
  const owner2 = await prisma.user.upsert({
    where: { email: "priya@elitesports.com" },
    update: {},
    create: {
      name: "Priya Shah",
      email: "priya@elitesports.com",
      emailVerified: true,
      createdAt: owner2CreatedAt,
      updatedAt: owner2CreatedAt,
    },
  });

  // Create additional facility owners
  const additionalOwners = [
    {
      name: "Amit Kumar",
      email: "amit@sportsworld.com",
      phone: "+919876543215",
    },
    {
      name: "Sneha Reddy",
      email: "sneha@courtclub.com",
      phone: "+919876543216",
    },
    {
      name: "Vikas Sharma",
      email: "vikas@playtime.com",
      phone: "+919876543217",
    },
    {
      name: "Neha Gupta",
      email: "neha@sportstopia.com",
      phone: "+919876543218",
    },
    {
      name: "Rohit Mehta",
      email: "rohit@gamezone.com",
      phone: "+919876543219",
    },
    {
      name: "Kavya Nair",
      email: "kavya@activehub.com",
      phone: "+919876543220",
    },
    {
      name: "Arjun Singh",
      email: "arjun@sportscenter.com",
      phone: "+919876543221",
    },
  ];

  const ownerUsers = [];
  for (const ownerData of additionalOwners) {
    const userCreatedAt = getRandomDateBetween(
      sixtyDaysAgo,
      new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    );
    const user = await prisma.user.upsert({
      where: { email: ownerData.email },
      update: {},
      create: {
        name: ownerData.name,
        email: ownerData.email,
        emailVerified: true,
        createdAt: userCreatedAt,
        updatedAt: userCreatedAt,
      },
    });
    ownerUsers.push({ user, phone: ownerData.phone });
  }

  console.log(`Created ${additionalOwners.length} additional facility owners`);

  // Create player profiles for owners
  const ownerProfile1 = await prisma.playerProfile.upsert({
    where: { userId: owner1.id },
    update: {},
    create: {
      userId: owner1.id,
      role: "FACILITY_OWNER",
      phoneNumber: "+919876543210",
      isActive: true,
    },
  });

  const ownerProfile2 = await prisma.playerProfile.upsert({
    where: { userId: owner2.id },
    update: {},
    create: {
      userId: owner2.id,
      role: "FACILITY_OWNER",
      phoneNumber: "+919876543211",
      isActive: true,
    },
  });

  const additionalOwnerProfiles = [];
  for (const { user, phone } of ownerUsers) {
    const profile = await prisma.playerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        role: "FACILITY_OWNER",
        phoneNumber: phone,
        isActive: true,
      },
    });
    additionalOwnerProfiles.push(profile);
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

    const profile = await prisma.playerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        role: "USER",
        phoneNumber: userData.phone,
        isActive: true,
      },
    });
    userProfiles.push(profile);
  }

  console.log(`Created ${regularUsers.length} regular users`);

  // Create comprehensive facilities
  // Create comprehensive facilities with proper typing and spread creation dates
  const facilitiesData = [
    // Existing facilities (updated)
    {
      name: "SBR Badminton",
      description: "Premium badminton facility with state-of-the-art courts",
      address: "Vastrapur, Ahmedabad, Gujarat 380015",
      latitude: 23.0395677,
      longitude: 72.5297227,
      amenities: ["AC", "Parking", "Changing Room"],
      photos: ["/assets/modern-badminton-court.png"],
      phone: "+917265432101",
      email: "info@sbrbadminton.com",
      policies: ["No smoking", "Sports shoes mandatory"],
      venueType: "INDOOR" as const,
      rating: 4.5,
      reviewCount: 124,
      ownerId: ownerProfile1.id,
      status: "APPROVED" as const,
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      ),
      approvedAt: getRandomDateBetween(
        new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      name: "Elite Sports Arena",
      description: "Multi-sport facility with tennis and badminton courts",
      address: "Satellite, Ahmedabad, Gujarat 380015",
      latitude: 23.0225,
      longitude: 72.5714,
      amenities: ["AC", "Parking", "Pro Shop"],
      photos: ["/assets/professional-badminton-court.png"],
      phone: "+917265432102",
      email: "info@elitesports.com",
      policies: ["Professional coaching available"],
      venueType: "INDOOR" as const,
      rating: 4.8,
      reviewCount: 89,
      ownerId: ownerProfile2.id,
      status: "APPROVED" as const,
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      ),
      approvedAt: getRandomDateBetween(
        new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      name: "Champions Ground",
      description: "Outdoor sports complex for football and cricket",
      address: "Bodakdev, Ahmedabad, Gujarat 380054",
      latitude: 23.0593,
      longitude: 72.5194,
      amenities: ["Floodlights", "Parking", "Cafeteria"],
      photos: ["/assets/football-turf-ground.png"],
      phone: "+917265432103",
      email: "info@champions.com",
      policies: ["Team bookings available"],
      venueType: "OUTDOOR" as const,
      rating: 4.6,
      reviewCount: 156,
      ownerId: ownerProfile1.id,
      status: "APPROVED" as const,
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      ),
      approvedAt: getRandomDateBetween(
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      ),
    },
    // New facilities across different cities
    {
      name: "Mumbai Sports Hub",
      description: "Premier multi-sport facility in the heart of Mumbai",
      address: "Andheri West, Mumbai, Maharashtra 400058",
      latitude: 19.1136,
      longitude: 72.8697,
      amenities: ["AC", "Parking", "Cafeteria", "Pro Shop", "Lockers"],
      photos: ["/assets/indoor-tennis-court.png"],
      phone: "+912265432104",
      email: "info@mumbaisports.com",
      policies: ["Valid ID required", "Advance booking recommended"],
      venueType: "INDOOR" as const,
      rating: 4.7,
      reviewCount: 203,
      ownerId: additionalOwnerProfiles[0].id,
      status: "APPROVED" as const,
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      ),
      approvedAt: getRandomDateBetween(
        new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      name: "Delhi Sports Complex",
      description: "State-of-the-art outdoor sports facility",
      address: "Connaught Place, New Delhi, Delhi 110001",
      latitude: 28.6315,
      longitude: 77.2167,
      amenities: ["Floodlights", "Parking", "Equipment Rental", "First Aid"],
      photos: ["/assets/outdoor-basketball-court.png"],
      phone: "+911165432105",
      email: "info@delhisports.com",
      policies: ["Team bookings available", "Equipment provided"],
      venueType: "OUTDOOR" as const,
      rating: 4.4,
      reviewCount: 178,
      ownerId: additionalOwnerProfiles[1].id,
      status: "APPROVED" as const,
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      ),
      approvedAt: getRandomDateBetween(
        new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      name: "Bangalore Racquet Club",
      description: "Exclusive tennis and badminton club",
      address: "Koramangala, Bangalore, Karnataka 560034",
      latitude: 12.9352,
      longitude: 77.6245,
      amenities: ["AC", "Parking", "Pro Shop", "Coaching Available", "Shower"],
      photos: ["/assets/tennis.jpg"],
      phone: "+918065432106",
      email: "info@bangaloreracquet.com",
      policies: ["Membership required", "Professional coaching available"],
      venueType: "INDOOR" as const,
      rating: 4.9,
      reviewCount: 156,
      ownerId: additionalOwnerProfiles[2].id,
      status: "APPROVED" as const,
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      ),
      approvedAt: getRandomDateBetween(
        new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      name: "Pune Football Academy",
      description: "Professional football training facility",
      address: "Hinjewadi, Pune, Maharashtra 411057",
      latitude: 18.5793,
      longitude: 73.8143,
      amenities: ["Floodlights", "Parking", "Cafeteria", "Equipment Rental"],
      photos: ["/assets/football.jpg"],
      phone: "+912065432107",
      email: "info@punefootball.com",
      policies: ["Team bookings preferred", "Professional training available"],
      venueType: "OUTDOOR" as const,
      rating: 4.6,
      reviewCount: 142,
      ownerId: additionalOwnerProfiles[3].id,
      status: "APPROVED" as const,
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      ),
      approvedAt: getRandomDateBetween(
        new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      name: "Chennai Tennis Center",
      description: "Premium tennis facility with multiple courts",
      address: "T. Nagar, Chennai, Tamil Nadu 600017",
      latitude: 13.0418,
      longitude: 80.2341,
      amenities: ["AC", "Parking", "Pro Shop", "Towel Service", "CCTV"],
      photos: ["/assets/tennis.jpg"],
      phone: "+914465432108",
      email: "info@chennaitemnis.com",
      policies: [
        "Advance booking required",
        "Professional equipment available",
      ],
      venueType: "INDOOR" as const,
      rating: 4.8,
      reviewCount: 189,
      ownerId: additionalOwnerProfiles[4].id,
      status: "APPROVED" as const,
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      ),
      approvedAt: getRandomDateBetween(
        new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      name: "Hyderabad Cricket Ground",
      description: "Full-size cricket ground with modern facilities",
      address: "HITEC City, Hyderabad, Telangana 500081",
      latitude: 17.4435,
      longitude: 78.3772,
      amenities: [
        "Floodlights",
        "Parking",
        "Cafeteria",
        "Equipment Rental",
        "Lockers",
      ],
      photos: ["/assets/cricket.jpg"],
      phone: "+914065432109",
      email: "info@hyderabadcricket.com",
      policies: ["Team bookings only", "Equipment provided"],
      venueType: "OUTDOOR" as const,
      rating: 4.5,
      reviewCount: 167,
      ownerId: additionalOwnerProfiles[5].id,
      status: "APPROVED" as const,
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      ),
      approvedAt: getRandomDateBetween(
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      ),
    },
    {
      name: "Kolkata Sports Arena",
      description: "Multi-sport indoor facility",
      address: "Salt Lake, Kolkata, West Bengal 700064",
      latitude: 22.5726,
      longitude: 88.3639,
      amenities: ["AC", "Parking", "Changing Room", "Pro Shop", "First Aid"],
      photos: ["/assets/indoor-tennis-court.png"],
      phone: "+913365432110",
      email: "info@kolkatasports.com",
      policies: ["Valid ID required", "Sports shoes mandatory"],
      venueType: "INDOOR" as const,
      rating: 4.3,
      reviewCount: 134,
      ownerId: additionalOwnerProfiles[6].id,
      status: "APPROVED" as const,
      createdAt: getRandomDateBetween(
        sixtyDaysAgo,
        new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      ),
      approvedAt: getRandomDateBetween(
        new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      ),
    },
    // Some pending facilities for admin demo
    {
      name: "Premium Sports Club",
      description: "Luxury sports facility awaiting approval",
      address: "Bandra, Mumbai, Maharashtra 400050",
      latitude: 19.0596,
      longitude: 72.8295,
      amenities: ["AC", "Parking", "Pro Shop", "Cafeteria"],
      photos: ["/assets/modern-badminton-court.png"],
      phone: "+912265432111",
      email: "info@premiumsports.com",
      policies: ["Membership required"],
      venueType: "INDOOR" as const,
      rating: null,
      reviewCount: 0,
      ownerId: additionalOwnerProfiles[0].id,
      status: "PENDING" as const,
      createdAt: getRandomDateBetween(
        new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        new Date(),
      ),
    },
    {
      name: "City Basketball Court",
      description: "New basketball facility pending approval",
      address: "Gurgaon, Haryana 122001",
      latitude: 28.4595,
      longitude: 77.0266,
      amenities: ["Parking", "Equipment Rental"],
      photos: ["/assets/outdoor-basketball-court.png"],
      phone: "+911265432112",
      email: "info@citybasketball.com",
      policies: ["Team bookings available"],
      venueType: "OUTDOOR" as const,
      rating: null,
      reviewCount: 0,
      ownerId: additionalOwnerProfiles[1].id,
      status: "PENDING" as const,
      createdAt: getRandomDateBetween(
        new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        new Date(),
      ),
    },
  ];

  await prisma.facility.createMany({
    data: facilitiesData,
    skipDuplicates: true,
  });

  console.log(`Created ${facilitiesData.length} facilities`);

  // Get all created facilities for court creation
  const facilities = await prisma.facility.findMany({
    where: {
      name: {
        in: [
          "SBR Badminton",
          "Elite Sports Arena",
          "Champions Ground",
          "Mumbai Sports Hub",
          "Delhi Sports Complex",
          "Bangalore Racquet Club",
          "Pune Football Academy",
          "Chennai Tennis Center",
          "Hyderabad Cricket Ground",
          "Kolkata Sports Arena",
          "Premium Sports Club",
          "City Basketball Court",
        ],
      },
    },
  });

  // Define court configurations for each facility
  const courtConfigurations = [
    {
      facilityName: "SBR Badminton",
      courts: [
        {
          name: "Court A",
          sportType: "BADMINTON" as const,
          pricePerHour: 450,
          startHour: 6,
          endHour: 23,
        },
        {
          name: "Court B",
          sportType: "BADMINTON" as const,
          pricePerHour: 450,
          startHour: 6,
          endHour: 23,
        },
        {
          name: "Court C",
          sportType: "BADMINTON" as const,
          pricePerHour: 500,
          startHour: 6,
          endHour: 23,
        },
      ],
    },
    {
      facilityName: "Elite Sports Arena",
      courts: [
        {
          name: "Tennis Court 1",
          sportType: "TENNIS" as const,
          pricePerHour: 600,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Badminton Court 1",
          sportType: "BADMINTON" as const,
          pricePerHour: 500,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Badminton Court 2",
          sportType: "BADMINTON" as const,
          pricePerHour: 500,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Tennis Court 2",
          sportType: "TENNIS" as const,
          pricePerHour: 650,
          startHour: 6,
          endHour: 22,
        },
      ],
    },
    {
      facilityName: "Champions Ground",
      courts: [
        {
          name: "Football Field",
          sportType: "FOOTBALL" as const,
          pricePerHour: 800,
          startHour: 6,
          endHour: 21,
        },
        {
          name: "Cricket Ground",
          sportType: "CRICKET" as const,
          pricePerHour: 1000,
          startHour: 6,
          endHour: 20,
        },
      ],
    },
    {
      facilityName: "Mumbai Sports Hub",
      courts: [
        {
          name: "Tennis Court A",
          sportType: "TENNIS" as const,
          pricePerHour: 700,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Tennis Court B",
          sportType: "TENNIS" as const,
          pricePerHour: 700,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Badminton Court 1",
          sportType: "BADMINTON" as const,
          pricePerHour: 550,
          startHour: 6,
          endHour: 23,
        },
        {
          name: "Badminton Court 2",
          sportType: "BADMINTON" as const,
          pricePerHour: 550,
          startHour: 6,
          endHour: 23,
        },
        {
          name: "Squash Court",
          sportType: "SQUASH" as const,
          pricePerHour: 400,
          startHour: 6,
          endHour: 22,
        },
      ],
    },
    {
      facilityName: "Delhi Sports Complex",
      courts: [
        {
          name: "Basketball Court 1",
          sportType: "BASKETBALL" as const,
          pricePerHour: 600,
          startHour: 6,
          endHour: 21,
        },
        {
          name: "Basketball Court 2",
          sportType: "BASKETBALL" as const,
          pricePerHour: 600,
          startHour: 6,
          endHour: 21,
        },
        {
          name: "Football Field",
          sportType: "FOOTBALL" as const,
          pricePerHour: 900,
          startHour: 6,
          endHour: 20,
        },
        {
          name: "Volleyball Court",
          sportType: "VOLLEYBALL" as const,
          pricePerHour: 500,
          startHour: 6,
          endHour: 21,
        },
      ],
    },
    {
      facilityName: "Bangalore Racquet Club",
      courts: [
        {
          name: "Tennis Court 1",
          sportType: "TENNIS" as const,
          pricePerHour: 800,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Tennis Court 2",
          sportType: "TENNIS" as const,
          pricePerHour: 800,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Tennis Court 3",
          sportType: "TENNIS" as const,
          pricePerHour: 750,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Badminton Court 1",
          sportType: "BADMINTON" as const,
          pricePerHour: 600,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Badminton Court 2",
          sportType: "BADMINTON" as const,
          pricePerHour: 600,
          startHour: 6,
          endHour: 22,
        },
      ],
    },
    {
      facilityName: "Pune Football Academy",
      courts: [
        {
          name: "Main Field",
          sportType: "FOOTBALL" as const,
          pricePerHour: 1000,
          startHour: 6,
          endHour: 20,
        },
        {
          name: "Training Field 1",
          sportType: "FOOTBALL" as const,
          pricePerHour: 700,
          startHour: 6,
          endHour: 21,
        },
        {
          name: "Training Field 2",
          sportType: "FOOTBALL" as const,
          pricePerHour: 700,
          startHour: 6,
          endHour: 21,
        },
      ],
    },
    {
      facilityName: "Chennai Tennis Center",
      courts: [
        {
          name: "Centre Court",
          sportType: "TENNIS" as const,
          pricePerHour: 900,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Court 1",
          sportType: "TENNIS" as const,
          pricePerHour: 750,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Court 2",
          sportType: "TENNIS" as const,
          pricePerHour: 750,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Court 3",
          sportType: "TENNIS" as const,
          pricePerHour: 750,
          startHour: 6,
          endHour: 22,
        },
      ],
    },
    {
      facilityName: "Hyderabad Cricket Ground",
      courts: [
        {
          name: "Main Ground",
          sportType: "CRICKET" as const,
          pricePerHour: 1200,
          startHour: 6,
          endHour: 20,
        },
        {
          name: "Practice Nets 1",
          sportType: "CRICKET" as const,
          pricePerHour: 400,
          startHour: 6,
          endHour: 21,
        },
        {
          name: "Practice Nets 2",
          sportType: "CRICKET" as const,
          pricePerHour: 400,
          startHour: 6,
          endHour: 21,
        },
      ],
    },
    {
      facilityName: "Kolkata Sports Arena",
      courts: [
        {
          name: "Badminton Court 1",
          sportType: "BADMINTON" as const,
          pricePerHour: 450,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Badminton Court 2",
          sportType: "BADMINTON" as const,
          pricePerHour: 450,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Table Tennis 1",
          sportType: "TABLE_TENNIS" as const,
          pricePerHour: 200,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Table Tennis 2",
          sportType: "TABLE_TENNIS" as const,
          pricePerHour: 200,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Squash Court",
          sportType: "SQUASH" as const,
          pricePerHour: 350,
          startHour: 6,
          endHour: 22,
        },
      ],
    },
    {
      facilityName: "Premium Sports Club",
      courts: [
        {
          name: "Premium Court 1",
          sportType: "TENNIS" as const,
          pricePerHour: 1000,
          startHour: 6,
          endHour: 22,
        },
        {
          name: "Premium Court 2",
          sportType: "BADMINTON" as const,
          pricePerHour: 700,
          startHour: 6,
          endHour: 22,
        },
      ],
    },
    {
      facilityName: "City Basketball Court",
      courts: [
        {
          name: "Main Court",
          sportType: "BASKETBALL" as const,
          pricePerHour: 500,
          startHour: 6,
          endHour: 21,
        },
        {
          name: "Training Court",
          sportType: "BASKETBALL" as const,
          pricePerHour: 400,
          startHour: 6,
          endHour: 21,
        },
      ],
    },
  ];

  // Create courts for each facility
  let totalCourts = 0;
  for (const config of courtConfigurations) {
    const facility = facilities.find((f) => f.name === config.facilityName);
    if (!facility) continue;

    for (const courtData of config.courts) {
      // Spread court creation over time - courts created after facility approval
      const courtCreatedAt = getRandomDateBetween(
        facility.approvedAt || facility.createdAt,
        new Date(),
      );

      await prisma.court.create({
        data: {
          name: courtData.name,
          facilityId: facility.id,
          sportType: courtData.sportType,
          pricePerHour: courtData.pricePerHour,
          operatingStartHour: courtData.startHour,
          operatingEndHour: courtData.endHour,
          isActive: true,
          createdAt: courtCreatedAt,
          updatedAt: courtCreatedAt,
        },
      });
      totalCourts++;
    }
  }

  console.log(`Created ${totalCourts} courts across all facilities`);

  console.log(`Created ${totalCourts} courts across all facilities`);

  // Generate time slots for the next 7 days
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7);

  const allCourts = await prisma.court.findMany({
    include: { facility: true },
  });

  console.log("Generating time slots for next 7 days...");
  let totalTimeSlots = 0;

  for (const court of allCourts) {
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      for (
        let hour = court.operatingStartHour;
        hour < court.operatingEndHour;
        hour++
      ) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        // Add some maintenance blocks randomly (5% chance)
        const isMaintenanceBlocked = Math.random() < 0.05;

        // Peak hour pricing (6-9 AM and 6-9 PM get 20% higher pricing)
        const isPeakHour =
          (hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21);
        const priceMultiplier = isPeakHour ? 1.2 : 1.0;
        const slotPrice = Math.round(court.pricePerHour * priceMultiplier);

        // Check if time slot already exists
        const existingSlot = await prisma.timeSlot.findUnique({
          where: {
            courtId_startTime: {
              courtId: court.id,
              startTime: slotStart,
            },
          },
        });

        if (!existingSlot) {
          await prisma.timeSlot.create({
            data: {
              courtId: court.id,
              startTime: slotStart,
              endTime: slotEnd,
              price: slotPrice,
              isMaintenanceBlocked: isMaintenanceBlocked,
              maintenanceReason: isMaintenanceBlocked
                ? "Scheduled maintenance"
                : null,
            },
          });
          totalTimeSlots++;
        }
      }
    }
  }

  console.log(`Created ${totalTimeSlots} time slots`);

  // Create sample bookings (40-60% occupancy rate)
  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      isMaintenanceBlocked: false,
      startTime: {
        gte: new Date(), // Only future and current slots
      },
    },
    include: {
      court: {
        include: { facility: true },
      },
    },
  });

  console.log("Creating sample bookings...");
  let totalBookings = 0;
  const occupancyRate = 0.45; // 45% occupancy rate

  for (const timeSlot of timeSlots) {
    if (Math.random() < occupancyRate) {
      // Pick a random user to make the booking
      const randomUserProfile =
        userProfiles[Math.floor(Math.random() * userProfiles.length)];

      // Determine booking status (90% confirmed, 5% cancelled, 5% completed)
      let status: "CONFIRMED" | "CANCELLED" | "COMPLETED" = "CONFIRMED";
      if (Math.random() < 0.05) {
        status = "CANCELLED";
      } else if (timeSlot.startTime < new Date()) {
        status = "COMPLETED";
      }

      await prisma.booking.create({
        data: {
          timeSlotId: timeSlot.id,
          courtId: timeSlot.courtId,
          playerId: randomUserProfile.id,
          totalPrice: timeSlot.price || timeSlot.court.pricePerHour,
          status: status,
          paymentSimulated: true,
          bookingNotes:
            Math.random() < 0.3 ? "Looking forward to the game!" : null,
          cancelledAt:
            status === "CANCELLED"
              ? getRandomDateBetween(timeSlot.startTime, new Date())
              : null,
          cancellationReason:
            status === "CANCELLED" ? "Personal emergency" : null,
        },
      });
      totalBookings++;
    }
  }

  console.log(`Created ${totalBookings} bookings`);

  // Create facility reviews
  console.log("Creating facility reviews...");
  const approvedFacilities = await prisma.facility.findMany({
    where: { status: "APPROVED" },
  });

  let totalReviews = 0;
  for (const facility of approvedFacilities) {
    // Each facility gets 3-8 reviews
    const reviewCount = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < reviewCount; i++) {
      const randomUserProfile =
        userProfiles[Math.floor(Math.random() * userProfiles.length)];

      // Rating distribution: mostly 4-5 stars (80%), some 3 star (15%), few 1-2 star (5%)
      let rating: number;
      const ratingRandom = Math.random();
      if (ratingRandom < 0.5) rating = 5;
      else if (ratingRandom < 0.8) rating = 4;
      else if (ratingRandom < 0.95) rating = 3;
      else rating = Math.floor(Math.random() * 2) + 1; // 1 or 2

      const comments = [
        "Great facility with excellent courts!",
        "Well maintained and professional staff.",
        "Good value for money, will come back.",
        "Nice ambiance and clean facilities.",
        "Courts are in excellent condition.",
        "Staff is helpful and friendly.",
        "Could improve the changing room facilities.",
        "Parking can be challenging during peak hours.",
        "Amazing experience, highly recommended!",
        "Professional setup with quality equipment.",
      ];

      try {
        await prisma.facilityReview.create({
          data: {
            facilityId: facility.id,
            playerId: randomUserProfile.id,
            rating: rating,
            comment:
              Math.random() < 0.8
                ? comments[Math.floor(Math.random() * comments.length)]
                : null,
            verified: Math.random() < 0.7, // 70% verified reviews
          },
        });
        totalReviews++;
      } catch {
        // Skip if duplicate review (one review per player per facility)
        continue;
      }
    }
  }

  console.log(`Created ${totalReviews} facility reviews`);

  // Update facility ratings based on reviews
  for (const facility of approvedFacilities) {
    const reviews = await prisma.facilityReview.findMany({
      where: { facilityId: facility.id },
    });

    if (reviews.length > 0) {
      const avgRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;
      await prisma.facility.update({
        where: { id: facility.id },
        data: {
          rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
          reviewCount: reviews.length,
        },
      });
    }
  }

  console.log("Updated facility ratings based on reviews");

  // Create sample matches for some bookings
  console.log("Creating sample matches...");
  const confirmedBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      timeSlot: {
        startTime: {
          gte: new Date(), // Only future bookings
        },
      },
    },
    include: {
      timeSlot: true,
      court: true,
    },
  });

  let totalMatches = 0;
  // Create matches for 30% of confirmed bookings
  for (const booking of confirmedBookings) {
    if (Math.random() < 0.3) {
      const matchTitles = [
        "Friendly Match",
        "Competitive Game",
        "Practice Session",
        "Tournament Prep",
        "Weekend Game",
        "Morning Match",
        "Evening Game",
      ];

      const skillLevels = ["Beginner", "Intermediate", "Advanced"];
      const maxPlayersMap = {
        BADMINTON: 4,
        TENNIS: 4,
        FOOTBALL: 22,
        CRICKET: 22,
        BASKETBALL: 10,
        TABLE_TENNIS: 4,
        SQUASH: 2,
        VOLLEYBALL: 12,
      };

      await prisma.match.create({
        data: {
          bookingId: booking.id,
          title: matchTitles[Math.floor(Math.random() * matchTitles.length)],
          description:
            Math.random() < 0.5 ? "Looking for players to join!" : null,
          maxPlayers: maxPlayersMap[booking.court.sportType] || 4,
          sportType: booking.court.sportType,
          skillLevel:
            skillLevels[Math.floor(Math.random() * skillLevels.length)],
          status: "OPEN",
          startTime: booking.timeSlot.startTime,
          endTime: booking.timeSlot.endTime,
        },
      });
      totalMatches++;
    }
  }

  console.log(`Created ${totalMatches} matches`);

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("🎉 COMPREHENSIVE SEED DATA CREATED SUCCESSFULLY!");
  console.log("=".repeat(50));
  console.log(`📊 Summary:`);
  console.log(
    `   • Users: ${additionalOwners.length + 2} facility owners + ${regularUsers.length} regular users`,
  );
  console.log(
    `   • Facilities: ${facilitiesData.length} (${facilitiesData.filter((f) => f.status === "APPROVED").length} approved, ${facilitiesData.filter((f) => f.status === "PENDING").length} pending)`,
  );
  console.log(`   • Courts: ${totalCourts}`);
  console.log(`   • Time Slots: ${totalTimeSlots} (next 7 days)`);
  console.log(`   • Bookings: ${totalBookings} (~45% occupancy)`);
  console.log(`   • Reviews: ${totalReviews}`);
  console.log(`   • Matches: ${totalMatches}`);
  console.log(
    "\n🚀 Your QuickCourt platform is now ready for comprehensive testing!",
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
