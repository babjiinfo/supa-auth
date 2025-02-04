import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || "https://vywgvorhidniinsehzuv.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5d2d2b3JoaWRuaWluc2VoenV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1Njc5MTksImV4cCI6MjA1NDE0MzkxOX0.5oxv4Cb9KkkIX62PNLVtHdGuDwJefX2WRcjT9wUMMHY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
