// API服务基础类
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// 扩展Axios请求配置类型，添加meta属性
interface AxiosRequestConfigWithMeta extends InternalAxiosRequestConfig {
  meta?: {
    requestStartedAt?: number;
    [key: string]: any;
  };
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // 默认超时时间
  timeout: 20000,
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use((config: AxiosRequestConfigWithMeta) => {
  // 这里可以添加token等认证信息
  console.log(`[API请求] ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
  
  // 添加请求开始时间
  config.meta = { ...(config.meta || {}), requestStartedAt: new Date().getTime() };
  return config;
}, (error) => {
  console.error('[API请求错误]', error);
  return Promise.reject(error);
});

// 响应拦截器 - 处理错误
api.interceptors.response.use((response: AxiosResponse) => {
  // 计算请求耗时
  const config = response.config as AxiosRequestConfigWithMeta;
  const requestStartedAt = config.meta?.requestStartedAt;
  if (requestStartedAt) {
    const requestTime = new Date().getTime() - requestStartedAt;
    console.log(`[API响应] ${response.status} ${config.url} - 耗时: ${requestTime}ms`);
  } else {
    console.log(`[API响应] ${response.status} ${config.url}`);
  }
  
  // 检查返回数据格式
  if (response.data === undefined) {
    console.warn('[API警告] 响应数据为undefined', config.url);
  }
  
  return response;
}, (error) => {
  // 处理错误响应
  if (error.response) {
    // 服务器返回错误状态码
    console.error(`[API错误] 状态码: ${error.response.status}, URL: ${error.config?.url}`);
    
    if (error.response.data) {
      console.error('[API错误] 响应数据:', error.response.data);
    }
    
    // 处理401未授权错误
    if (error.response.status === 401) {
      // 可以在这里处理登出逻辑
      console.error('[API错误] 认证失败, 需要登录');
    }
    
    // 处理404错误
    if (error.response.status === 404) {
      console.error('[API错误] 资源不存在');
    }
    
    // 处理500错误
    if (error.response.status >= 500) {
      console.error('[API错误] 服务器内部错误');
    }
  } else if (error.request) {
    // 请求已经发出，但没有收到响应
    console.error('[API错误] 未收到响应:', error.request);
    console.error('[API错误] 请求URL:', error.config?.url);
    
    // 检查是否超时
    if (error.code === 'ECONNABORTED') {
      console.error('[API错误] 请求超时');
    }
  } else {
    // 发送请求时出现问题
    console.error('[API错误] 请求异常:', error.message);
  }
  
  // 添加错误信息，方便调试
  error.friendlyMessage = getFriendlyErrorMessage(error);
  
  return Promise.reject(error);
});

// 获取友好的错误信息
const getFriendlyErrorMessage = (error: any): string => {
  if (error.response) {
    // 服务器返回了错误状态
    if (error.response.data && error.response.data.error) {
      return error.response.data.error;
    }
    
    // 根据状态码返回友好信息
    switch (error.response.status) {
      case 400: return '请求参数错误';
      case 401: return '未授权，请重新登录';
      case 403: return '无权访问该资源';
      case 404: return '请求的资源不存在';
      case 500: return '服务器内部错误';
      default: return `服务器响应错误 (${error.response.status})`;
    }
  } else if (error.request) {
    // 请求发送成功，但没有收到响应
    if (error.code === 'ECONNABORTED') {
      return '请求超时，请检查网络连接并重试';
    }
    return '服务器无响应，请稍后重试';
  } else {
    // 请求设置触发的错误
    return error.message || '请求发送失败';
  }
};

// 通用fetch API函数
export const fetchApi = async (url: string, options: RequestInit = {}) => {
  console.log('Fetch API 请求:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    console.log('Fetch API 响应状态:', response.status);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Fetch API 错误:', error);
      throw new Error(error.message || `请求失败: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Fetch API 异常:', error);
    throw error;
  }
};

export default api;

// 通知相关API
export const getNotifications = async (unreadOnly = false) => {
  const url = unreadOnly 
    ? '/api/notifications?unreadOnly=true'
    : '/api/notifications';
  return fetchApi(url);
};

// 管理员获取所有通知
export const getAllNotifications = async (filters: {
  userId?: string;
  type?: string;
  status?: string;
  sortOrder?: 'asc' | 'desc';
} = {}) => {
  // 构建查询参数
  const params = new URLSearchParams();
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  
  const queryString = params.toString();
  const url = `/api/admin/notifications${queryString ? `?${queryString}` : ''}`;
  
  return fetchApi(url);
};

// 管理员批量删除通知
export const bulkDeleteNotifications = async (
  options: {
    notificationIds?: string[];
    filters?: {
      userId?: string;
      type?: string;
      status?: string;
    };
  }
) => {
  return fetchApi('/api/admin/notifications/delete', {
    method: 'POST',
    body: JSON.stringify(options),
  });
};

export const markNotificationAsRead = async (id: string) => {
  return fetchApi(`/api/notifications/${id}`, {
    method: 'PATCH',
  });
};

export const markAllNotificationsAsRead = async () => {
  return fetchApi('/api/notifications', {
    method: 'PATCH',
  });
};

export const deleteNotification = async (id: string) => {
  return fetchApi(`/api/notifications/${id}`, {
    method: 'DELETE',
  });
};

export const deleteAllNotifications = async () => {
  return fetchApi('/api/notifications', {
    method: 'DELETE',
  });
};

export const createNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type: "booking" | "photo" | "order" | "system";
}) => {
  return fetchApi('/api/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// 照片相关API
export const getPhotosByAdmin = async (filters: {
  photographerId?: string;
  clientId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  sortField?: string;
  sortOrder?: string;
} = {}) => {
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
  
  return fetchApi(url);
}; 