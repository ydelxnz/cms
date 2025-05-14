import fs from 'fs';
import path from 'path';

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const ROLES_FILE = path.join(DATA_DIR, 'roles.json');
const PERMISSIONS_FILE = path.join(DATA_DIR, 'permissions.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const ALBUMS_FILE = path.join(DATA_DIR, 'albums.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 初始化文件（如果不存在）
function initializeFile(filePath: string, initialData: any = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

// 初始化所有数据文件
initializeFile(USERS_FILE, []);
initializeFile(PHOTOS_FILE, []);
initializeFile(BOOKINGS_FILE, []);
initializeFile(ORDERS_FILE, []);
initializeFile(REVIEWS_FILE, []);
initializeFile(LOGS_FILE, []);
initializeFile(ROLES_FILE, []);
initializeFile(PERMISSIONS_FILE, []);
initializeFile(NOTIFICATIONS_FILE, []);
initializeFile(ALBUMS_FILE, []);

// 通用数据访问函数
export async function readData<T>(filePath: string): Promise<T[]> {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

export async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    throw new Error(`Failed to write data to ${path.basename(filePath)}`);
  }
}

// 用户相关函数
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // 存储的是哈希后的密码
  role: 'admin' | 'photographer' | 'client';
  createdAt: string;
  updatedAt: string;
  profile?: Record<string, any>;
}

export async function getUsers(): Promise<User[]> {
  return readData<User>(USERS_FILE);
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.email === email) || null;
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const users = await getUsers();
  
  // 检查邮箱是否已存在
  if (users.some(user => user.email === userData.email)) {
    throw new Error('Email already exists');
  }
  
  const now = new Date().toISOString();
  const newUser: User = {
    id: `user_${Date.now()}`,
    ...userData,
    createdAt: now,
    updatedAt: now,
  };
  
  users.push(newUser);
  await writeData<User>(USERS_FILE, users);
  
  return newUser;
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  const users = await getUsers();
  const index = users.findIndex(user => user.id === id);
  
  if (index === -1) return null;
  
  // 更新用户数据
  const updatedUser: User = {
    ...users[index],
    ...userData,
    updatedAt: new Date().toISOString(),
  };
  
  users[index] = updatedUser;
  await writeData<User>(USERS_FILE, users);
  
  return updatedUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  const filtered = users.filter(user => user.id !== id);
  
  if (filtered.length === users.length) return false;
  
  await writeData<User>(USERS_FILE, filtered);
  return true;
}

