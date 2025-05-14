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
    
    // 获取所有订单
    const orders = await db.getOrders();
    const users = await db.getUsers();
    
    // 查找客户名称的函数
    const findClientName = (clientId: string) => {
      const client = users.find(u => u.id === clientId);
      return client ? client.name : '未知客户';
    };
    
    // 按创建时间排序并限制数量
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(order => ({
        id: order.id,
        clientId: order.clientId,
        clientName: findClientName(order.clientId),
        bookingId: order.bookingId,
        type: order.items.length > 0 ? order.items[0].type : '未知类型',
        amount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }));
    
    return NextResponse.json(recentOrders);
  } catch (error) {
    console.error('获取最近订单失败:', error);
    return NextResponse.json({ error: '获取订单数据失败' }, { status: 500 });
  }
} 