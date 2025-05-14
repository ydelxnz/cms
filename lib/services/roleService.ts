import api from './api';

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const roleService = {
  // 获取所有角色
  getRoles: async (withUserCount: boolean = true): Promise<Role[]> => {
    try {
      const response = await api.get(`/roles?withUserCount=${withUserCount}`);
      return response.data;
    } catch (error) {
      console.error('获取角色列表失败:', error);
      throw new Error('获取角色数据失败');
    }
  },

  // 获取单个角色
  getRole: async (id: string): Promise<Role> => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取角色详情失败:', error);
      throw new Error('获取角色数据失败');
    }
  },

  // 创建角色
  createRole: async (data: { name: string; description?: string; permissions: string[] }): Promise<Role> => {
    try {
      const response = await api.post('/roles', data);
      return response.data.role;
    } catch (error: any) {
      console.error('创建角色失败:', error);
      throw new Error(error.response?.data?.error || '创建角色失败');
    }
  },

  // 更新角色
  updateRole: async (id: string, data: { name: string; description?: string; permissions: string[] }): Promise<Role> => {
    try {
      const response = await api.patch('/roles', {
        id,
        ...data
      });
      return response.data.role;
    } catch (error: any) {
      console.error('更新角色失败:', error);
      throw new Error(error.response?.data?.error || '更新角色失败');
    }
  },

  // 删除角色
  deleteRole: async (id: string): Promise<void> => {
    try {
      await api.delete(`/roles?id=${id}`);
    } catch (error: any) {
      console.error('删除角色失败:', error);
      throw new Error(error.response?.data?.error || '删除角色失败');
    }
  },

  // 分配角色给用户
  assignRoleToUser: async (userId: string, roleId: string): Promise<any> => {
    try {
      const response = await api.patch(`/users/${userId}/role`, {
        roleId
      });
      return response.data.user;
    } catch (error: any) {
      console.error('分配角色失败:', error);
      throw new Error(error.response?.data?.error || '分配角色失败');
    }
  }
};

export default roleService; 