import type { IconSvgElement } from "@hugeicons/react";

export type AdminRole =
  | "super_admin"
  | "cinema_admin"
  | "lounge_admin"
  | "gym_admin";

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

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
  role: "cinema_admin" | "lounge_admin" | "gym_admin";
};

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export type CinemaSettings = {
  vatRate: number;
  rooms: string[];
  defaultTicketPrice: number;
  screeningBufferMins: number;
};

export type UpdateCinemaSettingsBody = Partial<CinemaSettings>;

export type Showtime = {
  _id: string;
  date: string;
  time: string;
  screen: string;
  ticketPrice: number;
  seatsLeft: number;
};

export type Movie = {
  _id: string;
  title: string;
  synopsis?: string;
  genre?: string;
  durationMins?: number;
  posterUrl?: string;
  bannerUrl?: string;
  trailerUrl?: string;
  rating?: string;
  visible: boolean;
  createdAt: string;
};

export type NowShowingMovie = Movie & { showtimes: Showtime[] };

export type CreateTicketOrderBody = {
  tickets: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

export type CreateTicketOrderResponse = {
  order: {
    orderRef: string;
    movieTitle: string;
    date: string;
    time: string;
    screen: string;
    tickets: number;
    unitPrice: number;
    subtotal: number;
    vatAmount: number;
    totalPrice: number;
  };
  paymentLink: string;
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
  price: number;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  tags: string[];
  visible: boolean;
  createdAt: string;
};

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type Payment = {
  _id: string;
  reference: string;
  transactionId?: string;
  amount: number;
  currency: string;
  type: "inflow" | "outflow";
  category:
    | "gym_subscription_payment"
    | "ticket_payment"
    | "refund";
  status: PaymentStatus;
  paymentMethod: string;
  ticketOrderId?: string;
  subscriptionId?: string;
  createdAt: string;
};

export type PaymentVerification = {
  reference: string;
  localStatus: PaymentStatus;
  gatewayStatus: string;
  amount: number;
  currency: string;
  category:
    | "gym_subscription_payment"
    | "ticket_payment"
    | "refund";
  needsReview: boolean;
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

export type PaymentsPage = { payments: Payment[]; meta: PageMeta };
export type MessagesPage = { messages: ContactMessage[]; meta: PageMeta };

export type GymPlan = {
  _id: string;
  name: string;
  durationDays: number;
  price: number;
  description: string;
  features: string[];
  featured: boolean;
  subtitle?: string;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
};

export type GymSubscriptionStatus = "pending" | "paid" | "active" | "expired";

export type CreateGymSubscriptionBody = {
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  planId: string;
};

export type CreateGymSubscriptionResponse = {
  subscription: {
    subscriptionRef: string;
    planName: string;
    durationDays: number;
    price: number;
  };
  paymentLink: string;
};

export type GymSubscription = {
  _id: string;
  subscriptionRef: string;
  planId: string;
  planName: string;
  durationDays: number;
  price: number;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  status: GymSubscriptionStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
};

export type CreateGymPlanBody = {
  name: string;
  durationDays: number;
  price: number;
  description: string;
  features?: string[];
  featured?: boolean;
  subtitle?: string;
  sortOrder?: number;
};

export type UpdateGymPlanBody = Partial<CreateGymPlanBody> & { visible?: boolean };

export type GymSubscriptionsPage = {
  subscriptions: GymSubscription[];
  meta: PageMeta;
};

export type LeaderboardEntry = {
  player: string;
  score: number;
};

export type LeaderboardBoard = {
  subtitle: string;
  entries: LeaderboardEntry[];
};

export type Leaderboard = {
  sixFrame: LeaderboardBoard;
  tenFrame: LeaderboardBoard;
};

export type LeaderboardBoardSlug = "six-frame" | "ten-frame";

export type UpdateLeaderboardBoardBody = LeaderboardBoard;
