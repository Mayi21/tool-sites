# 管理员账号配置说明

## 📝 配置文件说明

管理员账号可以通过多种方式配置，按优先级从高到低：

### 1. 环境变量（推荐用于生产环境）

创建 `.env` 文件在项目根目录：

```bash
# 管理员账号配置
VITE_ADMIN_USERNAME=xaohii
VITE_ADMIN_PASSWORD=Qwer1234.Md

# 其他环境配置
VITE_APP_TITLE=多功能工具箱
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. 本地存储（用于开发环境）

在浏览器控制台执行：

```javascript
// 设置管理员账号
localStorage.setItem('env_config', JSON.stringify({
  admin_username: 'xaohii',
  admin_password: 'Qwer1234.Md'
}));

// 清除配置
localStorage.removeItem('env_config');
```

### 3. 配置文件（当前使用）

编辑 `src/env.cfg` 文件：

```
admin_username=xaohii
admin_password=Qwer1234.Md
```

### 4. 默认配置（备用）

如果以上配置都不可用，将使用默认配置：

```javascript
{
  admin_username: 'admin',
  admin_password: 'admin123'
}
```

## 🔧 配置加载器

项目使用 `src/utils/configLoader.js` 来管理配置加载：

### 功能特性
- **优先级加载**：按环境变量 > 本地存储 > 配置文件 > 默认配置的顺序加载
- **异步加载**：支持异步配置加载
- **错误处理**：配置加载失败时自动使用备用配置
- **开发友好**：支持运行时修改配置

### 使用方法

```javascript
import configLoader from './utils/configLoader';

// 加载配置
await configLoader.load();

// 获取特定配置
const username = configLoader.get('admin_username');

// 获取所有配置
const allConfig = configLoader.getAll();

// 设置配置（开发环境）
configLoader.set('admin_username', 'new_username');
```

## 🚀 部署说明

### 开发环境
1. 编辑 `src/env.cfg` 文件
2. 重启开发服务器
3. 访问 `http://localhost:5173/admin/dashboard`

### 生产环境
1. 创建 `.env` 文件
2. 设置环境变量
3. 构建项目：`npm run build`
4. 部署到服务器

### Docker 部署
```dockerfile
# 在 Dockerfile 中设置环境变量
ENV VITE_ADMIN_USERNAME=xaohii
ENV VITE_ADMIN_PASSWORD=Qwer1234.Md
```

## 🔒 安全建议

### 密码安全
- 使用强密码（至少8位，包含大小写字母、数字、特殊字符）
- 定期更换密码
- 不要在代码中硬编码密码

### 环境变量安全
- 生产环境使用环境变量而不是配置文件
- 确保 `.env` 文件不被提交到版本控制
- 使用 `.env.example` 作为模板

### 访问控制
- 限制管理员账号数量
- 定期审查访问日志
- 实现多因素认证（可选）

## 🛠️ 故障排除

### 配置不生效
1. 检查配置文件格式是否正确
2. 确认环境变量前缀为 `VITE_`
3. 重启开发服务器
4. 清除浏览器缓存

### 登录失败
1. 检查账号密码是否正确
2. 确认配置文件已正确加载
3. 查看浏览器控制台错误信息
4. 检查账号是否被锁定

### 配置加载错误
1. 检查文件权限
2. 确认文件路径正确
3. 查看控制台错误日志
4. 使用默认配置作为备用

## 📋 配置验证

### 验证配置是否正确加载
```javascript
// 在浏览器控制台执行
import('./src/config/admin.js').then(module => {
  console.log('Admin config:', module.ADMIN_CONFIG.credentials);
});
```

### 验证登录凭据
```javascript
// 在浏览器控制台执行
import('./src/config/admin.js').then(module => {
  const isValid = module.validateAdminCredentials('xaohii', 'Qwer1234.Md');
  console.log('Credentials valid:', isValid);
});
```

## 🔄 更新日志

### v1.1.0
- 添加配置文件支持
- 实现配置加载器
- 支持多种配置源
- 添加配置验证功能

### 计划功能
- 支持加密配置文件
- 添加配置热重载
- 实现配置管理界面
- 支持多环境配置 