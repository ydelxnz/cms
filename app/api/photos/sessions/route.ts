import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// 获取照片会话列表
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const photographerId = searchParams.get("photographerId");
    const clientId = searchParams.get("clientId");
    
    // 获取所有预约和照片
    const bookings = await db.getBookings();
    const photos = await db.getPhotos();
    
    // 根据角色和查询参数过滤预约
    let filteredBookings = bookings;
    
    if (session.user.role === "admin") {
      if (photographerId) {
        filteredBookings = bookings.filter(booking => booking.photographerId === photographerId);
      } else if (clientId) {
        filteredBookings = bookings.filter(booking => booking.clientId === clientId);
      }
    } else if (session.user.role === "photographer") {
      filteredBookings = bookings.filter(booking => booking.photographerId === session.user.id);
    } else if (session.user.role === "client") {
      filteredBookings = bookings.filter(booking => booking.clientId === session.user.id);
    }
    
    // 只保留已完成的预约
    filteredBookings = filteredBookings.filter(booking => booking.status === "completed");
    
    // 将预约转换为照片会话格式
    const photoSessions = filteredBookings.map(booking => {
      // 查找与该预约相关的照片
      const sessionPhotos = photos.filter(photo => photo.clientId === booking.clientId && 
                                                  photo.uploadedBy === booking.photographerId);
      
      // 创建照片会话对象
      return {
        id: booking.id,
        clientId: booking.clientId,
        photographerId: booking.photographerId,
        date: booking.date,
        type: booking.type,
        status: booking.status,
        location: booking.location,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        photos: sessionPhotos.map(photo => {
          // 确保文件名存在
          const fileName = photo.fileName || (photo.filePath ? photo.filePath.split('/').pop() : '');
          
          // 构建URL（确保始终有值）
          const url = photo.filePath || `/uploads/photos/${fileName}`;
          const thumbnailUrl = photo.thumbnailPath || `/uploads/thumbnails/thumb_${fileName}`;
          
          return {
            id: photo.id,
            title: photo.title || `照片_${photo.id.substring(0, 6)}`,
            description: photo.description || '',
            thumbnailUrl: thumbnailUrl,
            url: url,
            uploadedAt: photo.createdAt
          };
        })
      };
    });
    
    // 按日期降序排序
    photoSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json(photoSessions);
  } catch (error) {
    console.error("Error fetching photo sessions:", error);
    return NextResponse.json(
      { error: "获取照片会话数据失败" },
      { status: 500 }
    );
  }
} 