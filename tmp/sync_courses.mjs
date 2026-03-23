import { createClient } from '@supabase/supabase-js'

const ACADEMY_COURSES = [
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
    title: "GSE & Stock Market Fundamentals",
    description: "Master the architecture of the Ghana Stock Exchange and starting your investment journey.",
    level: "Foundational",
    icon: "Globe",
    xpReward: 1000,
    estimatedTime: "2h 30m",
    lessonsCount: 7
  },
  {
    id: "b7e2a9e3-2e4a-4e8b-9d6c-7f5a1b2c3d4e",
    title: "Investment Apps & Digital Tools",
    description: "Navigate the digital landscape of Ghanaian investment platforms.",
    level: "Foundational",
    icon: "Smartphone",
    xpReward: 800,
    estimatedTime: "1h 45m",
    lessonsCount: 4
  },
  {
    id: "a1b2c3d4-e5f6-4a5b-bc6d-7e8f9a0b1c2d",
    title: "Mutual Funds & ETFs",
    description: "Diversify your wealth through professionally managed funds and indices.",
    level: "Professional",
    icon: "BrainCircuit",
    xpReward: 1200,
    estimatedTime: "2h 15m",
    lessonsCount: 4
  },
  {
    id: "f1e2d3c4-b5a6-4987-9abc-0d1e2f3a4b5c",
    title: "Portfolio Management & Strategy",
    description: "Advanced frameworks for risk management and long-term hold strategies.",
    level: "Advanced",
    icon: "Shield",
    xpReward: 2000,
    estimatedTime: "2h 00m",
    lessonsCount: 4
  }
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function syncCourses() {
  console.log('Syncing courses to Supabase...')
  
  for (const course of ACADEMY_COURSES) {
    const { error } = await supabase.from('courses').upsert({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      icon: course.icon,
      xp_reward: course.xpReward,
      total_lessons: course.lessonsCount,
      estimated_time: course.estimatedTime
    })
    
    if (error) {
      console.error(`Error syncing course ${course.title}:`, error.message)
    } else {
      console.log(`Synced: ${course.title}`)
    }
  }
}

syncCourses()
