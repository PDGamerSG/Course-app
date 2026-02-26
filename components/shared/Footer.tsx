import Link from "next/link"
import { BookOpen, Twitter, Github, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-primary">LearnHub</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Quality education for everyone. Learn from expert teachers at your own pace.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Learn</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/courses" className="hover:text-foreground transition-colors">All Courses</Link></li>
              <li><Link href="/courses?filter=free" className="hover:text-foreground transition-colors">Free Courses</Link></li>
              <li><Link href="/dashboard/student" className="hover:text-foreground transition-colors">My Learning</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Teach</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard/teacher" className="hover:text-foreground transition-colors">Teacher Dashboard</Link></li>
              <li><Link href="/dashboard/teacher/courses/new" className="hover:text-foreground transition-colors">Create Course</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LearnHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
