import api from './api';
import { PrintOrder } from '../types';

export const orderService = {
  // 获取所有订单（管理员）
  getAllOrders: async (params?: any): Promise<PrintOrder[]> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  // 获取客户的订单
  getClientOrders: async (clientId: string): Promise<PrintOrder[]> => {
    const response = await api.get('/orders', { params: { clientId } });
    return response.data;
  },
  
  // 获取单个订单
  getOrderById: async (id: string): Promise<PrintOrder> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  // 创建订单
  createOrder: async (orderData: Partial<PrintOrder>): Promise<PrintOrder> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  // 更新订单
  updateOrder: async (id: string, orderData: Partial<PrintOrder>): Promise<PrintOrder> => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },
  
  // 取消订单
  cancelOrder: async (id: string, reason: string): Promise<PrintOrder> => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
  
  // 支付订单
  payOrder: async (id: string, paymentMethod: string): Promise<PrintOrder> => {
    const response = await api.post(`/orders/${id}/pay`, { paymentMethod });
    return response.data;
  },
  
  // 更新订单状态
  updateOrderStatus: async (id: string, status: string): Promise<PrintOrder> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  }
};

export default orderService; 