// 照片相关函数
export interface Photo {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  thumbnailPath: string;
  uploadedBy: string; // 摄影师ID
  clientId?: string; // 关联的客户ID
  tags: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export async function getPhotos(): Promise<Photo[]> {
  try {
    console.log('[DB] 尝试读取所有照片数据');
    const data = await readData<Photo>(PHOTOS_FILE);
    
    // 验证返回的数据
    if (!Array.isArray(data)) {
      console.error('[DB] 照片数据不是数组:', typeof data);
      return [];
    }
    
    console.log(`[DB] 成功读取照片数据, 总数: ${data.length}`);
    return data;
  } catch (error) {
    console.error('[DB] 读取照片数据失败:', error);
    // 发生错误时返回空数组，而不是抛出异常，避免级联故障
    return [];
  }
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  try {
    console.log(`[DB] 尝试获取照片, ID: ${id}`);
    const photos = await getPhotos();
    const photo = photos.find(photo => photo.id === id) || null;
    
    if (!photo) {
      console.log(`[DB] 未找到照片, ID: ${id}`);
    } else {
      console.log(`[DB] 成功获取照片, ID: ${id}`);
    }
    
    return photo;
  } catch (error) {
    console.error(`[DB] 获取照片失败, ID: ${id}:`, error);
    return null;
  }
}

export async function getPhotosByPhotographer(photographerId: string): Promise<Photo[]> {
  try {
    console.log(`[DB] 尝试获取摄影师的照片, 摄影师ID: ${photographerId}`);
    const photos = await getPhotos();
    const filteredPhotos = photos.filter(photo => photo.uploadedBy === photographerId);
    console.log(`[DB] 成功获取摄影师照片, 摄影师ID: ${photographerId}, 照片数量: ${filteredPhotos.length}`);
    return filteredPhotos;
  } catch (error) {
    console.error(`[DB] 获取摄影师照片失败, 摄影师ID: ${photographerId}:`, error);
    return [];
  }
}

export async function getPhotosByClient(clientId: string): Promise<Photo[]> {
  try {
    console.log(`[DB] 尝试获取客户的照片, 客户ID: ${clientId}`);
    const photos = await getPhotos();
    const filteredPhotos = photos.filter(photo => photo.clientId === clientId);
    console.log(`[DB] 成功获取客户照片, 客户ID: ${clientId}, 照片数量: ${filteredPhotos.length}`);
    return filteredPhotos;
  } catch (error) {
    console.error(`[DB] 获取客户照片失败, 客户ID: ${clientId}:`, error);
    return [];
  }
}

export async function createPhoto(photoData: Omit<Photo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Photo> {
  const photos = await getPhotos();
  
  const now = new Date().toISOString();
  const newPhoto: Photo = {
    id: `photo_${Date.now()}`,
    ...photoData,
    createdAt: now,
    updatedAt: now,
  };
  
  photos.push(newPhoto);
  await writeData<Photo>(PHOTOS_FILE, photos);
  
  return newPhoto;
}

export async function updatePhoto(id: string, photoData: Partial<Photo>): Promise<Photo | null> {
  const photos = await getPhotos();
  const index = photos.findIndex(photo => photo.id === id);
  
  if (index === -1) return null;
  
  // 更新照片数据
  const updatedPhoto: Photo = {
    ...photos[index],
    ...photoData,
    updatedAt: new Date().toISOString(),
  };
  
  photos[index] = updatedPhoto;
  await writeData<Photo>(PHOTOS_FILE, photos);
  
  return updatedPhoto;
}

export async function deletePhoto(id: string): Promise<boolean> {
  const photos = await getPhotos();
  const filtered = photos.filter(photo => photo.id !== id);
  
  if (filtered.length === photos.length) return false;
  
  await writeData<Photo>(PHOTOS_FILE, filtered);
  return true;
}

// 相册相关函数
export interface PhotoAlbum {
  id: string;
  name: string;
  photographerId: string;
  clientName: string;
  type: string;
  date: string;
  coverPhotoUrl: string | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function getPhotoAlbums(): Promise<PhotoAlbum[]> {
  try {
    console.log('[DB] 尝试读取所有相册数据');
    const data = await readData<PhotoAlbum>(ALBUMS_FILE);
    
    // 验证返回的数据
    if (!Array.isArray(data)) {
      console.error('[DB] 相册数据不是数组:', typeof data);
      return [];
    }
    
    console.log(`[DB] 成功读取相册数据, 总数: ${data.length}`);
    return data;
  } catch (error) {
    console.error('[DB] 读取相册数据失败:', error);
    // 发生错误时返回空数组，而不是抛出异常，避免级联故障
    return [];
  }
}

export async function getPhotoAlbumById(id: string): Promise<PhotoAlbum | null> {
  try {
    console.log(`[DB] 尝试获取相册, ID: ${id}`);
    const albums = await getPhotoAlbums();
    const album = albums.find(album => album.id === id) || null;
    
    if (!album) {
      console.log(`[DB] 未找到相册, ID: ${id}`);
    } else {
      console.log(`[DB] 成功获取相册, ID: ${id}`);
    }
    
    return album;
  } catch (error) {
    console.error(`[DB] 获取相册失败, ID: ${id}:`, error);
    return null;
  }
}

export async function getPhotoAlbumsByPhotographer(photographerId: string): Promise<PhotoAlbum[]> {
  try {
    console.log(`[DB] 尝试获取摄影师的相册, 摄影师ID: ${photographerId}`);
    const albums = await getPhotoAlbums();
    const filteredAlbums = albums.filter(album => album.photographerId === photographerId);
    console.log(`[DB] 成功获取摄影师相册, 摄影师ID: ${photographerId}, 相册数量: ${filteredAlbums.length}`);
    return filteredAlbums;
  } catch (error) {
    console.error(`[DB] 获取摄影师相册失败, 摄影师ID: ${photographerId}:`, error);
    return [];
  }
}

export async function createPhotoAlbum(albumData: Omit<PhotoAlbum, 'id' | 'createdAt' | 'updatedAt'>): Promise<PhotoAlbum> {
  try {
    console.log('[DB] 尝试创建新相册');
    const albums = await getPhotoAlbums();
    
    const now = new Date().toISOString();
    const newAlbum: PhotoAlbum = {
      id: `album_${Date.now()}`,
      ...albumData,
      coverPhotoUrl: albumData.coverPhotoUrl || null,
      photoCount: albumData.photoCount || 0,
      createdAt: now,
      updatedAt: now,
    };
    
    albums.push(newAlbum);
    await writeData<PhotoAlbum>(ALBUMS_FILE, albums);
    
    console.log(`[DB] 成功创建相册, ID: ${newAlbum.id}`);
    return newAlbum;
  } catch (error) {
    console.error('[DB] 创建相册失败:', error);
    throw new Error('创建相册失败');
  }
}

export async function updatePhotoAlbum(id: string, albumData: Partial<PhotoAlbum>): Promise<PhotoAlbum | null> {
  try {
    console.log(`[DB] 尝试更新相册, ID: ${id}`);
    const albums = await getPhotoAlbums();
    const index = albums.findIndex(album => album.id === id);
    
    if (index === -1) {
      console.log(`[DB] 未找到要更新的相册, ID: ${id}`);
      return null;
    }
    
    // 更新相册数据
    const updatedAlbum: PhotoAlbum = {
      ...albums[index],
      ...albumData,
      updatedAt: new Date().toISOString(),
    };
    
    albums[index] = updatedAlbum;
    await writeData<PhotoAlbum>(ALBUMS_FILE, albums);
    
    console.log(`[DB] 成功更新相册, ID: ${id}`);
    return updatedAlbum;
  } catch (error) {
    console.error(`[DB] 更新相册失败, ID: ${id}:`, error);
    return null;
  }
}

export async function deletePhotoAlbum(id: string): Promise<boolean> {
  try {
    console.log(`[DB] 尝试删除相册, ID: ${id}`);
    const albums = await getPhotoAlbums();
    const filtered = albums.filter(album => album.id !== id);
    
    if (filtered.length === albums.length) {
      console.log(`[DB] 未找到要删除的相册, ID: ${id}`);
      return false;
    }
    
    await writeData<PhotoAlbum>(ALBUMS_FILE, filtered);
    console.log(`[DB] 成功删除相册, ID: ${id}`);
    return true;
  } catch (error) {
    console.error(`[DB] 删除相册失败, ID: ${id}:`, error);
    return false;
  }
}

// 预约相关函数
export interface Booking {
  id: string;
  clientId: string;
  photographerId: string;
  date: string; // ISO日期格式
  startTime: string; // 24小时制，如 "14:00"
  endTime: string;
  type: string; // 如 "婚纱照", "全家福" 等
  location?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getBookings(): Promise<Booking[]> {
  return readData<Booking>(BOOKINGS_FILE);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const bookings = await getBookings();
  return bookings.find(booking => booking.id === id) || null;
}

export async function getBookingsByClient(clientId: string): Promise<Booking[]> {
  const bookings = await getBookings();
  return bookings.filter(booking => booking.clientId === clientId);
}

export async function getBookingsByPhotographer(photographerId: string): Promise<Booking[]> {
  const bookings = await getBookings();
  return bookings.filter(booking => booking.photographerId === photographerId);
}

export async function createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
  const bookings = await getBookings();
  
  const now = new Date().toISOString();
  const newBooking: Booking = {
    id: `booking_${Date.now()}`,
    ...bookingData,
    createdAt: now,
    updatedAt: now,
  };
  
  bookings.push(newBooking);
  await writeData<Booking>(BOOKINGS_FILE, bookings);
  
  return newBooking;
}

export async function updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking | null> {
  const bookings = await getBookings();
  const index = bookings.findIndex(booking => booking.id === id);
  
  if (index === -1) return null;
  
  // 更新预约数据
  const updatedBooking: Booking = {
    ...bookings[index],
    ...bookingData,
    updatedAt: new Date().toISOString(),
  };
  
  bookings[index] = updatedBooking;
  await writeData<Booking>(BOOKINGS_FILE, bookings);
  
  return updatedBooking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const bookings = await getBookings();
  const filtered = bookings.filter(booking => booking.id !== id);
  
  if (filtered.length === bookings.length) return false;
  
  await writeData<Booking>(BOOKINGS_FILE, filtered);
  return true;
}

// 订单相关函数
export interface Order {
  id: string;
  clientId: string;
  bookingId?: string; // 关联的预约ID（可选）
  items: {
    type: string; // 如 "打印照片", "相册制作", "相框" 等
    photoIds?: string[]; // 关联的照片IDs
    quantity: number;
    unitPrice: number;
    description?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentMethod?: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  shippingAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getOrders(): Promise<Order[]> {
  return readData<Order>(ORDERS_FILE);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find(order => order.id === id) || null;
}

export async function getOrdersByClient(clientId: string): Promise<Order[]> {
  const orders = await getOrders();
  return orders.filter(order => order.clientId === clientId);
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const orders = await getOrders();
  
  const now = new Date().toISOString();
  const newOrder: Order = {
    id: `order_${Date.now()}`,
    ...orderData,
    createdAt: now,
    updatedAt: now,
  };
  
  orders.push(newOrder);
  await writeData<Order>(ORDERS_FILE, orders);
  
  return newOrder;
}

export async function updateOrder(id: string, orderData: Partial<Order>): Promise<Order | null> {
  const orders = await getOrders();
  const index = orders.findIndex(order => order.id === id);
  
  if (index === -1) return null;
  
  // 更新订单数据
  const updatedOrder: Order = {
    ...orders[index],
    ...orderData,
    updatedAt: new Date().toISOString(),
  };
  
  orders[index] = updatedOrder;
  await writeData<Order>(ORDERS_FILE, orders);
  
  return updatedOrder;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const orders = await getOrders();
  const filtered = orders.filter(order => order.id !== id);
  
  if (filtered.length === orders.length) return false;
  
  await writeData<Order>(ORDERS_FILE, filtered);
  return true;
}

// 评价相关函数
export interface Review {
  id: string;
  clientId: string;
  photographerId: string;
  bookingId?: string; // 关联的预约ID（可选）
  rating: number; // 1-5 星评分
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export async function getReviews(): Promise<Review[]> {
  return readData<Review>(REVIEWS_FILE);
}

export async function getReviewById(id: string): Promise<Review | null> {
  const reviews = await getReviews();
  return reviews.find(review => review.id === id) || null;
}

export async function getReviewsByClient(clientId: string): Promise<Review[]> {
  const reviews = await getReviews();
  return reviews.filter(review => review.clientId === clientId);
}

export async function getReviewsByPhotographer(photographerId: string): Promise<Review[]> {
  const reviews = await getReviews();
  return reviews.filter(review => review.photographerId === photographerId);
}

export async function createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
  const reviews = await getReviews();
  
  const now = new Date().toISOString();
  const newReview: Review = {
    id: `review_${Date.now()}`,
    ...reviewData,
    createdAt: now,
    updatedAt: now,
  };
  
  reviews.push(newReview);
  await writeData<Review>(REVIEWS_FILE, reviews);
  
  return newReview;
}

export async function updateReview(id: string, reviewData: Partial<Review>): Promise<Review | null> {
  const reviews = await getReviews();
  const index = reviews.findIndex(review => review.id === id);
  
  if (index === -1) return null;
  
  // 更新评价数据
  const updatedReview: Review = {
    ...reviews[index],
    ...reviewData,
    updatedAt: new Date().toISOString(),
  };
  
  reviews[index] = updatedReview;
  await writeData<Review>(REVIEWS_FILE, reviews);
  
  return updatedReview;
}

export async function deleteReview(id: string): Promise<boolean> {
  const reviews = await getReviews();
  const filtered = reviews.filter(review => review.id !== id);
  
  if (filtered.length === reviews.length) return false;
  
  await writeData<Review>(REVIEWS_FILE, filtered);
  return true;
}

// 日志相关函数
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

export async function getLogs(): Promise<LogRecord[]> {
  return readData<LogRecord>(LOGS_FILE);
}

export async function getLogById(id: string): Promise<LogRecord | null> {
  const logs = await getLogs();
  return logs.find(log => log.id === id) || null;
}

export async function getLogsByUser(userId: string): Promise<LogRecord[]> {
  const logs = await getLogs();
  return logs.filter(log => log.userId === userId);
}

export async function getLogsByType(type: string): Promise<LogRecord[]> {
  const logs = await getLogs();
  return logs.filter(log => log.type === type);
}

export async function getLogsByModule(module: string): Promise<LogRecord[]> {
  const logs = await getLogs();
  return logs.filter(log => log.module === module);
}

export async function getLogsByDateRange(startDate: string, endDate: string): Promise<LogRecord[]> {
  const logs = await getLogs();
  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return logDate >= start && logDate <= end;
  });
}

export async function createLog(logData: Omit<LogRecord, 'id' | 'createdAt'>): Promise<LogRecord> {
  const logs = await getLogs();
  
  const now = new Date().toISOString();
  const newLog: LogRecord = {
    id: `log_${Date.now()}`,
    ...logData,
    createdAt: now,
  };
  
  logs.push(newLog);
  await writeData<LogRecord>(LOGS_FILE, logs);
  
  return newLog;
}

export async function deleteLog(id: string): Promise<boolean> {
  const logs = await getLogs();
  const filtered = logs.filter(log => log.id !== id);
  
  if (filtered.length === logs.length) return false;
  
  await writeData<LogRecord>(LOGS_FILE, filtered);
  return true;
}

export async function clearLogs(): Promise<boolean> {
  try {
    await writeData<LogRecord>(LOGS_FILE, []);
    return true;
  } catch (error) {
    console.error('Error clearing logs:', error);
    return false;
  }
}

// 权限相关函数
export interface Permission {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // 权限ID列表
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // 权限ID列表
  createdAt: string;
  updatedAt: string;
}

export async function getPermissions(): Promise<Permission[]> {
  return readData<Permission>(PERMISSIONS_FILE);
}

export async function getPermissionById(id: string): Promise<Permission | null> {
  const permissions = await getPermissions();
  return permissions.find(permission => permission.id === id) || null;
}

export async function createPermission(permissionData: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
  const permissions = await getPermissions();
  
  const now = new Date().toISOString();
  const newPermission: Permission = {
    id: `permission_${Date.now()}`,
    ...permissionData,
    createdAt: now,
    updatedAt: now,
  };
  
  permissions.push(newPermission);
  await writeData<Permission>(PERMISSIONS_FILE, permissions);
  
  return newPermission;
}

export async function updatePermission(id: string, permissionData: Partial<Permission>): Promise<Permission | null> {
  const permissions = await getPermissions();
  const index = permissions.findIndex(permission => permission.id === id);
  
  if (index === -1) return null;
  
  const updatedPermission: Permission = {
    ...permissions[index],
    ...permissionData,
    updatedAt: new Date().toISOString(),
  };
  
  permissions[index] = updatedPermission;
  await writeData<Permission>(PERMISSIONS_FILE, permissions);
  
  return updatedPermission;
}

export async function deletePermission(id: string): Promise<boolean> {
  const permissions = await getPermissions();
  const filtered = permissions.filter(permission => permission.id !== id);
  
  if (filtered.length === permissions.length) return false;
  
  await writeData<Permission>(PERMISSIONS_FILE, filtered);
  return true;
}

export async function getRoles(): Promise<Role[]> {
  return readData<Role>(ROLES_FILE);
}

export async function getRoleById(id: string): Promise<Role | null> {
  const roles = await getRoles();
  return roles.find(role => role.id === id) || null;
}

export async function createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
  const roles = await getRoles();
  
  const now = new Date().toISOString();
  const newRole: Role = {
    id: `role_${Date.now()}`,
    ...roleData,
    createdAt: now,
    updatedAt: now,
  };
  
  roles.push(newRole);
  await writeData<Role>(ROLES_FILE, roles);
  
  return newRole;
}

export async function updateRole(id: string, roleData: Partial<Role>): Promise<Role | null> {
  const roles = await getRoles();
  const index = roles.findIndex(role => role.id === id);
  
  if (index === -1) return null;
  
  const updatedRole: Role = {
    ...roles[index],
    ...roleData,
    updatedAt: new Date().toISOString(),
  };
  
  roles[index] = updatedRole;
  await writeData<Role>(ROLES_FILE, roles);
  
  return updatedRole;
}

export async function deleteRole(id: string): Promise<boolean> {
  const roles = await getRoles();
  const filtered = roles.filter(role => role.id !== id);
  
  if (filtered.length === roles.length) return false;
  
  await writeData<Role>(ROLES_FILE, filtered);
  return true;
}

export async function getUsersWithRole(roleId: string): Promise<User[]> {
  const users = await getUsers();
  return users.filter(user => user.role === roleId);
}

export async function assignRoleToUser(userId: string, roleId: string): Promise<User | null> {
  return updateUser(userId, { role: roleId });
}

// 通知相关函数
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "booking" | "photo" | "order" | "system";
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  return readData<Notification>(NOTIFICATIONS_FILE);
}

export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  const notifications = await getNotifications();
  return notifications.filter(notification => notification.userId === userId);
}

