const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// 确保数据目录存在
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 确保上传目录存在
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const PHOTOS_DIR = path.join(UPLOADS_DIR, 'photos');
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, 'thumbnails');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

if (!fs.existsSync(THUMBNAILS_DIR)) {
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

// 数据文件路径
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

// 创建初始用户数据
async function createInitialUsers() {
  // 检查用户文件是否已存在
  if (fs.existsSync(USERS_FILE)) {
    const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    if (usersData.length > 0) {
      console.log('用户数据已存在，跳过初始化');
      return;
    }
  }
  
  // 创建管理员密码哈希
  const adminSalt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', adminSalt);
  
  // 创建摄影师密码哈希
  const photographerSalt = await bcrypt.genSalt(10);
  const photographerPassword = await bcrypt.hash('photo123', photographerSalt);
  
  // 创建客户密码哈希
  const clientSalt = await bcrypt.genSalt(10);
  const clientPassword = await bcrypt.hash('client123', clientSalt);
  
  // 初始用户数据
  const now = new Date().toISOString();
  const initialUsers = [
    {
      id: 'user_admin_1',
      name: '系统管理员',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
      profile: {
        avatar: '/images/avatars/admin.png'
      }
    },
    {
      id: 'user_photographer_1',
      name: '张摄影师',
      email: 'photographer@example.com',
      password: photographerPassword,
      role: 'photographer',
      createdAt: now,
      updatedAt: now,
      profile: {
        avatar: '/images/avatars/photographer.png',
        specialties: ['婚纱照', '儿童照', '全家福'],
        experience: '5年以上专业摄影经验',
        bio: '专注于捕捉最美瞬间的专业摄影师'
      }
    },
    {
      id: 'user_client_1',
      name: '李客户',
      email: 'client@example.com',
      password: clientPassword,
      role: 'client',
      createdAt: now,
      updatedAt: now,
      profile: {
        avatar: '/images/avatars/client.png',
        phone: '13800138000'
      }
    }
  ];
  
  // 写入用户数据
  fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf8');
  console.log('初始用户数据创建成功');
}

// 初始化空数据文件
function initEmptyDataFiles() {
  const emptyData = [];
  
  if (!fs.existsSync(PHOTOS_FILE)) {
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify(emptyData, null, 2), 'utf8');
    console.log('照片数据文件初始化成功');
  }
  
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(emptyData, null, 2), 'utf8');
    console.log('预约数据文件初始化成功');
  }
  
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(emptyData, null, 2), 'utf8');
    console.log('订单数据文件初始化成功');
  }
  
  if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(emptyData, null, 2), 'utf8');
    console.log('评价数据文件初始化成功');
  }
}

// 执行种子脚本
async function seed() {
  try {
    await createInitialUsers();
    initEmptyDataFiles();
    console.log('数据初始化完成!');
    console.log('默认用户:');
    console.log('- 管理员: admin@example.com / admin123');
    console.log('- 摄影师: photographer@example.com / photo123');
    console.log('- 客户: client@example.com / client123');
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  }
}

// 运行种子脚本
seed(); 