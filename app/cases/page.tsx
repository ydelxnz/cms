import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function CasesPage() {
  return (
    <div className="flex flex-col">
      <Header activePage="home" />

      {/* 页面标题 */}
      <div className="relative overflow-hidden py-10">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f5f3f8] to-[#ede7f6]" />
        
        {/* 装饰元素 */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#5D4777]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#E6C27F]/10 blur-3xl" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">客户案例</h1>
          <p className="mt-2 text-lg text-gray-600">我们的优秀作品展示</p>
        </div>
      </div>

      {/* 案例分类 */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="rounded-full border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">全部案例</Button>
            <Button variant="outline" className="rounded-full border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">婚纱摄影</Button>
            <Button variant="outline" className="rounded-full border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">家庭写真</Button>
            <Button variant="outline" className="rounded-full border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">个人写真</Button>
            <Button variant="outline" className="rounded-full border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">商业摄影</Button>
          </div>
        </div>
      </section>

      {/* 案例展示 */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* 案例1 */}
            <div className="group overflow-hidden rounded-lg bg-white/80 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src="/婚纱摄影.png" 
                  alt="婚纱案例" 
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-medium text-gray-900">张先生与李女士的海滩婚纱照</h3>
                <p className="mb-4 text-gray-600">在三亚美丽的海滩上，我们为这对新人捕捉了浪漫的时刻。</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">婚纱摄影</span>
                  <Link href="#" className="text-sm font-medium text-[#5D4777] hover:text-[#7d63a1] hover:underline">查看详情</Link>
                </div>
              </div>
            </div>
            
            {/* 案例2 */}
            <div className="group overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src="/家庭写真.png" 
                  alt="家庭案例" 
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-white p-6">
                <h3 className="mb-2 text-xl font-medium">王家的温馨家庭写真</h3>
                <p className="mb-4 text-muted-foreground">记录三口之家的幸福时光，每一张照片都充满了爱与温暖。</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">家庭写真</span>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline">查看详情</Link>
                </div>
              </div>
            </div>
            
            {/* 案例3 */}
            <div className="group overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src="/商业写真.png" 
                  alt="商业案例" 
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-white p-6">
                <h3 className="mb-2 text-xl font-medium">星空品牌产品展示</h3>
                <p className="mb-4 text-muted-foreground">为星空品牌打造的高端产品展示照片，展现产品的高质感与品质。</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">商业摄影</span>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline">查看详情</Link>
                </div>
              </div>
            </div>
            
            {/* 案例4 */}
            <div className="group overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src="/个人写真.png" 
                  alt="个人案例" 
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-white p-6">
                <h3 className="mb-2 text-xl font-medium">陈小姐的毕业写真</h3>
                <p className="mb-4 text-muted-foreground">记录人生重要时刻，青春洋溢的大学毕业纪念照。</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">个人写真</span>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline">查看详情</Link>
                </div>
              </div>
            </div>
            
            {/* 案例5 */}
            <div className="group overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src="/case5.jpg" 
                  alt="婚纱案例" 
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-white p-6">
                <h3 className="mb-2 text-xl font-medium">刘先生与赵女士的森系婚纱照</h3>
                <p className="mb-4 text-muted-foreground">在森林中拍摄的梦幻婚纱照，自然光影与绿意相映成趣。</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">婚纱摄影</span>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline">查看详情</Link>
                </div>
              </div>
            </div>
            
            {/* 案例6 */}
            <div className="group overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src="/case6.jpg" 
                  alt="商业案例" 
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="bg-white p-6">
                <h3 className="mb-2 text-xl font-medium">月光餐厅美食摄影</h3>
                <p className="mb-4 text-muted-foreground">精致美食的专业拍摄，让每一道菜品都展现最佳状态。</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">商业摄影</span>
                  <Link href="#" className="text-sm font-medium text-primary hover:underline">查看详情</Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* 分页 */}
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              <Button variant="outline" size="sm" className="border-[#5D4777]/30 text-gray-400" disabled>上一页</Button>
              <Button variant="outline" size="sm" className="border-[#5D4777] bg-gradient-to-r from-[#5D4777] to-[#7d63a1] text-white">1</Button>
              <Button variant="outline" size="sm" className="border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">2</Button>
              <Button variant="outline" size="sm" className="border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">3</Button>
              <Button variant="outline" size="sm" className="border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">下一页</Button>
            </nav>
          </div>
        </div>
      </section>

      {/* 客户评价 */}
      <section className="py-8 bg-gradient-to-br from-[#f8f7fa] to-[#ede7f6]">
        <div className="container mx-auto px-4">
          <div className="mb-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">客户评价</h2>
            <p className="mt-2 text-lg text-gray-600">听听我们的客户怎么说</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
              <div className="mb-4 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-[#5D4777]/10"></div>
                <div>
                  <p className="font-medium text-gray-900">张女士</p>
                  <p className="text-sm text-gray-500">新婚夫妇</p>
                </div>
              </div>
              <p className="italic text-gray-600">&ldquo;非常满意我们的婚纱照，摄影师很专业，能捕捉到最美的瞬间，服务也很贴心。&rdquo;</p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/20"></div>
                <div>
                  <p className="font-medium">王先生</p>
                  <p className="text-sm text-muted-foreground">企业客户</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">&ldquo;为我们公司的产品拍摄提供了极大便利，从预约到照片交付，整个流程非常顺畅。&rdquo;</p>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/20"></div>
                <div>
                  <p className="font-medium">陈小姐</p>
                  <p className="text-sm text-muted-foreground">个人写真客户</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">&ldquo;拍摄过程很轻松愉快，摄影师能引导我做出自然的表情和姿势，成片效果超出预期。&rdquo;</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
