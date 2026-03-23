import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  const result = []
  
  result.push('--- Courses ---')
  const { data: courses } = await supabase.from('courses').select('*')
  result.push(JSON.stringify(courses, null, 2))

  result.push('--- Lessons ---')
  const { data: lessons, error: lessonsError } = await supabase.from('lessons').select('*')
  if (lessonsError) result.push('Lessons table error: ' + lessonsError.message)
  else result.push(JSON.stringify(lessons, null, 2))

  fs.writeFileSync('tmp/db_schema.json', result.join('\n\n'))
}

checkTables()
