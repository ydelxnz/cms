import api from './api';

export interface DashboardStats {
  totalClients: number;
  totalPhotographers: number;
  totalBookings: number;
  totalPhotos: number;
  totalOrders: number;
  revenue: number;
  activeClients: number;
  completedSessions: number;
  pendingApprovals: number;
}

export interface ChartData {
  bookings: number[];
  revenue: number[];
  clients: number[];
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  link: string;
}

export const adminService = {
  // 获取仪表盘统计数据
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  // 获取最近注册的客户
  getRecentClients: async (limit: number = 5): Promise<any[]> => {
    const response = await api.get('/admin/clients/recent', { params: { limit } });
    return response.data;
  },
  
  // 获取最近的预约
  getRecentBookings: async (limit: number = 5): Promise<any[]> => {
    const response = await api.get('/admin/bookings/recent', { params: { limit } });
    return response.data;
  },
  
  // 获取最近的订单
  getRecentOrders: async (limit: number = 5): Promise<any[]> => {
    const response = await api.get('/admin/orders/recent', { params: { limit } });
    return response.data;
  },
  
  // 获取系统警报
  getAlerts: async (): Promise<Alert[]> => {
    const response = await api.get('/admin/alerts');
    return response.data;
  },
  
  // 获取图表数据
  getChartData: async (): Promise<ChartData> => {
    const response = await api.get('/admin/chart-data');
    return response.data;
  },
  
  // 获取系统日志
  getLogs: async (page: number = 1, limit: number = 20): Promise<any> => {
    const response = await api.get('/admin/logs', { params: { page, limit } });
    return response.data;
  },
  
  // 获取待审核的照片
  getPendingPhotos: async (page: number = 1, limit: number = 20): Promise<any> => {
    const response = await api.get('/admin/photos/pending', { params: { page, limit } });
    return response.data;
  },
  
  // 审核照片
  approvePhoto: async (photoId: string, isApproved: boolean): Promise<any> => {
    const response = await api.put(`/admin/photos/${photoId}/approve`, { isApproved });
    return response.data;
  }
};

export default adminService; 