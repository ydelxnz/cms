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
    
    // 获取所有用户和预约
    const users = await db.getUsers();
    const bookings = await db.getBookings();
    
    // 计算每个客户的预约次数
    const bookingCounts = bookings.reduce((counts, booking) => {
      counts[booking.clientId] = (counts[booking.clientId] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    // 过滤客户并按创建时间排序
    const clients = users
      .filter(user => user.role === 'client')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.profile?.phone || '未设置',
        createdAt: client.createdAt,
        bookingsCount: bookingCounts[client.id] || 0
      }));
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error('获取最近客户失败:', error);
    return NextResponse.json({ error: '获取客户数据失败' }, { status: 500 });
  }
} 