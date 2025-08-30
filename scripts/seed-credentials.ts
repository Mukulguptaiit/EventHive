import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

async function seedKnownUsers() {
  const users = [
    {
      name: "EventHive Admin",
      email: "admin@eventhive.com",
      password: "Admin@123",
      profile: { firstName: "EventHive", lastName: "Admin" },
    },
    {
      name: "Olivia Organizer",
      email: "organizer@eventhive.com",
      password: "Organizer@123",
      profile: { firstName: "Olivia", lastName: "Organizer" },
    },
    {
      name: "Aarav Attendee",
      email: "attendee@eventhive.com",
      password: "Attendee@123",
      profile: { firstName: "Aarav", lastName: "Attendee" },
    },
  ] as const;

  for (const u of users) {
    const now = new Date();

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        emailVerified: true,
        updatedAt: now,
      },
      create: {
        name: u.name,
        email: u.email,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
  create: {
        userId: user.id,
        firstName: u.profile.firstName,
        lastName: u.profile.lastName,
        interests: ["Events"],
      },
    });

    // Find any existing credential/email account for this user/email
    const existing = await prisma.account.findFirst({
      where: {
        userId: user.id,
        accountId: u.email,
        providerId: { in: ["credential", "email"] },
      },
    });

    const passwordHash = bcrypt.hashSync(u.password, 10);

    if (existing) {
      await prisma.account.update({
        where: { id: existing.id },
        data: {
          providerId: "email",
          password: passwordHash,
          updatedAt: now,
        },
      });
    } else {
      await prisma.account.create({
        data: {
          id: randomUUID(),
          accountId: u.email,
          providerId: "email",
          userId: user.id,
          password: passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    console.log(`Seeded user ${u.email} with password ${u.password}`);
  }
}

async function main() {
  console.log("Seeding known credential users (admin/organizer/attendee)...");
  await seedKnownUsers();
  console.log("Done seeding credentials.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
