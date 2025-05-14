import api from './api';
import { PhotoSession, PhotoAlbum } from '../types';
import { fetchApi } from './api';

// 自定义Photo类型
export interface Photo {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  thumbnailPath: string;
  uploadedBy: string;
  photographerName?: string;
  clientId?: string;
  clientName?: string;
  tags: string[];
  status: "pending" | "approved" | "archived";
  createdAt: string;
  updatedAt: string;
  metadata?: {
    dimensions?: string;
    size?: string;
  };
}

export interface PhotoStats {
  total: number;
  pending: number;
  approved: number;
  archived: number;
  photographers: number;
  clients: number;
}

// 估计FormData的大小（仅供参考，不精确）
const estimateFormDataSize = (formData: FormData): number => {
  let size = 0;
  
  for (const pair of formData.entries()) {
    const value = pair[1];
    
    if (value instanceof File) {
      size += value.size;
    } else if (typeof value === 'string') {
      size += value.length;
    }
  }
  
  return size;
};

export const photoService = {
  // 获取所有照片会话
  getAllPhotoSessions: async (params?: any): Promise<PhotoSession[]> => {
    const response = await api.get('/photos/sessions', { params });
    return response.data;
  },
  
  // 获取客户的照片会话
  getClientPhotoSessions: async (clientId: string): Promise<PhotoSession[]> => {
    const response = await api.get(`/photos/sessions`, { params: { clientId } });
    return response.data;
  },
  
  // 获取摄影师的照片会话
  getPhotographerPhotoSessions: async (photographerId: string): Promise<PhotoSession[]> => {
    const response = await api.get(`/photos/sessions`, { params: { photographerId } });
    return response.data;
  },
  
  // 获取单个照片会话
  getPhotoSessionById: async (id: string): Promise<PhotoSession> => {
    const response = await api.get(`/photos/sessions/${id}`);
    return response.data;
  },
  
  // 创建照片会话
  createPhotoSession: async (sessionData: Partial<PhotoSession>): Promise<PhotoSession> => {
    const response = await api.post('/photos/sessions', sessionData);
    return response.data;
  },
  
  // 更新照片会话
  updatePhotoSession: async (id: string, sessionData: Partial<PhotoSession>): Promise<PhotoSession> => {
    const response = await api.put(`/photos/sessions/${id}`, sessionData);
    return response.data;
  },
  
  // 获取照片会话中的所有照片
  getPhotosBySessionId: async (sessionId: string): Promise<Photo[]> => {
    try {
      console.log(`[PhotoService] 开始获取会话照片, 会话ID: ${sessionId}`);
      
      const response = await api.get(`/photos/sessions/${sessionId}/photos`, {
        // 增加超时时间，避免网络不稳定导致请求失败
        timeout: 30000,
      });
      
      console.log(`[PhotoService] 获取会话照片成功, 状态码: ${response.status}, 照片数量: ${response.data?.length || 0}`);
      
      // 验证响应数据是否为数组
      if (!Array.isArray(response.data)) {
        console.error(`[PhotoService] 获取会话照片返回的数据不是数组: ${typeof response.data}`);
        throw new Error('照片数据格式错误，请刷新页面重试');
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`[PhotoService] 获取会话照片失败:`, error);
      
      let errorMessage = '获取照片数据失败';
      
      if (error.response) {
        // 服务器返回错误
        console.error(`[PhotoService] 服务器错误状态: ${error.response.status}`);
        console.error('[PhotoService] 服务器错误数据:', error.response.data);
        
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        console.error('[PhotoService] 未收到服务器响应');
        errorMessage = '服务器无响应，请检查网络连接';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = '请求超时，请稍后再试';
        }
      } else {
        // 发送请求前出错
        console.error('[PhotoService] 请求错误:', error.message);
        errorMessage = error.message || '请求发送失败';
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // 相册管理 - 获取摄影师的所有相册
  getPhotoAlbums: async (params?: any): Promise<PhotoAlbum[]> => {
    const response = await api.get('/photos/albums', { params });
    return response.data;
  },
  
  // 获取单个相册信息
  getPhotoAlbumById: async (id: string): Promise<PhotoAlbum> => {
    const response = await api.get(`/photos/albums/${id}`);
    return response.data;
  },
  
  // 获取相册中的所有照片
  getPhotosByAlbum: async (albumId: string): Promise<Photo[]> => {
    try {
      console.log(`[PhotoService] 开始获取相册照片, 相册ID: ${albumId}`);
      
      const response = await api.get(`/photos/albums/${albumId}/photos`, {
        // 增加超时时间，避免网络不稳定导致请求失败
        timeout: 30000,
      });
      
      console.log(`[PhotoService] 获取相册照片成功, 状态码: ${response.status}, 照片数量: ${response.data?.length || 0}`);
      
      // 验证响应数据是否为数组
      if (!Array.isArray(response.data)) {
        console.error(`[PhotoService] 获取相册照片返回的数据不是数组: ${typeof response.data}`);
        throw new Error('照片数据格式错误，请刷新页面重试');
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`[PhotoService] 获取相册照片失败:`, error);
      
      let errorMessage = '获取照片数据失败';
      
      if (error.response) {
        // 服务器返回错误
        console.error(`[PhotoService] 服务器错误状态: ${error.response.status}`);
        console.error('[PhotoService] 服务器错误数据:', error.response.data);
        
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        console.error('[PhotoService] 未收到服务器响应');
        errorMessage = '服务器无响应，请检查网络连接';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = '请求超时，请稍后再试';
        }
      } else {
        // 发送请求前出错
        console.error('[PhotoService] 请求错误:', error.message);
        errorMessage = error.message || '请求发送失败';
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // 创建相册
  createPhotoAlbum: async (albumData: Partial<PhotoAlbum>): Promise<PhotoAlbum> => {
    const response = await api.post('/photos/albums', albumData);
    return response.data;
  },
  
  // 更新相册信息
  updatePhotoAlbum: async (id: string, albumData: Partial<PhotoAlbum>): Promise<PhotoAlbum> => {
    const response = await api.put(`/photos/albums/${id}`, albumData);
    return response.data;
  },
  
  // 删除相册
  deletePhotoAlbum: async (id: string): Promise<boolean> => {
    await api.delete(`/photos/albums/${id}`);
    return true;
  },
  
  // 上传照片
  uploadPhotos: async (sessionId: string, formData: FormData, onProgress?: (progress: number) => void): Promise<Photo[]> => {
    try {
      console.log(`[PhotoService] 开始上传照片到会话: ${sessionId}`);
      console.log(`[PhotoService] 表单数据大小: 约 ${Math.round(estimateFormDataSize(formData) / 1024)} KB`);
      
      // 确保formData中包含bookingId
      if (!formData.has('bookingId')) {
        formData.append('bookingId', sessionId);
      }
      
      const response = await api.post(`/photos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`[PhotoService] 上传进度: ${progress}%`);
            onProgress(progress);
          }
        },
        // 增加超时时间，照片上传可能需要更长时间
        timeout: 60000, // 60秒
      });
      
      console.log(`[PhotoService] 上传成功，响应状态: ${response.status}`);
      return response.data.photos || [];
    } catch (error: any) {
      console.error('[PhotoService] 上传照片失败:', error);
      
      // 提取更详细的错误信息
      let errorMessage = '上传照片失败';
      
      if (error.response) {
        // 服务器返回错误
        console.error(`[PhotoService] 服务器错误状态: ${error.response.status}`);
        console.error('[PhotoService] 服务器错误数据:', error.response.data);
        
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        console.error('[PhotoService] 未收到服务器响应');
        errorMessage = '服务器无响应，请检查网络连接';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = '上传超时，请尝试上传较小的文件或检查网络连接';
        }
      } else {
        // 发送请求前出错
        console.error('[PhotoService] 请求错误:', error.message);
        errorMessage = error.message || '请求发送失败';
      }
      
      throw new Error(errorMessage);
    }
  },
  
  // 上传照片到相册
  uploadPhotosToAlbum: async (albumId: string, formData: FormData, onProgress?: (progress: number) => void): Promise<Photo[]> => {
    const response = await api.post(`/photos/albums/${albumId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },
  
  // 更新照片信息
  updatePhoto: async (id: string, photoData: Partial<Photo>): Promise<Photo> => {
    const response = await api.put(`/photos/${id}`, photoData);
    return response.data;
  },
  
  // 删除照片
  deletePhoto: async (id: string): Promise<boolean> => {
    await api.delete(`/photos/${id}`);
    return true;
  },
  
  // 批量删除照片
  deletePhotos: async (ids: string[]): Promise<boolean> => {
    await api.post(`/photos/delete-batch`, { ids });
    return true;
  },
  
  // 批量更新照片
  updatePhotos: async (ids: string[], photoData: Partial<Photo>): Promise<Photo[]> => {
    const response = await api.put(`/photos/update-batch`, { ids, ...photoData });
    return response.data;
  }
};

export default photoService;

export interface PhotoFilterOptions {
  photographerId?: string;
  clientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

// 管理员获取所有照片（支持高级筛选）
export const getAdminPhotos = async (
  filters: PhotoFilterOptions = {}
): Promise<{ photos: Photo[], stats: PhotoStats }> => {
  try {
    // 构建查询参数
    const params = new URLSearchParams();
    if (filters.photographerId) params.append('photographerId', filters.photographerId);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters.sortField) params.append('sortField', filters.sortField);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const queryString = params.toString();
    const url = `/api/admin/photos${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetchApi(url);
    return response;
  } catch (error) {
    console.error('获取管理员照片列表失败:', error);
    return {
      photos: [],
      stats: {
        total: 0,
        pending: 0, 
        approved: 0,
        archived: 0,
        photographers: 0,
        clients: 0
      }
    };
  }
};

// 管理员批量更新照片状态
export const bulkUpdatePhotoStatus = async (
  options: {
    photoIds?: string[];
    status: "pending" | "approved" | "archived";
    filters?: PhotoFilterOptions;
  }
): Promise<{ updatedCount: number }> => {
  try {
    const response = await fetchApi('/api/admin/photos/bulk', {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateStatus',
        ...options
      }),
    });
    return response;
  } catch (error) {
    console.error('批量更新照片状态失败:', error);
    return { updatedCount: 0 };
  }
};

// 管理员批量删除照片
export const bulkDeletePhotos = async (
  options: {
    photoIds?: string[];
    filters?: PhotoFilterOptions;
  }
): Promise<{ deletedCount: number }> => {
  try {
    const response = await fetchApi('/api/admin/photos/bulk', {
      method: 'POST',
      body: JSON.stringify({
        action: 'delete',
        ...options
      }),
    });
    return response;
  } catch (error) {
    console.error('批量删除照片失败:', error);
    return { deletedCount: 0 };
  }
};

// 获取单张照片详情
export const getPhotoById = async (id: string): Promise<Photo | null> => {
  try {
    const response = await fetchApi(`/api/photos/${id}`);
    return response;
  } catch (error) {
    console.error(`获取照片详情失败, ID: ${id}:`, error);
    return null;
  }
};

// 更新照片信息
export const updatePhoto = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    clientId?: string;
    tags?: string[];
    status?: "pending" | "approved" | "archived";
  }
): Promise<Photo | null> => {
  try {
    const response = await fetchApi(`/api/photos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.photo;
  } catch (error) {
    console.error(`更新照片失败, ID: ${id}:`, error);
    return null;
  }
};

// 删除单张照片
export const deletePhoto = async (id: string): Promise<boolean> => {
  try {
    await fetchApi(`/api/photos/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`删除照片失败, ID: ${id}:`, error);
    return false;
  }
}; 