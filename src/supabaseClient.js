import { createClient } from '@supabase/supabase-js'

// 直接使用 Supabase URL 和匿名密钥
const supabaseUrl = 'https://mkmhxpicrdsoxjwgfyjn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbWh4cGljcmRzb3hqd2dmeWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDg4OTgsImV4cCI6MjA2ODMyNDg5OH0.vbRp-lNBVDMisKYcRcVFHjG4lBMVX9lwqa0VwHDLk80'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 