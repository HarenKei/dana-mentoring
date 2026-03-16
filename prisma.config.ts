import { defineConfig } from 'prisma/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// dotenv 라이브러리 없이 .env.local 직접 파싱
try {
  const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env.local이 없는 환경 (프로덕션 등)
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
