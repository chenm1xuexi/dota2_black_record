# 数据库初始化脚本说明

本目录包含用于初始化数据库的 SQL 脚本。

## 脚本说明

### 1. `init-database.sql`
**用途**: 创建数据库和用户（仅用于外部 MySQL）

**功能**:
- 创建 `dota2` 数据库
- 创建 `dota2user` 用户
- 授予权限

**使用方法**:
```bash
mysql -u root -p < scripts/init-database.sql
```

### 2. `init.sql`
**用途**: 创建表结构和插入初始数据

**重要**: 此脚本假设数据库已经存在！

**功能**:
- 创建所有数据表
- 插入初始数据（英雄数据等）

**使用方法**:
```bash
# 确保数据库已存在后执行
mysql -u root -p dota2 < scripts/init.sql
```

### 3. 使用场景

#### 场景 A: 使用 MySQL 容器（Docker）
```bash
# 使用 docker-compose 启动，数据库会自动创建并执行 init.sql
docker-compose --profile mysql up
```
- 数据库由容器自动创建（通过 `MYSQL_DATABASE` 环境变量）
- `init.sql` 会在容器首次启动时自动执行
- **无需手动执行任何脚本**

#### 场景 B: 使用外部 MySQL
**方法 1: 分步执行（推荐）**
```bash
# 步骤 1: 创建数据库和用户
mysql -u root -p < scripts/init-database.sql

# 步骤 2: 创建表和数据
mysql -u root -p dota2 < scripts/init.sql
```

**方法 2: 一次性执行**
```bash
# 先创建数据库
mysql -u root -p < scripts/init-database.sql

# 再执行表和数据初始化
mysql -u root -p dota2 < scripts/init.sql
```

## 环境变量

如果使用外部 MySQL，可以通过环境变量自定义配置：

```bash
# 在 .env 文件中设置
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=dota2
MYSQL_USER=dota2user
MYSQL_PASSWORD=your_password
```

然后修改 `init-database.sql` 中的相应值，或手动创建数据库和用户。

## 注意事项

1. **字符集**: 数据库使用 `utf8mb4` 字符集，支持完整的 Unicode（包括 emoji）
2. **权限**: `dota2user` 用户被授予 `dota2` 数据库的所有权限
3. **安全性**: 生产环境请修改默认密码
4. **备份**: 执行脚本前建议备份现有数据

