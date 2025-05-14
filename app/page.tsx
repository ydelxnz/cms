import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header activePage="home" />

      {/* 英雄区域 */}
      <section className="relative overflow-hidden">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f5f3f8] to-[#ede7f6]" />
        
        {/* 装饰元素 */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#5D4777]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#E6C27F]/10 blur-3xl" />
        
        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <div className="flex flex-col items-center text-center">
            <div className="inline-block rounded-full bg-[#5D4777]/10 px-4 py-1 mb-8">
              <span className="text-sm font-medium text-[#5D4777]">专业摄影工作室解决方案</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl max-w-4xl">
              现代化摄影工作室
              <span className="bg-gradient-to-r from-[#5D4777] to-[#8e72b4] bg-clip-text text-transparent block mt-2">管理系统</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mt-8">
              一站式解决方案，帮助摄影工作室管理客户、预约、照片和订单，提升工作效率和客户满意度。
            </p>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0 mt-8">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-[#5D4777] to-[#7d63a1] text-white hover:opacity-90">
                  立即体验
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">
                  了解更多
                </Button>
              </Link>
            </div>
            
            <div className="relative w-full max-w-5xl h-64 mt-16">
              {/* 装饰元素 */}
              <div className="absolute left-1/4 top-0 h-32 w-32 rounded-full bg-[#5D4777]/20 blur-xl" />
              <div className="absolute right-1/4 bottom-0 h-32 w-32 rounded-full bg-[#E6C27F]/20 blur-xl" />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8e72b4]/20 blur-xl" />
              
              {/* 渐变光效 */}
              <div className="absolute -bottom-6 left-1/2 h-12 w-64 -translate-x-1/2 rounded-full bg-[#5D4777]/30 blur-2xl" />
  
              {/* 文字内容 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <span className="text-sm font-medium text-[#5D4777]">高级摄影工作室管理系统</span>
                <p className="mt-2 text-xs text-gray-500">为摄影师和工作室量身打造的专业解决方案</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特色功能区域 */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">专业功能，提升效率</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">我们的系统提供了一系列强大的功能，帮助摄影工作室提高工作效率和客户满意度。</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* 功能卡片1 */}
            <div className="group rounded-xl border border-gray-200 bg-white p-8 transition-all hover:shadow-md">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[#5D4777]/10 text-[#5D4777]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 19h8a4 4 0 0 0 3.8-2.8 4 4 0 0 0-1.6-4.5c1-1.1 1-2.7 0-3.8-.7-.8-1.8-1.1-2.8-.8a4 4 0 0 0-6.8 0C7.6 6.3 6.5 6.5 5.8 7.3c-1 1.1-1 2.7 0 3.8a4 4 0 0 0-1.6 4.5A4 4 0 0 0 8 19Z"/><path d="M12 19v3"/></svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">客户管理</h3>
              <p className="text-gray-600">轻松管理客户信息，包括联系方式、偏好和购买历史，提供个性化服务。</p>
            </div>

            {/* 功能卡片2 */}
            <div className="group rounded-xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[#5D4777]/10 text-[#5D4777]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">预约系统</h3>
              <p className="text-muted-foreground">智能预约系统，自动安排时间，避免冲突，并发送提醒，减少客户爱爱的情况。</p>
            </div>

            {/* 功能卡片3 */}
            <div className="group rounded-xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[#5D4777]/10 text-[#5D4777]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><path d="m16 5 3 3-3 3"/><path d="M18 8H9"/></svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">照片管理</h3>
              <p className="text-muted-foreground">强大的照片管理工具，支持上传、编辑、分类和分享，让客户轻松浏览和选择照片。</p>
            </div>

            {/* 功能卡片4 */}
            <div className="group rounded-xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[#5D4777]/10 text-[#5D4777]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">团队协作</h3>
              <p className="text-muted-foreground">多用户协作功能，允许摄影师、助理和客户服务人员共同工作，提高团队效率。</p>
            </div>

            {/* 功能卡片5 */}
            <div className="group rounded-xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[#5D4777]/10 text-[#5D4777]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">支付管理</h3>
              <p className="text-muted-foreground">集成支付系统，支持多种支付方式，自动生成发票，让财务管理变得简单。</p>
            </div>

            {/* 功能卡片6 */}
            <div className="group rounded-xl bg-white p-8 shadow-lg transition-all hover:shadow-xl">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[#5D4777]/10 text-[#5D4777]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold">合同管理</h3>
              <p className="text-muted-foreground">电子合同系统，支持在线签署和管理，确保所有协议都安全记录并易于查找。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 数据统计区域 */}
      <section className="bg-gradient-to-br from-[#f8f7fa] to-[#ede7f6] py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="rounded-xl bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
              <div className="bg-gradient-to-r from-[#5D4777] to-[#8e72b4] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">5000+</div>
              <p className="mt-2 text-gray-600">满意客户</p>
            </div>
            <div className="rounded-xl bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
              <div className="bg-gradient-to-r from-[#5D4777] to-[#8e72b4] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">25000+</div>
              <p className="mt-2 text-gray-600">成功预约</p>
            </div>
            <div className="rounded-xl bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
              <div className="bg-gradient-to-r from-[#5D4777] to-[#8e72b4] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">100000+</div>
              <p className="mt-2 text-gray-600">照片管理</p>
            </div>
            <div className="rounded-xl bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
              <div className="bg-gradient-to-r from-[#5D4777] to-[#8e72b4] bg-clip-text text-4xl font-bold text-transparent md:text-5xl">98%</div>
              <p className="mt-2 text-gray-600">客户满意度</p>
            </div>
          </div>
        </div>
      </section>

      {/* 客户评价区域 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">客户如何评价我们</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">听听我们的客户如何评价我们的系统，他们的成功故事是我们最好的证明。</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* 评价1 */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-[#5D4777]/20">
                  <Image src="/avatar1.jpg" alt="客户头像" width={48} height={48} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-medium">王小姐</h4>
                  <p className="text-sm text-muted-foreground">婚纱摄影工作室</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">“这个系统强大而易用，帮助我们将预约管理时间减少50%，客户也非常喜欢在线浏览和选择照片的功能。”</p>
            </div>

            {/* 评价2 */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-[#5D4777]/20">
                  <Image src="/avatar2.jpg" alt="客户头像" width={48} height={48} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-medium">张经理</h4>
                  <p className="text-sm text-muted-foreground">商业摄影服务</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">“自从使用这个系统，我们的业务增长了30%。客户管理和财务跟踪功能帮助我们更好地管理资源和提高收入。”</p>
            </div>

            {/* 评价3 */}
            <div className="rounded-xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-[#5D4777]/20">
                  <Image src="/avatar3.jpg" alt="客户头像" width={48} height={48} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="text-lg font-medium">李摄影师</h4>
                  <p className="text-sm text-muted-foreground">个人工作室</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">“作为一个小型工作室，这个系统完美满足了我的需求。它简化了我的工作流程，让我能够专注于创作而不是管理任务。”</p>
            </div>
          </div>


        </div>
      </section>

      {/* 行动号召区域 */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f5f3f8] to-[#ede7f6] opacity-50" />
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#5D4777]/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#5D4777]/5 blur-3xl" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">准备好提升您的摄影工作室了吗？</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">立即开始使用我们的系统，体验如何提高工作效率和客户满意度。</p>
          
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-[#5D4777] to-[#7d63a1] text-white hover:opacity-90">
                免费试用 14 天
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">
                联系销售团队
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
