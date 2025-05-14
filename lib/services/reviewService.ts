import api from './api';
import { Review } from '../types';

export const reviewService = {
  // 获取所有评价
  getAllReviews: async (params?: any): Promise<Review[]> => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },
  
  // 获取摄影师的评价
  getPhotographerReviews: async (photographerId: string): Promise<Review[]> => {
    const response = await api.get('/reviews', { params: { photographerId } });
    return response.data;
  },
  
  // 获取客户的评价
  getClientReviews: async (clientId: string): Promise<Review[]> => {
    const response = await api.get('/reviews', { params: { clientId } });
    return response.data;
  },
  
  // 获取单个评价
  getReviewById: async (id: string): Promise<Review> => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },
  
  // 创建评价
  createReview: async (reviewData: Partial<Review>): Promise<Review> => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
  
  // 更新评价
  updateReview: async (id: string, reviewData: Partial<Review>): Promise<Review> => {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data;
  },
  
  // 删除评价
  deleteReview: async (id: string): Promise<boolean> => {
    await api.delete(`/reviews/${id}`);
    return true;
  }
};

export default reviewService; 