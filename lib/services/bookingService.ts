import api from './api';
import { Booking } from '../types';

export const bookingService = {
  // 获取所有预约（管理员）
  getAllBookings: async (params?: any): Promise<Booking[]> => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },
  
  // 获取客户的预约
  getClientBookings: async (params?: any): Promise<Booking[]> => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },
  
  // 获取摄影师的预约
  getPhotographerBookings: async (params?: any): Promise<Booking[]> => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },
  
  // 获取单个预约
  getBookingById: async (id: string): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  
  // 创建预约
  createBooking: async (bookingData: Partial<Booking>): Promise<Booking> => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  
  // 更新预约
  updateBooking: async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },
  
  // 更新预约状态
  updateBookingStatus: async (id: string, data: { status: string, notes?: string }): Promise<Booking> => {
    try {
      console.log(`[Service] 开始请求更新预约状态, ID: ${id}, 数据:`, data);
      
      const response = await api.patch(`/bookings/${id}/status`, data);
      
      console.log(`[Service] 预约状态更新成功:`, response.data);
      
      // 检查响应中是否包含booking对象
      if (response.data && response.data.booking) {
        return response.data.booking;
      } else {
        console.error('[Service] API响应中缺少booking数据');
        throw new Error('API响应格式错误，无法获取更新后的预约数据');
      }
    } catch (error: any) {
      console.error(`[Service] 更新预约状态失败:`, error);
      
      // 提取更具体的错误信息
      let errorMessage = '更新预约状态失败';
      
      if (error.response) {
        // 服务器返回了错误状态码
        console.error(`[Service] API错误状态码: ${error.response.status}`);
        console.error(`[Service] API错误数据:`, error.response.data);
        
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = `服务器错误 (${error.response.status})`;
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        console.error(`[Service] 没有收到API响应`);
        errorMessage = '无法连接到服务器，请检查网络连接';
      } else {
        // 请求设置时出错
        console.error(`[Service] 请求错误:`, error.message);
        errorMessage = error.message || '请求发送失败';
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // 取消预约
  cancelBooking: async (id: string, reason: string): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },
  
  // 确认预约
  confirmBooking: async (id: string): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/confirm`);
    return response.data;
  },
  
  // 完成预约
  completeBooking: async (id: string): Promise<Booking> => {
    const response = await api.post(`/bookings/${id}/complete`);
    return response.data;
  }
};

export default bookingService; 