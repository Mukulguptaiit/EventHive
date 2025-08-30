"use server";

import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus } from "@/generated/prisma";

export interface CreateBookingData {
  eventId: string;
  ticketId: string;
  quantity: number;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  specialRequests?: string;
}

export interface EventBooking {
  id: string;
  eventId: string;
  ticketId: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  specialRequests?: string;
  ticketUrl?: string;
  qrCode?: string;
  barcode?: string;
  createdAt: Date;
  event: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    location: string;
    city: string;
    coverImage: string;
  };
  ticket: {
    id: string;
    name: string;
    type: string;
    price: number;
  };
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
  };
}

export async function createEventBooking(data: CreateBookingData, userId: string) {
  try {
    // Get the event and ticket details
    const [event, ticket] = await Promise.all([
      prisma.event.findUnique({
        where: { id: data.eventId },
        include: { organizer: true },
      }),
      prisma.ticket.findUnique({
        where: { id: data.ticketId },
      }),
    ]);

    if (!event || !ticket) {
      return { success: false, error: 'Event or ticket not found' };
    }

    if (event.status !== 'PUBLISHED') {
      return { success: false, error: 'Event is not published' };
    }

    if (!ticket.isActive) {
      return { success: false, error: 'Ticket is not available' };
    }

    if (ticket.availableQuantity < data.quantity) {
      return { success: false, error: 'Not enough tickets available' };
    }

    if (data.quantity > ticket.maxPerUser) {
      return { success: false, error: `Maximum ${ticket.maxPerUser} tickets per user allowed` };
    }

    const totalAmount = ticket.price * data.quantity;

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        eventId: data.eventId,
        ticketId: data.ticketId,
        userId,
        organizerId: event.organizerId,
        quantity: data.quantity,
        totalAmount,
        currency: ticket.currency,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        attendeeName: data.attendeeName,
        attendeeEmail: data.attendeeEmail,
        attendeePhone: data.attendeePhone,
        specialRequests: data.specialRequests,
      },
    });

    // Update ticket availability
    await prisma.ticket.update({
      where: { id: data.ticketId },
      data: {
        soldQuantity: { increment: data.quantity },
        availableQuantity: { decrement: data.quantity },
      },
    });

    // Update event attendee count
    await prisma.event.update({
      where: { id: data.eventId },
      data: {
        currentAttendees: { increment: data.quantity },
      },
    });

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: 'Failed to create booking' };
  }
}

export async function getUserBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            startTime: true,
            endTime: true,
            location: true,
            city: true,
            coverImage: true,
          },
        },
        ticket: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
          },
        },
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings as EventBooking[];
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw new Error('Failed to fetch user bookings');
  }
}

export async function getEventBookings(eventId: string, organizerId: string) {
  try {
    // Verify the user is the organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event || event.organizerId !== organizerId) {
      throw new Error('Unauthorized access');
    }

    const bookings = await prisma.booking.findMany({
      where: { eventId },
      include: {
        ticket: {
          select: {
            name: true,
            type: true,
            price: true,
          },
        },
        attendee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings;
  } catch (error) {
    console.error('Error fetching event bookings:', error);
    throw new Error('Failed to fetch event bookings');
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  userId: string
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    // Check if user is the organizer or the attendee
    if (booking.userId !== userId && booking.organizerId !== userId) {
      return { success: false, error: 'Unauthorized access' };
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return { success: true, booking: updatedBooking };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { success: false, error: 'Failed to update booking status' };
  }
}

export async function cancelBooking(bookingId: string, userId: string, reason?: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true, ticket: true },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    // Check if user is the attendee
    if (booking.userId !== userId) {
      return { success: false, error: 'Unauthorized access' };
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return { success: false, error: 'Booking is already cancelled' };
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return { success: false, error: 'Cannot cancel completed booking' };
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Update ticket availability
    await prisma.ticket.update({
      where: { id: booking.ticketId },
      data: {
        soldQuantity: { decrement: booking.quantity },
        availableQuantity: { increment: booking.quantity },
      },
    });

    // Update event attendee count
    await prisma.event.update({
      where: { id: booking.eventId },
      data: {
        currentAttendees: { decrement: booking.quantity },
      },
    });

    return { success: true, booking: updatedBooking };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, error: 'Failed to cancel booking' };
  }
}

export async function getBookingStats(eventId?: string, organizerId?: string) {
  try {
    const where: any = {};
    
    if (eventId) {
      where.eventId = eventId;
    }
    
    if (organizerId) {
      where.organizerId = organizerId;
    }

    const [totalBookings, confirmedBookings, completedBookings, cancelledBookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.count({ where: { ...where, status: BookingStatus.CONFIRMED } }),
      prisma.booking.count({ where: { ...where, status: BookingStatus.COMPLETED } }),
      prisma.booking.count({ where: { ...where, status: BookingStatus.CANCELLED } }),
    ]);

    const revenueData = await prisma.booking.aggregate({
      where: { ...where, status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] } },
      _sum: { totalAmount: true },
    });

    const totalRevenue = revenueData._sum.totalAmount || 0;

    return {
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
    };
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    throw new Error('Failed to fetch booking stats');
  }
}

export async function generateTicketQR(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true, ticket: true },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    // Generate QR code data
    const qrData = {
      bookingId: booking.id,
      eventId: booking.eventId,
      ticketId: booking.ticketId,
      attendeeName: booking.attendeeName,
      timestamp: Date.now(),
    };

    // Update booking with QR code
    await prisma.booking.update({
      where: { id: bookingId },
      data: { qrCode: JSON.stringify(qrData) },
    });

    return { success: true, qrData };
  } catch (error) {
    console.error('Error generating QR code:', error);
    return { success: false, error: 'Failed to generate QR code' };
  }
}

export async function checkInAttendee(bookingId: string, checkedInBy: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      return { success: false, error: 'Booking is not confirmed' };
    }

    // Check if already checked in
    const existingCheckIn = await prisma.checkIn.findUnique({
      where: { bookingId },
    });

    if (existingCheckIn) {
      return { success: false, error: 'Attendee already checked in' };
    }

    // Create check-in record
    const checkIn = await prisma.checkIn.create({
      data: {
        eventId: booking.eventId,
        bookingId: booking.id,
        userId: booking.userId,
        checkedInBy,
        method: 'qr',
        location: 'Main Entrance',
      },
    });

    return { success: true, checkIn };
  } catch (error) {
    console.error('Error checking in attendee:', error);
    return { success: false, error: 'Failed to check in attendee' };
  }
}
