import api from './api';
import { Photographer, PhotoSession, Booking } from '../types';

export const photographerService = {
  // 获取摄影师个人资料
  getPhotographerProfile: async (id: string): Promise<Photographer> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  // 更新摄影师个人资料
  updatePhotographerProfile: async (id: string, profileData: Partial<Photographer>): Promise<Photographer> => {
    const response = await api.patch(`/users/${id}`, profileData);
    return response.data.user;
  },
  
  // 获取摄影师拍摄记录（基于预约）
  getPhotographerSessions: async (photographerId: string): Promise<Booking[]> => {
    const response = await api.get(`/bookings`, { params: { photographerId } });
    return response.data;
  },
  
  // 创建拍摄记录
  createSession: async (sessionData: Partial<Booking>): Promise<Booking> => {
    const response = await api.post('/bookings', sessionData);
    return response.data;
  },
  
  // 更新拍摄记录
  updateSession: async (id: string, sessionData: Partial<Booking>): Promise<Booking> => {
    const response = await api.patch(`/bookings/${id}`, sessionData);
    return response.data;
  },
  
  // 获取摄影师的照片集
  getPhotographerPhotos: async (photographerId: string): Promise<any[]> => {
    const response = await api.get(`/photos`, { params: { photographerId } });
    return response.data;
  },
  
  // 获取摄影师的评价
  getPhotographerReviews: async (photographerId: string): Promise<any[]> => {
    const response = await api.get(`/reviews`, { params: { photographerId } });
    return response.data;
  }
};

export default photographerService; 