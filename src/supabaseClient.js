import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lzvolnnndwpyxyoyldea.supabase.co'
const supabaseKey = 'sb_publishable_pLYlxN0dUlkp7nKYBS4OOA_6YCueyuB'

export const supabase = createClient(supabaseUrl, supabaseKey)