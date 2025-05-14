import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: "未提供摄影师ID" },
        { status: 400 }
      );
    }
    
    // 获取用户数据
    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: "未找到该摄影师" },
        { status: 404 }
      );
    }
    
    if (user.role !== "photographer") {
      return NextResponse.json(
        { error: "请求的用户不是摄影师" },
        { status: 400 }
      );
    }
    
    // 移除密码字段，添加默认值
    const { password, ...photographer } = user;
    const result = {
      ...photographer,
      specialties: photographer.profile?.specialties || [],
      bio: photographer.profile?.bio || "",
      avatar: photographer.profile?.avatar || "",
      rating: photographer.profile?.rating || 0,
      reviews: photographer.profile?.reviews || [],
      portfolio: photographer.profile?.portfolio || []
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching photographer:", error);
    return NextResponse.json(
      { error: "获取摄影师数据失败" },
      { status: 500 }
    );
  }
} 