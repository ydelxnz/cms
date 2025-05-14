import api from './api';

export interface LogRecord {
  id: string;
  timestamp: string;
  type: string;
  module: string;
  userId: string;
  userName: string;
  description: string;
  ip: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface LogStats {
  total: number;
  system: number;
  security: number;
  user: number;
  error: number;
}

export interface LogFilter {
  type?: string;
  module?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const logService = {
  // 获取日志列表（仅管理员可用）
  getLogs: async (filters: LogFilter = {}): Promise<{ logs: LogRecord[], stats: LogStats }> => {
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.module) params.append('module', filters.module);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      const queryString = params.toString();
      const url = `/admin/logs${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('获取日志失败:', error);
      
      // 如果是403错误，说明用户无权访问
      if (error.response && error.response.status === 403) {
        throw new Error('无权访问日志数据');
      }
      
      // 默认错误
      throw new Error('获取日志数据失败，请稍后再试');
    }
  },
  
  // 创建新日志（可由任何已登录用户调用）
  createLog: async (data: {
    type: "system" | "security" | "user" | "error";
    module: string;
    description: string;
    details?: Record<string, any>;
  }): Promise<LogRecord> => {
    try {
      const response = await api.post('/admin/logs', data);
      return response.data.log;
    } catch (error) {
      console.error('创建日志失败:', error);
      throw new Error('无法记录操作日志');
    }
  },
  
  // 记录系统日志（简化版）
  logSystem: async (module: string, description: string, details?: Record<string, any>): Promise<void> => {
    try {
      await logService.createLog({
        type: 'system',
        module,
        description,
        details
      });
    } catch (error) {
      console.error('记录系统日志失败:', error);
      // 静默失败，不影响主流程
    }
  },
  
  // 记录安全日志（简化版）
  logSecurity: async (module: string, description: string, details?: Record<string, any>): Promise<void> => {
    try {
      await logService.createLog({
        type: 'security',
        module,
        description,
        details
      });
    } catch (error) {
      console.error('记录安全日志失败:', error);
      // 静默失败，不影响主流程
    }
  },
  
  // 记录用户操作日志（简化版）
  logUserAction: async (module: string, description: string, details?: Record<string, any>): Promise<void> => {
    try {
      await logService.createLog({
        type: 'user',
        module,
        description,
        details
      });
    } catch (error) {
      console.error('记录用户操作日志失败:', error);
      // 静默失败，不影响主流程
    }
  },
  
  // 记录错误日志（简化版）
  logError: async (module: string, description: string, details?: Record<string, any>): Promise<void> => {
    try {
      await logService.createLog({
        type: 'error',
        module,
        description,
        details
      });
    } catch (error) {
      console.error('记录错误日志失败:', error);
      // 静默失败，不影响主流程
    }
  },
  
  // 清除所有日志（仅管理员可用）
  clearLogs: async (): Promise<boolean> => {
    try {
      const response = await api.delete('/admin/logs');
      return response.data.success;
    } catch (error) {
      console.error('清除日志失败:', error);
      throw new Error('清除日志失败，请稍后再试');
    }
  },
  
  // 删除单个日志（仅管理员可用）
  deleteLog: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/admin/logs?id=${id}`);
      return response.data.success;
    } catch (error) {
      console.error('删除日志失败:', error);
      throw new Error('删除日志失败，请稍后再试');
    }
  }
};

export default logService; 