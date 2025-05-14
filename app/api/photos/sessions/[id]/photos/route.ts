import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Photo } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] 开始获取会话照片, 会话ID: ${params.id}`);
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[API] 获取会话照片失败: 认证失败');
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    const sessionId = params.id;
    if (!sessionId) {
      console.log('[API] 获取会话照片失败: 会话ID为空');
      return NextResponse.json(
        { error: "会话ID不能为空" },
        { status: 400 }
      );
    }
    
    // 获取预约信息
    const booking = await db.getBookingById(sessionId);
    if (!booking) {
      console.log(`[API] 获取会话照片失败: 未找到会话, ID: ${sessionId}`);
      return NextResponse.json(
        { error: "未找到会话信息" },
        { status: 404 }
      );
    }
    
    console.log(`[API] 找到会话: ${booking.id}, 客户: ${booking.clientId}, 摄影师: ${booking.photographerId}`);
    
    // 权限检查
    const isAuthorized = 
      session.user.role === "admin" || 
      (session.user.role === "photographer" && booking.photographerId === session.user.id) ||
      (session.user.role === "client" && booking.clientId === session.user.id);
    
    if (!isAuthorized) {
      console.log(`[API] 获取会话照片失败: 无权访问, 用户: ${session.user.id}, 角色: ${session.user.role}`);
      return NextResponse.json(
        { error: "无权访问此会话的照片" },
        { status: 403 }
      );
    }
    
    try {
      // 获取所有照片
      console.log(`[API] 尝试获取照片数据`);
      const allPhotos = await db.getPhotos();
      
      if (!Array.isArray(allPhotos)) {
        console.error(`[API] 照片数据不是数组: ${typeof allPhotos}`);
        return NextResponse.json(
          { error: "获取照片数据格式错误" },
          { status: 500 }
        );
      }
      
      console.log(`[API] 获取到照片总数: ${allPhotos.length}`);
      
      // 筛选属于该会话的照片
      // 方法1: 通过bookingId直接关联
      let sessionPhotos = allPhotos.filter(photo => (photo as any).bookingId === sessionId);
      
      // 方法2: 如果方法1没有结果，则通过客户ID和摄影师ID关联（兼容旧数据）
      if (sessionPhotos.length === 0) {
        console.log(`[API] 通过bookingId未找到照片，尝试使用客户ID和摄影师ID筛选`);
        sessionPhotos = allPhotos.filter(
          photo => photo.clientId === booking.clientId && 
                  photo.uploadedBy === booking.photographerId
        );
      }
      
      console.log(`[API] 筛选后的照片数量: ${sessionPhotos.length}`);
      
      // 处理照片数据，添加完整URL和其他信息
      const processedPhotos = sessionPhotos.map(photo => {
        // 使用类型断言，确保TypeScript知道这些字段存在
        const typedPhoto = photo as Photo & {
          bookingId?: string;
        };
        
        // 确保文件名存在
        const fileName = typedPhoto.fileName || (typedPhoto.filePath ? typedPhoto.filePath.split('/').pop() : '');
        
        // 构建URL（确保始终有值）
        const url = typedPhoto.filePath || `/uploads/photos/${fileName}`;
        const thumbnailUrl = typedPhoto.thumbnailPath || `/uploads/thumbnails/thumb_${fileName}`;
        
        return {
          id: typedPhoto.id,
          title: typedPhoto.title || `照片_${typedPhoto.id.substring(0, 6)}`,
          description: typedPhoto.description || '',
          fileName: fileName,
          category: typedPhoto.tags?.[0] || '普通照片',
          url: url,                    // 使用url作为属性名而不是filePath
          thumbnailUrl: thumbnailUrl,  // 使用thumbnailUrl作为属性名而不是thumbnailPath
          createdAt: typedPhoto.createdAt,
          uploadedBy: typedPhoto.uploadedBy,
          isApproved: typedPhoto.isApproved ?? true,  // 使用可选链和空值合并运算符
          bookingId: typedPhoto.bookingId || sessionId
        };
      });
      
      console.log(`[API] 成功处理照片数据, 返回照片数量: ${processedPhotos.length}`);
      return NextResponse.json(processedPhotos);
    } catch (error) {
      console.error("获取照片数据时发生错误:", error);
      return NextResponse.json(
        { error: "处理照片数据时发生错误" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching session photos:", error);
    return NextResponse.json(
      { error: "获取会话照片失败" },
      { status: 500 }
    );
  }
} 