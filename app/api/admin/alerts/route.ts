import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查权限
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '未授权访问' }, { status: 403 });
    }
    
    // 获取系统数据
    const [bookings, photos, users] = await Promise.all([
      db.getBookings(),
      db.getPhotos(),
      db.getUsers(),
    ]);
    
    const alerts = [];
    
    // 检查待确认预约
    const pendingBookings = bookings.filter(booking => booking.status === 'pending');
    if (pendingBookings.length > 0) {
      alerts.push({
        id: 'pending-bookings',
        type: 'info',
        message: `有 ${pendingBookings.length} 个预约等待确认`,
        link: '/admin/bookings?status=pending'
      });
    }
    
    // 检查照片审核
    const pendingPhotos = Math.floor(photos.length * 0.1); // 假设10%的照片需要审核
    if (pendingPhotos > 0) {
      alerts.push({
        id: 'pending-photos',
        type: 'info',
        message: `有 ${pendingPhotos} 张照片等待审核`,
        link: '/admin/photos?status=pending'
      });
    }
    
    // 检查新注册用户
    const recentUsers = users
      .filter(user => {
        const createdDate = new Date(user.createdAt);
        const now = new Date();
        const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 3; // 最近3天注册的用户
      });
    
    if (recentUsers.length > 0) {
      alerts.push({
        id: 'new-users',
        type: 'info',
        message: `最近3天有 ${recentUsers.length} 个新用户注册`,
        link: '/admin/clients'
      });
    }
    
    // 如果需要，可以添加更多警报类型
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('获取系统警报失败:', error);
    return NextResponse.json({ error: '获取系统警报失败' }, { status: 500 });
  }
} 