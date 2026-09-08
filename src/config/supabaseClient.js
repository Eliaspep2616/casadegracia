// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lzvolnnndwpyxyoyldea.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dm9sbm5uZHdweXh5b3lsZGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTkyMjEsImV4cCI6MjA5MTE5NTIyMX0.voqNusvnbFPyjnfxg-cyKEpkLBsISInqQtZncmFe3f0' // USA LA LLAVE LEGACY ANON (eyJ...)

export const supabase = createClient(supabaseUrl, supabaseKey)