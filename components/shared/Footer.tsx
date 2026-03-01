import Link from "next/link"
import { BookOpen, Twitter, Github, Youtube, Mail, GraduationCap } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-[#060B1F] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-base text-white">LearnHub</span>
                <span className="text-[9px] text-white/40 font-medium tracking-widest uppercase">IIT Madras</span>
              </div>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-5">
              Foundation and Diploma courses aligned with the official IIT Madras BS Degree program.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Mail, href: "#" },
              ].map(({ icon: Icon, href }) => (
                <a key={href + Icon.name} href={href} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-white/90 uppercase tracking-widest">Programs</h3>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><Link href="/courses?level=FOUNDATION" className="hover:text-white transition-colors flex items-center gap-1.5"><BookOpen className="h-3 w-3" />Foundation Program</Link></li>
              <li><Link href="/courses?level=DIPLOMA" className="hover:text-white transition-colors flex items-center gap-1.5"><GraduationCap className="h-3 w-3" />Diploma Program</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">All Courses</Link></li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-white/90 uppercase tracking-widest">Learn</h3>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><Link href="/student" className="hover:text-white transition-colors">My Learning</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-white/90 uppercase tracking-widest">Company</h3>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 mt-10 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <p>&copy; {new Date().getFullYear()} LearnHub. All rights reserved.</p>
          <p>Aligned with IIT Madras BS Degree Program curriculum.</p>
        </div>
      </div>
    </footer>
  )
}