export async function getUnreadNotificationsByUser(userId: string): Promise<Notification[]> {
  const notifications = await getNotificationsByUser(userId);
  return notifications.filter(notification => !notification.isRead);
}

export async function createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
  const notifications = await getNotifications();
  
  const now = new Date().toISOString();
  const newNotification: Notification = {
    id: `notification_${Date.now()}`,
    ...notificationData,
    isRead: false,
    createdAt: now,
  };
  
  notifications.push(newNotification);
  await writeData<Notification>(NOTIFICATIONS_FILE, notifications);
  
  return newNotification;
}

export async function markNotificationAsRead(id: string): Promise<Notification | null> {
  const notifications = await getNotifications();
  const index = notifications.findIndex(notification => notification.id === id);
  
  if (index === -1) return null;
  
  const updatedNotification: Notification = {
    ...notifications[index],
    isRead: true,
  };
  
  notifications[index] = updatedNotification;
  await writeData<Notification>(NOTIFICATIONS_FILE, notifications);
  
  return updatedNotification;
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const notifications = await getNotifications();
  let updated = false;
  
  const updatedNotifications = notifications.map(notification => {
    if (notification.userId === userId && !notification.isRead) {
      updated = true;
      return { ...notification, isRead: true };
    }
    return notification;
  });
  
  if (updated) {
    await writeData<Notification>(NOTIFICATIONS_FILE, updatedNotifications);
  }
  
  return updated;
}

