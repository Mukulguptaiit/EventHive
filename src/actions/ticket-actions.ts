import { prisma } from "@/lib/prisma";
import { TicketType } from "@/generated/prisma";

export interface CreateTicketData {
  eventId: string;
  name: string;
  type: TicketType;
  description?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  quantity: number;
  maxPerUser?: number;
  minPerUser?: number;
  benefits?: string[];
  saleStartDate?: Date;
  saleEndDate?: Date;
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  id: string;
}

export interface TicketListItem {
  id: string;
  name: string;
  type: TicketType;
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
  saleStartDate?: Date;
  saleEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function createTicket(data: CreateTicketData) {
  try {
    // Verify the event exists
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    const ticket = await prisma.ticket.create({
      data: {
        ...data,
        currency: data.currency || 'INR',
        maxPerUser: data.maxPerUser || 1,
        minPerUser: data.minPerUser || 1,
        benefits: data.benefits || [],
        availableQuantity: data.quantity,
        soldQuantity: 0,
        isActive: true,
      },
    });

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { success: false, error: 'Failed to create ticket' };
  }
}

export async function updateTicket(data: UpdateTicketData) {
  try {
    const ticket = await prisma.ticket.update({
      where: { id: data.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return { success: true, ticket };
  } catch (error) {
    console.error('Error updating ticket:', error);
    return { success: false, error: 'Failed to update ticket' };
  }
}

export async function deleteTicket(ticketId: string) {
  try {
    // Check if ticket has any bookings
    const bookingCount = await prisma.booking.count({
      where: { ticketId },
    });

    if (bookingCount > 0) {
      return { success: false, error: 'Cannot delete ticket with existing bookings' };
    }

    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return { success: false, error: 'Failed to delete ticket' };
  }
}

export async function getEventTickets(eventId: string) {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { eventId },
      orderBy: { price: 'asc' },
    });

    return tickets as TicketListItem[];
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    throw new Error('Failed to fetch event tickets');
  }
}

export async function getTicketById(ticketId: string) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    return ticket;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw new Error('Failed to fetch ticket');
  }
}

export async function toggleTicketStatus(ticketId: string) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        isActive: !ticket.isActive,
        updatedAt: new Date(),
      },
    });

    return { success: true, ticket: updatedTicket };
  } catch (error) {
    console.error('Error toggling ticket status:', error);
    return { success: false, error: 'Failed to toggle ticket status' };
  }
}

export async function updateTicketAvailability(ticketId: string, quantity: number) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    // Calculate new available quantity
    const newAvailableQuantity = Math.max(0, ticket.quantity - ticket.soldQuantity + quantity);
    
    if (newAvailableQuantity < 0) {
      return { success: false, error: 'Cannot reduce quantity below sold amount' };
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        quantity: newAvailableQuantity + ticket.soldQuantity,
        availableQuantity: newAvailableQuantity,
        updatedAt: new Date(),
      },
    });

    return { success: true, ticket: updatedTicket };
  } catch (error) {
    console.error('Error updating ticket availability:', error);
    return { success: false, error: 'Failed to update ticket availability' };
  }
}

export async function getTicketStats(eventId: string) {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { eventId },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        soldQuantity: true,
        availableQuantity: true,
        isActive: true,
      },
    });

    const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const soldTickets = tickets.reduce((sum, ticket) => sum + ticket.soldQuantity, 0);
    const availableTickets = tickets.reduce((sum, ticket) => sum + ticket.availableQuantity, 0);
    const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.soldQuantity), 0);

    const ticketTypeStats = tickets.reduce((acc, ticket) => {
      const type = ticket.name;
      if (!acc[type]) {
        acc[type] = {
          name: type,
          total: ticket.quantity,
          sold: ticket.soldQuantity,
          available: ticket.availableQuantity,
          revenue: ticket.price * ticket.soldQuantity,
        };
      } else {
        acc[type].total += ticket.quantity;
        acc[type].sold += ticket.soldQuantity;
        acc[type].available += ticket.availableQuantity;
        acc[type].revenue += ticket.price * ticket.soldQuantity;
      }
      return acc;
    }, {} as Record<string, any>);

    return {
      totalTickets,
      soldTickets,
      availableTickets,
      totalRevenue,
      ticketTypeStats: Object.values(ticketTypeStats),
      tickets,
    };
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    throw new Error('Failed to fetch ticket stats');
  }
}

export async function validateTicketPurchase(
  ticketId: string,
  quantity: number,
  userId: string
) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            status: true,
            startDate: true,
            maxAttendees: true,
            currentAttendees: true,
          },
        },
      },
    });

    if (!ticket) {
      return { success: false, error: 'Ticket not found' };
    }

    if (!ticket.isActive) {
      return { success: false, error: 'Ticket is not available' };
    }

    if (ticket.event.status !== 'PUBLISHED') {
      return { success: false, error: 'Event is not published' };
    }

    if (ticket.event.startDate <= new Date()) {
      return { success: false, error: 'Event has already started' };
    }

    if (ticket.availableQuantity < quantity) {
      return { success: false, error: 'Not enough tickets available' };
    }

    if (quantity > ticket.maxPerUser) {
      return { success: false, error: `Maximum ${ticket.maxPerUser} tickets per user allowed` };
    }

    if (quantity < ticket.minPerUser) {
      return { success: false, error: `Minimum ${ticket.minPerUser} tickets per user required` };
    }

    // Check if user has already purchased tickets for this event
    const existingBookings = await prisma.booking.count({
      where: {
        userId,
        eventId: ticket.eventId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existingBookings + quantity > ticket.maxPerUser) {
      return { success: false, error: 'You have already reached the maximum ticket limit for this event' };
    }

    // Check event capacity
    if (ticket.event.currentAttendees + quantity > ticket.event.maxAttendees) {
      return { success: false, error: 'Event capacity would be exceeded' };
    }

    return { success: true, ticket };
  } catch (error) {
    console.error('Error validating ticket purchase:', error);
    return { success: false, error: 'Failed to validate ticket purchase' };
  }
}
