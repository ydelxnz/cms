import { NextRequest, NextResponse } from "next/server";
import { createPhoto, getBookingById, createNotification, getUserById } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

// 全局错误处理函数
const handleError = (error: any, context: string): { message: string, logged: boolean } => {
  console.error(`[API] 错误发生在 ${context}:`, error);
  
  let message = '未知错误';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    try {
      message = JSON.stringify(error);
    } catch (e) {
      message = '无法序列化的错误对象';
    }
  }
  
  return { message, logged: true };
};

// 为防止进程崩溃，在全局捕获未处理的异常和Promise拒绝
// 注意：在生产环境中更好的做法是使用进程管理器如PM2
if (typeof process !== 'undefined') {
  try {
    process.on('uncaughtException', (error) => {
      console.error('[全局] 未捕获的异常:', error);
      // 不退出进程，仅记录错误
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[全局] 未处理的Promise拒绝:', reason);
      // 不退出进程，仅记录错误
    });
  } catch (e) {
    console.error('[全局] 无法设置全局错误处理:', e);
  }
}

// 批量上传照片
export async function POST(request: NextRequest) {
  try {
    console.log('[API] 开始处理照片上传请求');
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    console.log('[API] 当前会话:', session ? `ID: ${session.user.id}, 角色: ${session.user.role}` : '无会话');
    
    if (!session) {
      console.log('[API] 认证失败，用户未登录');
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 只有摄影师和管理员可以上传照片
    if (session.user.role !== "photographer" && session.user.role !== "admin") {
      console.log(`[API] 用户角色 ${session.user.role} 没有权限上传照片`);
      return NextResponse.json(
        { error: "没有权限上传照片" },
        { status: 403 }
      );
    }
    
    // 处理表单数据
    try {
      const formData = await request.formData();
      console.log('[API] 已接收表单数据');
      
      const bookingId = formData.get("bookingId") as string;
      const metadataStr = formData.get("metadata") as string;
      
      if (!bookingId) {
        console.log('[API] 缺少预约ID参数');
        return NextResponse.json(
          { error: "缺少预约ID参数" },
          { status: 400 }
        );
      }
      
      if (!metadataStr) {
        console.log('[API] 缺少照片元数据参数');
        return NextResponse.json(
          { error: "缺少照片元数据" },
          { status: 400 }
        );
      }
      
      console.log(`[API] 上传请求参数: 预约ID=${bookingId}`);
      
      // 解析元数据
      let metadata;
      try {
        metadata = JSON.parse(metadataStr);
        console.log(`[API] 元数据解析成功，包含 ${metadata.length} 项`);
      } catch (parseError) {
        console.error('[API] 元数据JSON解析失败:', parseError);
        return NextResponse.json(
          { error: "照片元数据格式错误" },
          { status: 400 }
        );
      }
      
      // 验证预约是否存在
      try {
        const booking = await getBookingById(bookingId);
        
        if (!booking) {
          console.log(`[API] 预约ID ${bookingId} 不存在`);
          return NextResponse.json(
            { error: "预约记录不存在" },
            { status: 404 }
          );
        }
        
        console.log(`[API] 找到预约: ID=${booking.id}, 摄影师=${booking.photographerId}, 客户=${booking.clientId}`);
        
        // 验证当前用户是否为该预约的摄影师
        if (booking.photographerId !== session.user.id && session.user.role !== "admin") {
          console.log(`[API] 用户 ${session.user.id} 无权为预约 ${bookingId} 上传照片`);
          return NextResponse.json(
            { error: "没有权限为此预约上传照片" },
            { status: 403 }
          );
        }
        
        // 确保上传目录存在
        const uploadDir = path.join(process.cwd(), "public", "uploads", "photos");
        const thumbnailDir = path.join(process.cwd(), "public", "uploads", "thumbnails");
        
        console.log(`[API] 上传目录: ${uploadDir}`);
        console.log(`[API] 缩略图目录: ${thumbnailDir}`);
        
        try {
          if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
            console.log(`[API] 创建上传目录: ${uploadDir}`);
          }
          
          if (!existsSync(thumbnailDir)) {
            await mkdir(thumbnailDir, { recursive: true });
            console.log(`[API] 创建缩略图目录: ${thumbnailDir}`);
          }
        } catch (mkdirError) {
          console.error('[API] 创建目录失败:', mkdirError);
          return NextResponse.json(
            { error: "服务器存储配置错误" },
            { status: 500 }
          );
        }
        
        // 处理所有文件
        const uploadedPhotos = [];
        let successCount = 0;
        let failCount = 0;
        
        console.log(`[API] 开始处理 ${metadata.length} 个文件`);
        
        for (let i = 0; i < metadata.length; i++) {
          const metaItem = metadata[i];
          const file = formData.get(`file_${i}`);
          
          if (!file || !(file instanceof File)) {
            console.warn(`[API] 文件 file_${i} 不存在或不是有效的文件`);
            failCount++;
            continue;
          }
          
          try {
            // 验证文件类型
            const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
            if (!validTypes.includes(file.type)) {
              console.warn(`[API] 文件 ${file.name} 类型 ${file.type} 不受支持`);
              failCount++;
              continue;
            }
            
            // 生成随机文件名
            const fileId = uuidv4();
            const fileExtension = file.name.split(".").pop() || "jpg";
            const fileName = `${fileId}.${fileExtension}`;
            
            console.log(`[API] 处理文件 ${i+1}/${metadata.length}: ${file.name} (${file.size} 字节)`);
            
            // 保存原始文件
            const filePath = path.join(uploadDir, fileName);
            let fileBytes: ArrayBuffer; // 声明文件数据变量
            
            try {
              // 使用流式写入以减少内存使用
              console.log(`[API] 开始保存文件: ${filePath}`);
              
              // 首先检查文件大小，防止处理过大的文件
              if (file.size > 20 * 1024 * 1024) { // 20MB
                console.warn(`[API] 文件过大 (${Math.round(file.size/1024/1024)}MB)，跳过处理`);
                failCount++;
                continue;
              }
              
              // 获取文件字节数据
              fileBytes = await file.arrayBuffer().catch(error => {
                const { message } = handleError(error, `获取文件 ${file.name} 数据`);
                throw new Error(`读取文件数据失败: ${message}`);
              });
              
              // 写入文件
              await writeFile(filePath, Buffer.from(fileBytes)).catch(error => {
                const { message } = handleError(error, `写入文件 ${filePath}`);
                throw new Error(`写入文件失败: ${message}`);
              });
              
              console.log(`[API] 文件保存成功: ${filePath} (${Math.round(file.size/1024)}KB)`);
            } catch (fileError) {
              console.error(`[API] 保存文件失败:`, fileError);
              failCount++;
              continue;
            }
            
            // 生成缩略图
            const thumbnailName = `thumb_${fileId}.webp`;
            const thumbnailPath = path.join(thumbnailDir, thumbnailName);
            
            // 使用try-finally确保进程继续，即使缩略图生成失败
            let thumbnailCreated = false;
            try {
              console.log(`[API] 开始生成缩略图`);
              
              // 使用更安全的设置来处理图像
              const sharpInstance = sharp(Buffer.from(fileBytes), {
                limitInputPixels: 25000000, // 降低像素限制以节省内存
                failOnError: false // 忽略损坏图片错误
              });
              
              // 先获取图片信息，确保不处理过大的图片
              const imageInfo = await sharpInstance.metadata().catch(error => {
                console.error(`[API] 获取图片信息失败:`, error);
                return { width: 0, height: 0 } as any;
              });
              
              // 限制过大图片的处理
              if (imageInfo.width && imageInfo.height && 
                  (imageInfo.width > 5000 || imageInfo.height > 5000)) {
                console.warn(`[API] 图像尺寸过大: ${imageInfo.width}x${imageInfo.height}，将使用更简单的处理方式`);
                
                // 对于大图，使用更低的处理质量
                await sharpInstance
                  .resize(300, 300, {
                    fit: "cover", // 使用cover而不是inside以节省内存
                    withoutEnlargement: true
                  })
                  .webp({
                    quality: 60, // 降低质量
                    effort: 1,   // 最低压缩努力
                    alphaQuality: 50 // 降低透明通道质量
                  })
                  .toFile(thumbnailPath)
                  .catch(error => {
                    handleError(error, `处理大图缩略图 ${thumbnailPath}`);
                    throw new Error(`缩略图处理失败`);
                  });
              } else {
                // 对于普通尺寸图片的处理
                await sharpInstance
                  .resize(300, 300, {
                    fit: "inside",
                    withoutEnlargement: true
                  })
                  .webp({
                    quality: 70,
                    effort: 2
                  })
                  .toFile(thumbnailPath)
                  .catch(error => {
                    handleError(error, `生成缩略图 ${thumbnailPath}`);
                    throw new Error(`缩略图处理失败`);
                  });
              }
              
              thumbnailCreated = true;
              console.log(`[API] 缩略图生成成功: ${thumbnailPath}`);
            } catch (thumbError) {
              console.error(`[API] 缩略图生成错误:`, thumbError);
              
              // 尝试使用备选方案生成简单缩略图
              try {
                // 创建一个小型的默认缩略图
                console.log(`[API] 尝试创建默认缩略图: ${thumbnailPath}`);
                
                // 1x1 透明像素的webp格式base64数据（只有42字节）
                const defaultImageBase64 = 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
                const defaultImageBuffer = Buffer.from(defaultImageBase64, 'base64');
                
                await writeFile(thumbnailPath, defaultImageBuffer);
                console.log(`[API] 使用默认缩略图代替`);
                thumbnailCreated = true;
              } catch (fallbackError) {
                handleError(fallbackError, `创建默认缩略图 ${thumbnailPath}`);
                thumbnailCreated = false;
              }
            } finally {
              // 不管缩略图成功与否，继续数据库存储
              try {
                // 准备照片数据
                const photoData = {
                  title: metaItem.name || "未命名",
                  fileName,
                  filePath: `/uploads/photos/${fileName}`,
                  thumbnailPath: thumbnailCreated 
                    ? `/uploads/thumbnails/${thumbnailName}` 
                    : `/images/default-thumbnail.webp`, // 使用默认缩略图路径
                  uploadedBy: session.user.id,
                  clientId: booking.clientId,
                  bookingId: bookingId,
                  tags: [metaItem.category],
                };
                
                // 保存到数据库
                console.log(`[API] 开始保存照片数据到数据库`);
                const newPhoto = await createPhoto(photoData).catch(error => {
                  const { message } = handleError(error, `保存照片数据到数据库`);
                  throw new Error(`数据库操作失败: ${message}`);
                });
                
                console.log(`[API] 照片数据保存成功: ID=${newPhoto.id}`);
                uploadedPhotos.push(newPhoto);
                successCount++;
              } catch (dbError) {
                console.error(`[API] 数据库操作失败:`, dbError);
                failCount++;
              }
            }
          } catch (fileProcessError) {
            console.error(`[API] 处理文件 ${i} 时发生错误:`, fileProcessError);
            failCount++;
          }
        }
        
        // 照片上传完成后，发送通知给客户
        if (successCount > 0) {
          try {
            // 获取摄影师信息
            const photographer = await getUserById(session.user.id);
            const photographerName = photographer?.name || "您的摄影师";
            
            // 向客户发送通知
            await createNotification({
              userId: booking.clientId,
              title: "新照片已上传",
              message: `${photographerName}已为您上传了${successCount}张新照片，请前往"我的照片"查看。`,
              type: "photo"
            });
            
            console.log(`[API] 成功向客户 ${booking.clientId} 发送照片上传通知`);
          } catch (notificationError) {
            console.error('[API] 发送通知失败:', notificationError);
            // 通知发送失败不影响上传结果
          }
        }

        // 最后返回结果
        console.log(`[API] 照片上传完成: 成功=${successCount}, 失败=${failCount}`);
        return NextResponse.json({
          message: `成功上传${successCount}张照片，失败${failCount}张`,
          photos: uploadedPhotos
        }, { status: successCount > 0 ? 200 : 500 });
        
      } catch (bookingError) {
        const { message } = handleError(bookingError, "验证预约信息");
        return NextResponse.json(
          { error: `验证预约失败: ${message}` },
          { status: 500 }
        );
      }
    } catch (formError) {
      const { message } = handleError(formError, "处理表单数据");
      return NextResponse.json(
        { error: `处理表单失败: ${message}` },
        { status: 400 }
      );
    }
  } catch (error) {
    const { message } = handleError(error, "照片上传");
    return NextResponse.json(
      { error: `上传失败: ${message}` },
      { status: 500 }
    );
  }
} 