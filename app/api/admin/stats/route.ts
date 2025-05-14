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
    
    // 获取统计数据
    // 在实际应用中，这些数据应该从数据库中获取
    const [
      totalClients,
      totalPhotographers,
      totalBookings,
      totalPhotos,
      activeClients,
      completedSessions,
      pendingApprovals,
      totalOrders,
      revenue
    ] = await Promise.all([
      db.countClients(),
      db.countPhotographers(),
      db.countBookings(),
      db.countPhotos(),
      db.countActiveClients(),
      db.countCompletedSessions(),
      db.countPendingPhotoApprovals(),
      db.countOrders(),
      db.calculateTotalRevenue()
    ]);
    
    return NextResponse.json({
      totalClients,
      totalPhotographers,
      totalBookings,
      totalPhotos,
      totalOrders,
      revenue,
      activeClients,
      completedSessions,
      pendingApprovals
    });
  } catch (error) {
    console.error('获取仪表盘统计数据失败:', error);
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
} 