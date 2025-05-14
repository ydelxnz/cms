import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] 开始上传照片到相册, 相册ID: ${params.id}`);
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[API] 上传照片失败: 认证失败');
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    console.log(`[API] 用户角色: ${session.user.role}, 用户ID: ${session.user.id}`);
    
    // 只有摄影师和管理员可以上传照片
    if (session.user.role !== "photographer" && session.user.role !== "admin") {
      console.log(`[API] 上传照片失败: 权限不足, 用户角色: ${session.user.role}`);
      return NextResponse.json(
        { error: "没有权限上传照片" },
        { status: 403 }
      );
    }
    
    const albumId = params.id;
    if (!albumId) {
      console.log('[API] 上传照片失败: 相册ID为空');
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
    let clientId = "";
    let photographerId = session.user.id;
    
    if (!album) {
      console.log(`[API] 未找到相册，尝试通过预约系统获取, ID: ${albumId}`);
      booking = await db.getBookingById(albumId);
      if (!booking) {
        console.log(`[API] 上传照片失败: 未找到相册/预约信息, ID: ${albumId}`);
        return NextResponse.json(
          { error: "未找到相册信息" },
          { status: 404 }
        );
      }
      console.log(`[API] 通过预约找到相册, ID: ${booking.id}, 类型: ${booking.type}`);
      clientId = booking.clientId;
      photographerId = booking.photographerId;
    } else {
      console.log(`[API] 找到相册, ID: ${album.id}, 名称: ${album.name}`);
      clientId = album.clientId || "";
      photographerId = album.photographerId;
    }
    
    // 权限检查
    if (session.user.role === "photographer" && photographerId !== session.user.id) {
      console.log(`[API] 上传照片失败: 无权访问此相册, 用户ID: ${session.user.id}, 相册摄影师ID: ${photographerId}`);
      return NextResponse.json(
        { error: "无权上传照片到此相册" },
        { status: 403 }
      );
    }
    
    // 处理表单数据
    console.log(`[API] 处理上传的文件`);
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      console.log('[API] 上传照片失败: 没有上传任何文件');
      return NextResponse.json(
        { error: "未上传任何文件" },
        { status: 400 }
      );
    }
    
    console.log(`[API] 上传文件数量: ${files.length}`);
    
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), "public", "uploads", "photos");
    const thumbnailDir = path.join(process.cwd(), "public", "uploads", "thumbnails");
    
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    if (!fs.existsSync(thumbnailDir)) {
      await mkdir(thumbnailDir, { recursive: true });
    }
    
    // 处理每个文件并保存到数据库
    const uploadedPhotos = [];
    const failedUploads = [];
    
    for (const file of files) {
      try {
        // 生成随机文件名
        const fileId = uuidv4();
        const fileExtension = file.name.split(".").pop() || "jpg";
        const fileName = `${fileId}.${fileExtension}`;
        const thumbnailName = `${fileId}_thumb.${fileExtension}`;
        
        const filePath = path.join(uploadDir, fileName);
        const thumbnailPath = path.join(thumbnailDir, thumbnailName);
        
        // 保存原始文件
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);
        
        // 生成缩略图
        try {
          await sharp(buffer)
            .resize(300, 300, { fit: "inside" })
            .toFile(thumbnailPath);
        } catch (sharpError) {
          console.error(`[API] 生成缩略图失败: ${file.name}`, sharpError);
          // 使用原图作为缩略图
          await writeFile(thumbnailPath, buffer);
        }
        
        // 获取图片尺寸
        let width = 0, height = 0;
        try {
          const metadata = await sharp(buffer).metadata();
          width = metadata.width || 0;
          height = metadata.height || 0;
        } catch (metadataError) {
          console.error(`[API] 获取图片元数据失败: ${file.name}`, metadataError);
        }
        
        // 创建照片记录
        const photoData = {
          title: file.name.split(".")[0],
          description: "",
          fileName: fileName,
          filePath: `/uploads/photos/${fileName}`,
          thumbnailPath: `/uploads/thumbnails/${thumbnailName}`,
          uploadedBy: session.user.id,
          clientId: clientId,
          albumId: albumId,  // 添加相册ID
          tags: [],
          metadata: {
            size: file.size,
            width,
            height,
            category: "普通"
          }
        };
        
        const newPhoto = await db.createPhoto(photoData);
        console.log(`[API] 照片保存成功: ${newPhoto.id}`);
        
        // 添加到上传成功列表
        uploadedPhotos.push({
          id: newPhoto.id,
          name: newPhoto.title,
          url: newPhoto.filePath,
          thumbnailUrl: newPhoto.thumbnailPath,
          category: newPhoto.metadata?.category || "普通",
          size: newPhoto.metadata?.size || 0,
          albumId: albumId
        });
        
        // 更新相册照片数量
        if (album) {
          await db.updatePhotoAlbum(albumId, { 
            photoCount: (album.photoCount || 0) + 1,
            coverPhotoUrl: album.coverPhotoUrl || newPhoto.thumbnailPath
          });
        }
      } catch (fileError) {
        console.error(`[API] 处理文件失败: ${file.name}`, fileError);
        failedUploads.push(file.name);
      }
    }
    
    // 返回结果
    if (uploadedPhotos.length === 0) {
      console.log('[API] 所有照片上传失败');
      return NextResponse.json(
        { 
          error: "所有照片上传失败", 
          failedUploads 
        },
        { status: 500 }
      );
    }
    
    console.log(`[API] 照片上传完成, 成功: ${uploadedPhotos.length}, 失败: ${failedUploads.length}`);
    return NextResponse.json({
      photos: uploadedPhotos,
      failedUploads,
      success: uploadedPhotos.length,
      total: files.length
    });
    
  } catch (error) {
    console.error("Error uploading photos:", error);
    
    let errorMessage = "上传照片失败";
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