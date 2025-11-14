import { defineConfig } from "drizzle-kit";

/**
 * 解析并规范化数据库连接字符串
 * 如果密码中包含特殊字符（如 @），需要先进行 URL 编码
 */
function normalizeDatabaseUrl(url: string): string {
  try {
    // 尝试直接解析为 URL
    const parsed = new URL(url);
    // 如果解析成功，说明密码已经正确编码，直接返回
    return url;
  } catch {
    // 如果解析失败，可能是密码中包含特殊字符
    // 格式: mysql://username:password@host:port/database
    // 注意：如果密码包含 @，正则表达式会失败，所以我们需要更智能的解析
    
    // 尝试从后往前解析：先找到最后一个 @（这应该是分隔符）
    const lastAt = url.lastIndexOf('@');
    if (lastAt === -1) {
      // 没有找到 @，返回原字符串让 drizzle 处理错误
      return url;
    }
    
    // 提取 @ 之前的部分（包含用户名和密码）
    const authPart = url.substring(8, lastAt); // 跳过 "mysql://"
    const hostPart = url.substring(lastAt + 1);
    
    // 分离用户名和密码（第一个冒号是分隔符）
    const colonIndex = authPart.indexOf(':');
    if (colonIndex === -1) {
      // 没有找到冒号，可能没有密码
      return url;
    }
    
    const username = authPart.substring(0, colonIndex);
    const password = authPart.substring(colonIndex + 1);
    
    // 对用户名和密码进行 URL 编码
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    
    // 重新构建连接字符串
    return `mysql://${encodedUsername}:${encodedPassword}@${hostPart}`;
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// 规范化连接字符串，处理密码中的特殊字符
const normalizedUrl = normalizeDatabaseUrl(connectionString);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: normalizedUrl,
  },
});
