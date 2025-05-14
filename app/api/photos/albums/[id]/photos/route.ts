import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] 开始获取相册照片, 相册ID: ${params.id}`);
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[API] 获取相册照片失败: 认证失败');
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    console.log(`[API] 用户角色: ${session.user.role}, 用户ID: ${session.user.id}`);
    
    const albumId = params.id;
    if (!albumId) {
      console.log('[API] 获取相册照片失败: 相册ID为空');
      return NextResponse.json(
        { error: "相册ID不能为空" },
        { status: 400 }
      );
    }
    
    // 先尝试获取新系统的相册
    console.log(`[API] 尝试获取相册信息, ID: ${albumId}`);
    const album = await db.getPhotoAlbumById(albumId);
    
    // 如果没找到相册，再尝试通过预约系统获取（兼容旧系统）
    let booking = null;
    if (!album) {
      console.log(`[API] 未找到相册，尝试通过预约系统获取, ID: ${albumId}`);
      booking = await db.getBookingById(albumId);
      if (!booking) {
        console.log(`[API] 获取相册照片失败: 未找到相册/预约信息, ID: ${albumId}`);
        return NextResponse.json(
          { error: "未找到相册信息" },
          { status: 404 }
        );
      }
      console.log(`[API] 通过预约找到相册, ID: ${booking.id}, 类型: ${booking.type}`);
    } else {
      console.log(`[API] 找到相册, ID: ${album.id}, 名称: ${album.name}`);
    }
    
    // 权限检查
    let isAuthorized = false;
    if (album) {
      isAuthorized = 
        session.user.role === "admin" || 
        (session.user.role === "photographer" && album.photographerId === session.user.id);
    } else if (booking) {
      isAuthorized = 
        session.user.role === "admin" || 
        (session.user.role === "photographer" && booking.photographerId === session.user.id) ||
        (session.user.role === "client" && booking.clientId === session.user.id);
    }
      
    if (!isAuthorized) {
      console.log(`[API] 获取相册照片失败: 无权访问, 用户角色: ${session.user.role}, 用户ID: ${session.user.id}`);
      return NextResponse.json(
        { error: "无权访问此相册" },
        { status: 403 }
      );
    }
    
    try {
      // 获取所有照片
      console.log(`[API] 尝试获取所有照片数据`);
      const allPhotos = await db.getPhotos();
      console.log(`[API] 获取到照片总数: ${allPhotos.length}`);
      
      if (!Array.isArray(allPhotos)) {
        console.error(`[API] 照片数据不是数组: ${typeof allPhotos}`);
        return NextResponse.json(
          { error: "获取照片数据格式错误" },
          { status: 500 }
        );
      }
      
      // 筛选属于该相册的照片
      let albumPhotos = [];
      if (album) {
        // 新系统：通过相册ID直接关联
        console.log(`[API] 通过相册ID筛选照片, 相册ID: ${album.id}`);
        albumPhotos = allPhotos.filter(
          photo => photo && photo.albumId === album.id
        );
      } else if (booking) {
        // 旧系统：通过客户ID和摄影师ID关联
        console.log(`[API] 通过客户和摄影师ID筛选照片, 客户ID: ${booking.clientId}, 摄影师ID: ${booking.photographerId}`);
        albumPhotos = allPhotos.filter(
          photo => photo && photo.clientId === booking.clientId && 
                  photo.uploadedBy === booking.photographerId
        );
      }
      
      console.log(`[API] 筛选后的照片数量: ${albumPhotos.length}`);
      
      // 处理照片数据，添加更多信息
      const processedPhotos = albumPhotos.map(photo => {
        // 确保照片对象有效
        if (!photo || typeof photo !== 'object') {
          console.error(`[API] 无效的照片对象: ${photo}`);
          return null;
        }
        
        try {
          return {
            id: photo.id,
            name: photo.title || `照片_${photo.id.substring(6, 12)}`,
            albumId: album ? album.id : booking.id,
            sessionId: album ? album.id : booking.id,
            url: photo.filePath || photo.url,
            thumbnailUrl: photo.thumbnailPath || photo.thumbnailUrl,
            title: photo.title,
            category: photo.category || photo.metadata?.category || '普通',
            isApproved: photo.isApproved !== undefined ? photo.isApproved : true,
            createdAt: photo.createdAt,
            size: photo.size || photo.metadata?.size || 0
          };
        } catch (photoError) {
          console.error(`[API] 处理照片数据时出错:`, photoError);
          return null;
        }
      }).filter(Boolean); // 过滤掉处理失败的照片
      
      console.log(`[API] 成功处理照片数据, 返回照片数量: ${processedPhotos.length}`);
      return NextResponse.json(processedPhotos);
    } catch (dataError) {
      console.error("[API] 处理照片数据时发生错误:", dataError);
      return NextResponse.json(
        { error: "处理照片数据时发生错误" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching album photos:", error);
    
    // 返回更详细的错误信息
    let errorMessage = "获取相册照片失败";
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error("[API] 错误详情:", error.stack);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 