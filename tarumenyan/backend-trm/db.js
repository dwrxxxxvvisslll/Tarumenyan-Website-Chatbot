require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

// Test connection
;(async () => {
  try {
    const { data, error } = await supabase.from("users").select("count", { count: "exact", head: true })
    if (error) throw error
    console.log("Connected to Supabase database!")
  } catch (err) {
    console.error("Supabase connection error:", err.message)
  }
})()

module.exports = supabase
