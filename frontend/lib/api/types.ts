// contracts mirroring the NestJS backend's responses

export type AdminRole = "super_admin" | "cinema_admin";

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

// GET /admin/profile returns the JWT payload, not the full admin record
export type Profile = {
  userId: string;
  email: string;
  role: AdminRole;
};

export type LoginResponse = { admin: Admin };

export type CinemaSettings = {
  basePrice: number;
  includedGuests: number;
  maxGuests: number;
  extraSeatPrice: number;
  sessionDurationHours: number;
  vatRate: number;
  timeSlots: string[];
  bookingEnabled: boolean;
};

export type Movie = {
  _id: string;
  title: string;
  synopsis?: string;
  genre?: string;
  durationMins?: number;
  posterUrl?: string;
  visible: boolean;
  createdAt: string;
};

export type BookingStatus = "pending" | "reserved" | "cancelled" | "completed";

export type Booking = {
  _id: string;
  bookingRef: string;
  experience: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string;
  timeSlot: string;
  guests: number;
  subtotal: number;
  vatAmount: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
};

export type Availability = {
  date: string;
  bookingEnabled: boolean;
  slots: { time: string; available: boolean }[];
};

export type CreateBookingResponse = {
  booking: Pick<
    Booking,
    | "bookingRef"
    | "date"
    | "timeSlot"
    | "guests"
    | "subtotal"
    | "vatAmount"
    | "totalPrice"
  >;
  paymentLink: string;
};

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type Payment = {
  _id: string;
  reference: string;
  transactionId?: string;
  amount: number;
  currency: string;
  type: "inflow" | "outflow";
  category: "booking_payment" | "refund";
  status: PaymentStatus;
  paymentMethod: string;
  bookingId?: Booking | string;
  createdAt: string;
};

export type PaymentVerification = {
  reference: string;
  localStatus: PaymentStatus;
  gatewayStatus: string;
  amount: number;
  currency: string;
};

export type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type MonthlyRevenue = { month: string; revenue: number };

export type PageMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type BookingsPage = { bookings: Booking[]; meta: PageMeta };
export type PaymentsPage = { payments: Payment[]; meta: PageMeta };
export type MessagesPage = { messages: ContactMessage[]; meta: PageMeta };
