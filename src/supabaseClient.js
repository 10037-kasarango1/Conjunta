import { createClient } from '@supabase/supabase-js';

// To be more secure: .env file. 
const supabaseURL = "https://cjfnrigmwpenydbkvmdx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqZm5yaWdtd3BlbnlkYmt2bWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcyNjUxNTMsImV4cCI6MjAyMjg0MTE1M30.5TFFRMwN7y4Nx-50pyhrlFmNM9OH1eOG2csuxdsQ1no";

export const supabase = createClient(supabaseURL, supabaseAnonKey);