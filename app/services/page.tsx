import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      <Header activePage="services" />

      {/* 页面标题 */}
      <div className="relative overflow-hidden py-10">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f5f3f8] to-[#ede7f6]" />
        
        {/* 装饰元素 */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#5D4777]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#E6C27F]/10 blur-3xl" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">我们的服务</h1>
          <p className="mt-4 text-lg text-gray-600">为您提供专业的摄影服务</p>
        </div>
      </div>

      {/* 服务内容 */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="flex flex-col space-y-6">
              <h2 className="text-2xl font-bold">婚纱摄影</h2>
              <p className="text-muted-foreground">
                我们的婚纱摄影服务为新人提供从前期咨询、造型设计、场景选择到后期制作的全流程专业服务。我们的专业团队将捕捉您婚礼中的每一个珍贵瞬间，为您创造永恒的美好回忆。
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 室内外多场景拍摄
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 专业造型师全程跟妆
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 高端后期精修
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 精美相册制作
                </li>
              </ul>
              <div>
                <Button className="bg-gradient-to-r from-[#5D4777] to-[#7d63a1] text-white hover:opacity-90">预约咨询</Button>
              </div>
            </div>
            <div className="relative h-80 overflow-hidden rounded-lg md:h-auto">
              <Image 
                src="/婚纱摄影.png" 
                alt="婚纱摄影" 
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="relative order-2 h-80 overflow-hidden rounded-lg md:order-1 md:h-auto">
              <Image 
                src="/家庭写真.png" 
                alt="家庭写真" 
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
            <div className="order-1 flex flex-col space-y-6 md:order-2">
              <h2 className="text-2xl font-bold">家庭写真</h2>
              <p className="text-muted-foreground">
                家庭是我们一生中最重要的组成部分，我们的家庭写真服务致力于捕捉家庭成员间的真挚情感和温馨瞬间，为您留下珍贵的家庭记忆。
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 轻松自然的拍摄环境
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 适合各年龄段的拍摄方案
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 个性化主题定制
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 多种相册和装饰品选择
                </li>
              </ul>
              <div>
                <Button className="bg-gradient-to-r from-[#5D4777] to-[#7d63a1] text-white hover:opacity-90">预约咨询</Button>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="flex flex-col space-y-6">
              <h2 className="text-2xl font-bold">个人写真</h2>
              <p className="text-muted-foreground">
                每个人都有属于自己的独特魅力，我们的个人写真服务旨在展现您的个性和风采。无论是毕业照、艺术写真还是职业形象照，我们都能为您量身定制最适合的拍摄方案。
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 个性化风格定制
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 专业造型指导
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 多样化场景选择
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 精修照片电子版提供
                </li>
              </ul>
              <div>
                <Button className="bg-gradient-to-r from-[#5D4777] to-[#7d63a1] text-white hover:opacity-90">预约咨询</Button>
              </div>
            </div>
            <div className="relative h-80 overflow-hidden rounded-lg md:h-auto">
              <Image 
                src="/个人写真.png" 
                alt="个人写真" 
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="relative order-2 h-80 overflow-hidden rounded-lg md:order-1 md:h-auto">
              <Image 
                src="/商业写真.png" 
                alt="商业摄影" 
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
            <div className="order-1 flex flex-col space-y-6 md:order-2">
              <h2 className="text-2xl font-bold">商业摄影</h2>
              <p className="text-muted-foreground">
                优质的商业摄影能有效提升品牌形象和产品价值。我们提供专业的产品摄影、企业形象摄影、活动摄影等商业摄影服务，帮助企业展示最佳形象。
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 产品精致展示
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 企业形象塑造
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 活动现场记录
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-primary">✓</span> 广告创意拍摄
                </li>
              </ul>
              <div>
                <Button className="bg-gradient-to-r from-[#5D4777] to-[#7d63a1] text-white hover:opacity-90">预约咨询</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 服务流程 */}
      <section className="bg-gradient-to-br from-[#f8f7fa] to-[#ede7f6] py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">服务流程</h2>
            <p className="mt-4 text-lg text-gray-600">我们提供专业、高效、便捷的服务流程</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-4">
            <div className="relative rounded-lg bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
              <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r from-[#5D4777] to-[#7d63a1] text-white">1</div>
              <div className="mt-4 text-center">
                <h3 className="mb-2 text-xl font-medium text-gray-900">预约咨询</h3>
                <p className="text-gray-600">在线或电话预约，了解服务内容和价格</p>
              </div>
            </div>
            
            <div className="relative rounded-lg bg-white p-6 shadow-sm">
              <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-white">2</div>
              <div className="mt-4 text-center">
                <h3 className="mb-2 text-xl font-medium">方案定制</h3>
                <p className="text-muted-foreground">根据需求定制个性化拍摄方案</p>
              </div>
            </div>
            
            <div className="relative rounded-lg bg-white p-6 shadow-sm">
              <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-white">3</div>
              <div className="mt-4 text-center">
                <h3 className="mb-2 text-xl font-medium">拍摄服务</h3>
                <p className="text-muted-foreground">专业团队提供高质量拍摄服务</p>
              </div>
            </div>
            
            <div className="relative rounded-lg bg-white p-6 shadow-sm">
              <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-white">4</div>
              <div className="mt-4 text-center">
                <h3 className="mb-2 text-xl font-medium">成片交付</h3>
                <p className="text-muted-foreground">精修照片和成品相册交付</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
