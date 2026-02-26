import { config } from "dotenv"
// Load .env.local first (Next.js convention), then .env
config({ path: ".env.local" })
config({ path: ".env" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcryptjs from "bcryptjs"

const connectionString = process.env.DATABASE_URL!

const adapter = new PrismaPg({ connectionString })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = new PrismaClient({ adapter } as any)

async function main() {
  console.log("🌱 Seeding database...")

  // Dummy admin
  const adminEmail = "admin@learnhub.com"
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const hash = await bcryptjs.hash("Admin@123", 12)
    await db.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hash,
        role: "ADMIN",
      },
    })
    console.log("✅ Admin created:  admin@learnhub.com  /  Admin@123")
  } else {
    console.log("ℹ️  Admin already exists, skipping.")
  }

  // Dummy teacher
  const teacherEmail = "teacher@learnhub.com"
  const existingTeacher = await db.user.findUnique({ where: { email: teacherEmail } })
  if (!existingTeacher) {
    const hash = await bcryptjs.hash("Teacher@123", 12)
    await db.user.create({
      data: {
        name: "Demo Teacher",
        email: teacherEmail,
        password: hash,
        role: "TEACHER",
      },
    })
    console.log("✅ Teacher created: teacher@learnhub.com  /  Teacher@123")
  } else {
    console.log("ℹ️  Teacher already exists, skipping.")
  }

  console.log("🎉 Seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
