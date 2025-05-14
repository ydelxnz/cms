import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

const handler = NextAuth(authOptions);

export const GET = async (request: NextRequest, context: any) => {
  const nextauthAction = context.params?.nextauth?.[0];
  
  const response = await handler(request, context);
  
  if (nextauthAction === 'callback' && response.headers.has('set-cookie')) {
    try {
      const sessionCookie = response.headers.get('set-cookie');
      if (sessionCookie && sessionCookie.includes('next-auth.session-token')) {
        fetch('/api/admin/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'security',
            module: '认证',
            description: '用户登录系统',
            details: {
              action: 'login',
              success: true,
            }
          }),
        }).catch(err => console.error('登录日志记录失败:', err));
      }
    } catch (error) {
      console.error('处理登录日志时出错:', error);
    }
  }

  return response;
};

export const POST = handler;
