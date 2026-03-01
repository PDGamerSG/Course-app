import Link from "next/link"
import {
  BookOpen, GraduationCap, Users, Target, Heart,
  Award, Globe, Lightbulb, ArrowRight, CheckCircle,
  Mail, MapPin, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "About Us — LearnHub",
  description: "Learn about LearnHub, our mission, and our team dedicated to making IIT Madras BS Degree accessible to everyone.",
}

const TEAM = [
  {
    name: "Arjun Sharma",
    role: "Founder & CEO",
    bio: "IIT Madras alumnus. Built LearnHub to make quality education accessible to every student attempting the BS Degree.",
    initials: "AS",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    name: "Priya Nair",
    role: "Head of Content",
    bio: "Former IIT Madras teaching assistant. Curates all course content to match the official syllabus perfectly.",
    initials: "PN",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    name: "Rahul Verma",
    role: "Lead Instructor",
    bio: "PhD candidate at IIT Madras. Teaches Mathematics and Statistics with a focus on practical understanding.",
    initials: "RV",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Sneha Reddy",
    role: "Student Success",
    bio: "Dedicated to ensuring every student gets the support they need to complete their degree journey.",
    initials: "SR",
    gradient: "from-emerald-500 to-teal-600",
  },
]

const VALUES = [
  {
    icon: Target,
    title: "Aligned with IITM",
    desc: "Every course follows the official IIT Madras BS Degree syllabus — no guesswork, no gaps.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Heart,
    title: "Student First",
    desc: "We design everything around the student experience — from video quality to doubt resolution.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Globe,
    title: "Accessible to All",
    desc: "Affordable pricing and flexible learning so geography or budget never holds you back.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Lightbulb,
    title: "Constantly Improving",
    desc: "We update content every semester based on the latest IITM curriculum and student feedback.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
]

const STATS = [
  { value: "10,000+", label: "Students enrolled", icon: Users },
  { value: "500+", label: "Hours of content", icon: BookOpen },
  { value: "4.8★", label: "Average rating", icon: Award },
  { value: "3+", label: "Years running", icon: Sparkles },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#060B1F] text-white -mt-[76px] pt-[76px]">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)", backgroundSize: "60px 60px" }}
        />
        <div className="absolute top-[-80px] left-[10%] w-[500px] h-[400px] bg-blue-700/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-[5%] w-[400px] h-[300px] bg-indigo-700/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-20 md:py-28 text-center">
          <Badge className="mb-5 px-4 py-1.5 bg-white/10 text-white/80 border-white/15 text-xs font-semibold uppercase tracking-widest hover:bg-white/10">
            Our Story
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight">
            Helping students{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              crack the IITM degree
            </span>
          </h1>
          <p className="text-white/55 text-lg max-w-2xl mx-auto leading-relaxed">
            LearnHub was built by IIT Madras alumni who experienced firsthand how difficult it is to
            find quality study material for the BS Degree program. We built the platform we wish we had.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/30 bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-sm mb-1">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-3xl font-black tracking-tight">{s.value}</span>
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs font-semibold uppercase tracking-widest border-primary/30 text-primary">
              Our Mission
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-5 tracking-tight leading-tight">
              Make the IIT Madras BS Degree achievable for everyone
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The IIT Madras Online BS Degree is a world-class program — but without proper guidance,
              many students struggle to keep up. LearnHub bridges that gap with structured video lectures,
              notes, and live sessions aligned to the official curriculum.
            </p>
            <ul className="space-y-3">
              {[
                "Courses follow the exact IITM semester structure",
                "Taught by IIT Madras faculty and alumni",
                "Regular updates every semester",
                "Affordable — everyone deserves quality education",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-blue-200/50 dark:border-blue-900/30 bg-gradient-to-br from-blue-50/60 to-background dark:from-blue-950/20 p-6 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Foundation Program</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Core subjects for Semester 1–4: Mathematics, Statistics, English, and Computational Thinking.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-indigo-200/50 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50/60 to-background dark:from-indigo-950/20 p-6 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Diploma Program</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Advanced specializations for Semester 5–8: Data Science, ML, Business Analytics, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/20 border-y border-border/30 py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-widest border-primary/30 text-primary">
              What We Stand For
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Our values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-background rounded-2xl border border-border/50 p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
                <div className={`w-11 h-11 rounded-xl ${v.bg} flex items-center justify-center mb-4`}>
                  <v.icon className={`h-5 w-5 ${v.color}`} />
                </div>
                <h3 className="font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-widest border-primary/30 text-primary">
            The Team
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">People behind LearnHub</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
            A small team of IIT Madras alumni and educators passionate about making the BS Degree accessible.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member) => (
            <div key={member.name} className="bg-card rounded-2xl border border-border/50 p-6 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-xl font-black mx-auto mb-4 shadow-lg`}>
                {member.initials}
              </div>
              <h3 className="font-bold text-sm">{member.name}</h3>
              <p className="text-xs text-primary font-semibold mb-3">{member.role}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="relative overflow-hidden bg-[#060B1F] text-white py-24">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(90deg,#6366f1 1px,transparent 1px)", backgroundSize: "60px 60px" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Get in touch</h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto leading-relaxed">
            Have questions about our courses or the IIT Madras BS Degree program?
            We&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <div className="flex items-center gap-2.5 text-white/70 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              support@learnhub.in
            </div>
            <div className="flex items-center gap-2.5 text-white/70 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <MapPin className="h-4 w-4" />
              </div>
              Chennai, Tamil Nadu, India
            </div>
          </div>
          <Button size="lg" asChild className="h-12 px-10 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl shadow-blue-900/50 border-0 rounded-xl font-semibold">
            <Link href="/courses">
              Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
