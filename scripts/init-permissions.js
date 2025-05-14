const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const ROLES_FILE = path.join(DATA_DIR, 'roles.json');
const PERMISSIONS_FILE = path.join(DATA_DIR, 'permissions.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('创建数据目录:', DATA_DIR);
}

// 预定义权限
const predefinedPermissions = [
  { id: 'clients.view', name: '查看客户' },
  { id: 'clients.create', name: '创建客户' },
  { id: 'clients.edit', name: '编辑客户' },
  { id: 'clients.delete', name: '删除客户' },
  
  { id: 'photographers.view', name: '查看摄影师' },
  { id: 'photographers.create', name: '添加摄影师' },
  { id: 'photographers.edit', name: '编辑摄影师' },
  { id: 'photographers.delete', name: '删除摄影师' },
  { id: 'photographers.assign', name: '分配任务' },
  
  { id: 'bookings.view', name: '查看所有预约' },
  { id: 'bookings.view.own', name: '查看自己的预约' },
  { id: 'bookings.create', name: '创建预约' },
  { id: 'bookings.edit', name: '编辑预约' },
  { id: 'bookings.cancel', name: '取消预约' },
  
  { id: 'photos.view', name: '查看所有照片' },
  { id: 'photos.view.own', name: '查看自己的照片' },
  { id: 'photos.upload', name: '上传照片' },
  { id: 'photos.upload.own', name: '上传自己的照片' },
  { id: 'photos.edit', name: '编辑照片信息' },
  { id: 'photos.edit.own', name: '编辑自己的照片信息' },
  { id: 'photos.delete', name: '删除照片' },
  
  { id: 'orders.view', name: '查看订单' },
  { id: 'orders.create', name: '创建订单' },
  { id: 'orders.edit', name: '编辑订单' },
  { id: 'orders.cancel', name: '取消订单' },
  { id: 'orders.refund', name: '退款处理' },
  
  { id: 'reports.view', name: '查看报表' },
  { id: 'reports.export', name: '导出报表' },
  
  { id: 'system.users', name: '用户管理' },
  { id: 'system.roles', name: '角色管理' },
  { id: 'system.logs', name: '查看日志' },
  
  { id: 'all', name: '所有权限' },
].map(permission => ({
  ...permission,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

// 预定义角色
const predefinedRoles = [
  {
    id: 'role_admin',
    name: '管理员',
    description: '系统管理员，拥有所有权限',
    permissions: ['all'],
  },
  {
    id: 'role_manager',
    name: '经理',
    description: '业务经理，可以管理大部分业务功能',
    permissions: [
      'clients.view',
      'clients.create',
      'clients.edit',
      'photographers.view',
      'photographers.assign',
      'bookings.view',
      'bookings.create',
      'bookings.edit',
      'photos.view',
      'photos.upload',
      'photos.edit',
      'orders.view',
      'orders.create',
      'orders.edit',
      'reports.view',
    ],
  },
  {
    id: 'role_photographer',
    name: '摄影师',
    description: '摄影师，只能管理自己的预约和照片',
    permissions: [
      'bookings.view.own',
      'photos.view.own',
      'photos.upload.own',
      'photos.edit.own',
      'clients.view',
    ],
  },
  {
    id: 'role_client',
    name: '客户',
    description: '客户用户，可以查看自己的照片和预约',
    permissions: [
      'bookings.view.own',
      'photos.view.own',
    ],
  },
].map(role => ({
  ...role,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

// 初始化权限文件
if (!fs.existsSync(PERMISSIONS_FILE)) {
  fs.writeFileSync(PERMISSIONS_FILE, JSON.stringify(predefinedPermissions, null, 2));
  console.log('创建权限文件:', PERMISSIONS_FILE);
} else {
  console.log('权限文件已存在，跳过初始化');
}

// 初始化角色文件
if (!fs.existsSync(ROLES_FILE)) {
  fs.writeFileSync(ROLES_FILE, JSON.stringify(predefinedRoles, null, 2));
  console.log('创建角色文件:', ROLES_FILE);
} else {
  console.log('角色文件已存在，跳过初始化');
}

console.log('权限和角色初始化完成！'); 