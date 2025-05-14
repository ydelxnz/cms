// User Types
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "client" | "photographer" | "admin";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Client specific types
export interface Client extends User {
  role: "client";
  bookings: Booking[];
  photoSessions: PhotoSession[];
}

// Photographer specific types
export interface Photographer extends User {
  role: "photographer";
  bio: string;
  specialties: string[];
  portfolio: PortfolioItem[];
  availability: Availability[];
  rating: number;
  reviews: Review[];
}

export interface PortfolioItem {
  id: string;
  photographerId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export interface Availability {
  id: string;
  photographerId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

// Booking and Session types
export interface Booking {
  id: string;
  clientId: string;
  clientName?: string;
  photographerId: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  type?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoSession {
  id: string;
  bookingId: string;
  clientId: string;
  photographerId: string;
  date: string;
  location: string;
  notes: string;
  status: "scheduled" | "in-progress" | "completed";
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}

// Photo Album type
export interface PhotoAlbum {
  id: string;
  name: string;
  photographerId: string;
  clientId?: string;
  clientName?: string;
  type: string;
  date: string;
  coverPhotoUrl?: string;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  sessionId: string;
  albumId?: string;
  name?: string;
  url: string;
  thumbnailUrl: string;
  title?: string;
  category?: string;
  isApproved: boolean;
  createdAt: string;
  size?: number;
}

// Review types
export interface Review {
  id: string;
  clientId: string;
  photographerId: string;
  sessionId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Print Order types
export interface PrintOrder {
  id: string;
  clientId: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: PrintOrderItem[];
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "refunded";
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrintOrderItem {
  id: string;
  orderId: string;
  photoId: string;
  productType: "print" | "album" | "canvas" | "frame";
  quantity: number;
  size: string;
  price: number;
  options?: Record<string, any>;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "booking" | "photo" | "order" | "system";
  isRead: boolean;
  createdAt: string;
}

// Admin specific types
export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  entityType: "user" | "booking" | "photo" | "order";
  entityId: string;
  details: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: "client";
}

// Next-auth extended types
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    name: string;
    phone: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      name: string;
      phone: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    name: string;
    phone: string;
  }
}

// 客户资料
export interface ClientProfile {
  id: string;
  name: string;
  email?: string;
  profile?: {
    phone?: string;
    address?: string;
    avatar?: string;
  }
}
