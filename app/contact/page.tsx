import { Mail, MapPin, Phone, Clock, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <Header activePage="contact" />

      {/* 页面标题 */}
      <div className="relative overflow-hidden py-10">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f5f3f8] to-[#ede7f6]" />
        
        {/* 装饰元素 */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#5D4777]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#E6C27F]/10 blur-3xl" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">联系我们</h1>
          <p className="mt-4 text-lg text-gray-600">随时为您提供专业的摄影服务</p>
        </div>
      </div>

      {/* 联系信息 */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <p className="mx-auto max-w-2xl text-gray-600">如果您有任何疑问或需要预约服务，请通过以下方式与我们联系。我们的客服团队将在第一时间回复您。</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-white/90 p-6 text-center shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5D4777]/10">
                  <Phone className="h-6 w-6 text-[#5D4777]" />
                </div>
                <h3 className="mb-2 font-medium text-gray-900">电话咨询</h3>
                <p className="text-gray-600">+86 10 8888 8888</p>
                <p className="mt-1 text-sm text-gray-500">工作时间内电话咨询</p>
              </div>
              
              <div className="rounded-lg bg-white/90 p-6 text-center shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5D4777]/10">
                  <Mail className="h-6 w-6 text-[#5D4777]" />
                </div>
                <h3 className="mb-2 font-medium text-gray-900">电子邮箱</h3>
                <p className="text-gray-600">contact@example.com</p>
                <p className="mt-1 text-sm text-gray-500">随时发送邮件咨询</p>
              </div>
              
              <div className="rounded-lg bg-white/90 p-6 text-center shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5D4777]/10">
                  <MapPin className="h-6 w-6 text-[#5D4777]" />
                </div>
                <h3 className="mb-2 font-medium text-gray-900">地址</h3>
                <p className="text-gray-600">北京市朝阳区建国路88号</p>
                <p className="text-gray-600">现代城大厦A座3层</p>
              </div>
              
              <div className="rounded-lg bg-white/90 p-6 text-center shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5D4777]/10">
                  <Clock className="h-6 w-6 text-[#5D4777]" />
                </div>
                <h3 className="mb-2 font-medium text-gray-900">营业时间</h3>
                <p className="text-gray-600">周一至周五: 9:00 - 21:00</p>
                <p className="text-gray-600">周六至周日: 10:00 - 22:00</p>
              </div>
            </div>
            
            <div className="mt-12">
              <div className="rounded-lg bg-white/90 p-8 shadow-sm backdrop-blur-sm">
                <h3 className="mb-6 text-center text-2xl font-medium text-gray-900">快速预约</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg bg-gradient-to-br from-[#f5f3f8] to-[#ede7f6] p-6 text-center">
                    <h4 className="mb-4 text-xl font-medium text-gray-900">电话预约</h4>
                    <p className="mb-6 text-gray-600">直接拨打我们的客服热线，快速预约您的摄影服务</p>
                    <Button className="bg-gradient-to-r from-[#5D4777] to-[#7d63a1] text-white hover:opacity-90">
                      <Phone className="mr-2 h-4 w-4" />
                      +86 10 8888 8888
                    </Button>
                  </div>
                  
                  <div className="rounded-lg bg-gradient-to-br from-[#f5f3f8] to-[#ede7f6] p-6 text-center">
                    <h4 className="mb-4 text-xl font-medium text-gray-900">微信预约</h4>
                    <p className="mb-6 text-gray-600">扫描下方二维码，添加我们的客服微信号进行预约</p>
                    <Button className="bg-gradient-to-r from-[#5D4777] to-[#7d63a1] text-white hover:opacity-90">
                      微信号: wxid_example
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="mb-6 text-2xl font-medium text-gray-900">关注我们</h3>
              <div className="flex justify-center space-x-6">
                <a href="#" className="rounded-full bg-[#5D4777]/10 p-3 text-[#5D4777] transition-colors hover:bg-[#5D4777]/20">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="rounded-full bg-[#5D4777]/10 p-3 text-[#5D4777] transition-colors hover:bg-[#5D4777]/20">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="rounded-full bg-[#5D4777]/10 p-3 text-[#5D4777] transition-colors hover:bg-[#5D4777]/20">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 分店信息 */}
      <section className="bg-gradient-to-br from-[#f8f7fa] to-[#ede7f6] py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">我们的分店</h2>
            <p className="mt-4 text-lg text-gray-600">在全国多个城市为您提供服务</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
              <h3 className="mb-4 text-xl font-medium text-gray-900">北京总店</h3>
              <p className="mb-2 text-gray-600">北京市朝阳区建国路88号现代城大厦A座3层</p>
              <p className="mb-4 text-gray-600">电话: +86 10 8888 8888</p>
              <Button variant="outline" size="sm" className="border-[#5D4777]/30 text-[#5D4777] hover:bg-[#5D4777]/5">查看详情</Button>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-medium">上海分店</h3>
              <p className="mb-2 text-muted-foreground">上海市静安区南京西路1266号恒隆广场46楼</p>
              <p className="mb-4 text-muted-foreground">电话: +86 21 6888 8888</p>
              <Button variant="outline" size="sm">查看详情</Button>
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-medium">广州分店</h3>
              <p className="mb-2 text-muted-foreground">广州市天河区天河路385号太古汇北塔15楼</p>
              <p className="mb-4 text-muted-foreground">电话: +86 20 3888 8888</p>
              <Button variant="outline" size="sm">查看详情</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
