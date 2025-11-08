// api/src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
export default db; // ✅ Default export
