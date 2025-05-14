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
    const [bookings, orders, users] = await Promise.all([
      db.getBookings(),
      db.getOrders(),
      db.getUsers(),
    ]);
    
    // 获取过去6个月的数据
    const months = [];
    const bookingsData = [];
    const revenueData = [];
    const clientsData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // 添加月份标签
      months.push(`${year}-${month + 1}`);
      
      // 计算当月预约数
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.getFullYear() === year && bookingDate.getMonth() === month;
      }).length;
      bookingsData.push(monthBookings);
      
      // 计算当月收入
      const monthRevenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getFullYear() === year && orderDate.getMonth() === month;
        })
        .reduce((sum, order) => sum + order.totalAmount, 0);
      revenueData.push(monthRevenue);
      
      // 计算当月新增客户
      const monthClients = users
        .filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate.getFullYear() === year && userDate.getMonth() === month && user.role === 'client';
        }).length;
      clientsData.push(monthClients);
    }
    
    return NextResponse.json({
      labels: months,
      bookings: bookingsData,
      revenue: revenueData,
      clients: clientsData
    });
  } catch (error) {
    console.error('获取图表数据失败:', error);
    return NextResponse.json({ error: '获取图表数据失败' }, { status: 500 });
  }
} 