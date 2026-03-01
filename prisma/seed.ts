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

  // Single admin account (teacher@learnhub.com promoted to ADMIN)
  const adminEmail = "teacher@learnhub.com"
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const hash = await bcryptjs.hash("Teacher@123", 12)
    await db.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hash,
        role: "ADMIN",
      },
    })
    console.log("✅ Admin created:  teacher@learnhub.com  /  Teacher@123")
  } else {
    console.log("ℹ️  Admin already exists, skipping.")
  }

  console.log("🎉 Seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
