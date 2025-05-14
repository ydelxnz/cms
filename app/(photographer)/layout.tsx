import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { bypassAuthCheck, mockSession } from "@/lib/dev-auth";

import PhotographerSidebar from "@/components/photographer/PhotographerSidebar";
import PhotographerHeader from "@/components/photographer/PhotographerHeader";

export default async function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 开发环境认证绕过
  if (bypassAuthCheck()) {
    // 使用模拟会话数据
    const devUser = {...mockSession.user, role: "photographer"};
    
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <PhotographerSidebar />
        
        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <PhotographerHeader user={devUser} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mb-4 rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
              <p><strong>开发模式提示：</strong> 当前使用模拟用户数据，认证已被绕过。</p>
            </div>
            {children}
          </main>
        </div>
      </div>
    );
  }
  
  // 生产环境正常认证流程
  // Get the session on the server
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has the photographer role
  if (!session || session.user.role !== "photographer") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <PhotographerSidebar />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <PhotographerHeader user={session.user} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
