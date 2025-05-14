export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'photographer' | 'client';
  createdAt: string;
  updatedAt: string;
  profile?: Record<string, any>;
}

export interface Photo {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  fileName?: string;
  filePath?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  url?: string;
  uploadedBy?: string; // 摄影师ID
  clientId?: string; // 关联的客户ID
  tags?: string[];
  category?: string;
  isApproved?: boolean;
  size?: number;
  createdAt: string;
  updatedAt?: string;
  albumId?: string;
  sessionId?: string;
  bookingId?: string; // 关联的预约ID
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    category?: string;
    [key: string]: any;
  };
}

export interface PhotoAlbum {
  id: string;
  name: string;
  photographerId: string;
  clientId?: string;
  clientName: string;
  type: string;
  date: string;
  coverPhotoUrl: string | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoSession {
  id: string;
  name: string;
  photographerId: string;
  clientId: string;
  date: string;
  type: string;
  location?: string; // 拍摄地点
  status: 'planned' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  photos?: Photo[]; // 会话中的照片
}

export interface Booking {
  id: string;
  clientId: string;
  clientName?: string;
  photographerId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  location?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 