import { prisma } from "@/lib/prisma";
import { EventStatus, EventCategory } from "@/generated/prisma";

export interface CreateEventData {
  title: string;
  description: string;
  shortDescription?: string;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  timezone?: string;
  location: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  venueName?: string;
  venueType?: string;
  coverImage: string;
  images: string[];
  videoUrl?: string;
  isFree: boolean;
  minPrice?: number;
  maxPrice?: number;
  maxAttendees: number;
  tags: string[];
  socialLinks?: Record<string, string>;
  seoDescription?: string;
  seoKeywords: string[];
  allowWaitlist?: boolean;
  allowCancellation?: boolean;
  cancellationPolicy?: string;
  refundPolicy?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface EventFilters {
  search?: string;
  category?: EventCategory;
  status?: EventStatus;
  city?: string;
  state?: string;
  startDate?: Date;
  endDate?: Date;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  trending?: boolean;
}

export interface EventListItem {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: EventCategory;
  status: EventStatus;
  featured: boolean;
  trending: boolean;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  location: string;
  city: string;
  state: string;
  coverImage: string;
  isFree: boolean;
  minPrice?: number;
  maxPrice?: number;
  currentAttendees: number;
  maxAttendees: number;
  tags: string[];
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
  };
  _count: {
    tickets: number;
    bookings: number;
    reviews: number;
  };
}

export interface EventDetails extends EventListItem {
  address: string;
  country: string;
  latitude?: number;
  longitude?: number;
  venueName?: string;
  venueType?: string;
  images: string[];
  videoUrl?: string;
  timezone: string;
  socialLinks?: Record<string, string>;
  seoDescription?: string;
  seoKeywords: string[];
  allowWaitlist: boolean;
  allowCancellation: boolean;
  cancellationPolicy?: string;
  refundPolicy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tickets: Array<{
    id: string;
    name: string;
    type: string;
    description?: string;
    price: number;
    originalPrice?: number;
    currency: string;
    quantity: number;
    soldQuantity: number;
    availableQuantity: number;
    maxPerUser: number;
    minPerUser: number;
    benefits: string[];
    isActive: boolean;
  }>;
}

export async function getEvents(filters?: EventFilters, limit = 20, offset = 0) {
  try {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } },
      ];
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters?.state) {
      where.state = { contains: filters.state, mode: 'insensitive' };
    }

    if (filters?.startDate) {
      where.startDate = { gte: filters.startDate };
    }

    if (filters?.endDate) {
      where.endDate = { lte: filters.endDate };
    }

    if (filters?.minPrice !== undefined) {
      where.minPrice = { gte: filters.minPrice };
    }

    if (filters?.maxPrice !== undefined) {
      where.maxPrice = { lte: filters.maxPrice };
    }

    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters?.trending !== undefined) {
      where.trending = filters.trending;
    }

    // Only show published events by default
    if (!filters?.status) {
      where.status = EventStatus.PUBLISHED;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              displayName: true,
            },
          },
          _count: {
            select: {
              tickets: true,
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { trending: 'desc' },
          { startDate: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
}

export async function getEventById(id: string): Promise<EventDetails | null> {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
        tickets: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
        _count: {
          select: {
            tickets: true,
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    return event as EventDetails;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw new Error('Failed to fetch event');
  }
}

export async function createEvent(data: CreateEventData, organizerId: string) {
  try {
    const event = await prisma.event.create({
      data: {
        ...data,
        organizerId,
        country: data.country || 'India',
        timezone: data.timezone || 'Asia/Kolkata',
        allowWaitlist: data.allowWaitlist ?? true,
        allowCancellation: data.allowCancellation ?? true,
      },
    });

    return { success: true, eventId: event.id };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function updateEvent(data: UpdateEventData) {
  try {
    const event = await prisma.event.update({
      where: { id: data.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { success: true, event };
  } catch (error) {
    console.error('Error updating event:', error);
    return { success: false, error: 'Failed to update event' };
  }
}

export async function deleteEvent(id: string) {
  try {
    await prisma.event.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, error: 'Failed to delete event' };
  }
}

export async function publishEvent(id: string) {
  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { success: true, event };
  } catch (error) {
    console.error('Error publishing event:', error);
    return { success: false, error: 'Failed to publish event' };
  }
}

export async function getFeaturedEvents(limit = 6) {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        featured: true,
        startDate: { gte: new Date() },
      },
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            bookings: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return events;
  } catch (error) {
    console.error('Error fetching featured events:', error);
    throw new Error('Failed to fetch featured events');
  }
}

export async function getTrendingEvents(limit = 6) {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        trending: true,
        startDate: { gte: new Date() },
      },
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            bookings: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return events;
  } catch (error) {
    console.error('Error fetching trending events:', error);
    throw new Error('Failed to fetch trending events');
  }
}

export async function getEventsByCategory(category: EventCategory, limit = 12) {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        category,
        startDate: { gte: new Date() },
      },
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            bookings: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return events;
  } catch (error) {
    console.error('Error fetching events by category:', error);
    throw new Error('Failed to fetch events by category');
  }
}

export async function searchEvents(query: string, limit = 20) {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
          { city: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            bookings: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return events;
  } catch (error) {
    console.error('Error searching events:', error);
    throw new Error('Failed to search events');
  }
}
