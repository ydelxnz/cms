import api from './api';
import { User, ClientProfile } from '../types';

export const userService = {
  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  // 获取所有用户（管理员专用）
  getAllUsers: async (role?: string): Promise<User[]> => {
    const params = role ? { role } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  // 获取所有摄影师
  getPhotographers: async (): Promise<User[]> => {
    const response = await api.get('/photographers');
    return response.data;
  },
  
  // 获取单个摄影师详细信息
  getPhotographerById: async (id: string): Promise<User> => {
    const response = await api.get(`/photographers/${id}`);
    return response.data;
  },
  
  // 获取单个用户
  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  // 获取客户资料详情
  getUserProfile: async (id: string): Promise<ClientProfile> => {
    const response = await api.get(`/users/${id}/profile`);
    return response.data;
  },
  
  // 创建用户
  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  // 更新用户
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  // 删除用户
  deleteUser: async (id: string): Promise<boolean> => {
    await api.delete(`/users/${id}`);
    return true;
  },
  
  // 获取所有用户
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      throw new Error(error.response?.data?.error || '获取用户列表失败');
    }
  }
};

export default userService; 