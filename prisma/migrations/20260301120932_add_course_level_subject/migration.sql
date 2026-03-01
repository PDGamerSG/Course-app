-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('FOUNDATION', 'DIPLOMA');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "level" "CourseLevel" NOT NULL DEFAULT 'FOUNDATION',
ADD COLUMN     "subject" TEXT;
