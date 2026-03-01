/**
 * Run once to:
 *  1. Rename teacher@learnhub.com → name "Admin", role ADMIN
 *  2. Transfer all courses owned by admin@learnhub.com to teacher@learnhub.com
 *  3. Delete admin@learnhub.com
 *
 * Usage:  npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/update-admin.ts
 * Or:     npx tsx prisma/update-admin.ts
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any)

async function main() {
  const teacherEmail = "teacher@learnhub.com"
  const adminEmail   = "admin@learnhub.com"

  const teacher = await db.user.findUnique({ where: { email: teacherEmail } })
  const oldAdmin = await db.user.findUnique({ where: { email: adminEmail } })

  if (!teacher) {
    console.error(`❌ Could not find ${teacherEmail}. Nothing changed.`)
    return
  }

  // 1. Promote teacher → Admin
  await db.user.update({
    where: { email: teacherEmail },
    data: { name: "Admin", role: "ADMIN" },
  })
  console.log(`✅ Updated ${teacherEmail} → name: "Admin", role: ADMIN`)

  if (oldAdmin) {
    // 2. Transfer courses owned by old admin to new admin (formerly teacher)
    const transferred = await db.course.updateMany({
      where: { teacherId: oldAdmin.id },
      data:  { teacherId: teacher.id },
    })
    console.log(`✅ Transferred ${transferred.count} course(s) from old admin to new admin`)

    // 3. Delete old admin
    await db.user.delete({ where: { email: adminEmail } })
    console.log(`✅ Deleted old admin account: ${adminEmail}`)
  } else {
    console.log(`ℹ️  Old admin (${adminEmail}) not found — skipping transfer/delete`)
  }

  console.log("🎉 Done! Login with: teacher@learnhub.com / Teacher@123")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