export async function deleteNotification(id: string): Promise<boolean> {
  const notifications = await getNotifications();
  const filtered = notifications.filter(notification => notification.id !== id);
  
  if (filtered.length === notifications.length) return false;
  
  await writeData<Notification>(NOTIFICATIONS_FILE, filtered);
  return true;
}

export async function deleteAllNotifications(userId: string): Promise<boolean> {
  const notifications = await getNotifications();
  const filtered = notifications.filter(notification => notification.userId !== userId);
  
  if (filtered.length === notifications.length) return false;
  
  await writeData<Notification>(NOTIFICATIONS_FILE, filtered);
  return true;
}

// 仪表盘统计函数
export async function countClients(): Promise<number> {
  const users = await getUsers();
  return users.filter(user => user.role === 'client').length;
}

export async function countPhotographers(): Promise<number> {
  const users = await getUsers();
  return users.filter(user => user.role === 'photographer').length;
}

export async function countBookings(): Promise<number> {
  const bookings = await getBookings();
  return bookings.length;
}

export async function countPhotos(): Promise<number> {
  const photos = await getPhotos();
  return photos.length;
}

export async function countActiveClients(): Promise<number> {
  const bookings = await getBookings();
  const activeClientIds = new Set();
  
  // 获取过去30天内有预约的客户
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  bookings.forEach(booking => {
    const bookingDate = new Date(booking.date);
    if (bookingDate >= thirtyDaysAgo) {
      activeClientIds.add(booking.clientId);
    }
  });
  
  return activeClientIds.size;
}

