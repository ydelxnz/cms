import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 检查权限
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: '未授权访问' }, { status: 403 });
    }
    
    // 获取查询参数
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);
    
    // 获取所有预约
    const bookings = await db.getBookings();
    const users = await db.getUsers();
    
    // 查找客户和摄影师名称的函数
    const findUserName = (userId: string) => {
      const user = users.find(u => u.id === userId);
      return user ? user.name : '未知用户';
    };
    
    // 按创建时间排序并限制数量
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(booking => ({
        id: booking.id,
        clientId: booking.clientId,
        clientName: findUserName(booking.clientId),
        photographerId: booking.photographerId,
        photographerName: findUserName(booking.photographerId),
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        type: booking.type,
        location: booking.location,
        status: booking.status,
        createdAt: booking.createdAt
      }));
    
    return NextResponse.json(recentBookings);
  } catch (error) {
    console.error('获取最近预约失败:', error);
    return NextResponse.json({ error: '获取预约数据失败' }, { status: 500 });
  }
} 