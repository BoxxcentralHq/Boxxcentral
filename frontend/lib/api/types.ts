import type { IconSvgElement } from "@hugeicons/react";

// contracts mirroring the NestJS backend's responses

export type AdminRole = "super_admin" | "cinema_admin" | "lounge_admin";

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

export type CreateAdminBody = {
  name: string;
  email: string;
  password: string;
  role: "cinema_admin" | "lounge_admin";
};

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export type CinemaSettings = {
  basePrice: number;
  includedGuests: number;
  maxGuests: number;
  extraSeatPrice: number;
  sessionDurationHours: number;
  /** Percentage, e.g. 7.5 — divide by 100 before applying to a subtotal. */
  vatRate: number;
  timeSlots: string[];
  /** Physical rooms — each is checked/booked independently, e.g. ["Cinema 1", "Cinema 2"]. */
  rooms: string[];
  bookingEnabled: boolean;
};

export type UpdateCinemaSettingsBody = Partial<CinemaSettings>;

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

export const MENU_CATEGORIES = [
  "Food",
  "Pastries",
  "Pizza",
  "Signature Cocktail",
  "Classic Cocktails",
  "Mocktail",
  "Smoothie",
  "Juices",
  "Shots",
  "Drinks",
] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export type MenuItem = {
  _id: string;
  name: string;
  category: MenuCategory;
  // naira, raw — format for display with toLocaleString("en-NG")
  price: number;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  tags: string[];
  visible: boolean;
  createdAt: string;
};

export type BookingStatus = "pending" | "reserved" | "cancelled" | "completed";

export type CreateBookingBody = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "HH:mm", must match one of CinemaSettings.timeSlots
  room: string; // must match one of CinemaSettings.rooms
  guests: number;
  notes?: string;
};

export type Booking = {
  _id: string;
  bookingRef: string;
  experience: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  date: string;
  timeSlot: string;
  room: string;
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
  room: string;
  bookingEnabled: boolean;
  slots: { time: string; available: boolean }[];
};

export type CreateBookingResponse = {
  booking: Pick<
    Booking,
    | "bookingRef"
    | "date"
    | "timeSlot"
    | "room"
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

export type CreateContactMessageBody = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export type MonthlyRevenue = { month: string; revenue: number };

export type PageMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PricingFeature = {
  label: string;
};

/** A single tier within a service's pricing carousel (GymBoxx, BowlBoxx, FilmBoxx). */
export type PricingPlan = {
  id: string;
  title: string;
  icon?: IconSvgElement;
  duration: string;
  price: number;
  featured?: boolean;
  subtitle?: string;
  description?: string;
  features: PricingFeature[];
  buttonText?: string;
};

export type BookingsPage = { bookings: Booking[]; meta: PageMeta };
export type PaymentsPage = { payments: Payment[]; meta: PageMeta };
export type MessagesPage = { messages: ContactMessage[]; meta: PageMeta };