export async function countCompletedSessions(): Promise<number> {
  const bookings = await getBookings();
  return bookings.filter(booking => booking.status === 'completed').length;
}

export async function countPendingPhotoApprovals(): Promise<number> {
  // 在实际应用中，照片可能有审核状态
  // 这里简化处理，假设最近上传的10%照片需要审核
  const photos = await getPhotos();
  return Math.floor(photos.length * 0.1);
}

export async function countOrders(): Promise<number> {
  const orders = await getOrders();
  return orders.length;
}

export async function calculateTotalRevenue(): Promise<number> {
  const orders = await getOrders();
  return orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
}

// 统一导出对象
export const db = {
  // 用户相关
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  
  // 照片相关
  getPhotos,
  getPhotoById,
  getPhotosByPhotographer,
  getPhotosByClient,
  createPhoto,
  updatePhoto,
  deletePhoto,
  
  // 相册相关
  getPhotoAlbums,
  getPhotoAlbumById,
  getPhotoAlbumsByPhotographer,
  createPhotoAlbum,
  updatePhotoAlbum,
  deletePhotoAlbum,
  
  // 预约相关
  getBookings,
  getBookingById,
  getBookingsByClient,
  getBookingsByPhotographer,
  createBooking,
  updateBooking,
  deleteBooking,
  
  // 订单相关
  getOrders,
  getOrderById,
  getOrdersByClient,
  createOrder,
  updateOrder,
  deleteOrder,
  
  // 评论相关
  getReviews,
  getReviewById,
  getReviewsByClient,
  getReviewsByPhotographer,
  createReview,
  updateReview,
  deleteReview,
  
  // 日志相关
  getLogs,
  getLogById,
  getLogsByUser,
  getLogsByType,
  getLogsByModule,
  getLogsByDateRange,
  createLog,
  deleteLog,
  clearLogs,
  
  // 权限相关
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getUsersWithRole,
  assignRoleToUser,
  
  // 通知相关
  getNotifications,
  getNotificationsByUser,
  getUnreadNotificationsByUser,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  
  // 仪表盘统计
  countClients,
  countPhotographers,
  countBookings,
  countPhotos,
  countActiveClients,
  countCompletedSessions,
  countPendingPhotoApprovals,
  countOrders,
  calculateTotalRevenue
}; 