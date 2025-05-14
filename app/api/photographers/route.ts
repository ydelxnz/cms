import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/lib/db";

// 获取摄影师列表（公开访问）
export async function GET(request: NextRequest) {
  try {
    // 获取所有用户
    const users = await getUsers();
    
    // 过滤出摄影师角色的用户，并移除密码字段
    const photographers = users
      .filter(user => user.role === "photographer")
      .map(({ password, ...photographer }) => {
        // 添加默认值，确保返回的数据结构符合前端期望
        return {
          ...photographer,
          specialties: photographer.profile?.specialties || [],
          bio: photographer.profile?.bio || "",
          avatar: photographer.profile?.avatar || "",
          rating: photographer.profile?.rating || 0,
          reviews: photographer.profile?.reviews || [],
          portfolio: photographer.profile?.portfolio || []
        };
      });
      
    return NextResponse.json(photographers);
  } catch (error) {
    console.error("Error fetching photographers:", error);
    return NextResponse.json(
      { error: "获取摄影师数据失败" },
      { status: 500 }
    );
  }
} 