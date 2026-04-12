const config = {
  backendUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://it3030-paf-2026-smart-campus-group-production.up.railway.app",
  googleClientId:
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "802048326707-14o5iabs5aeltgj0f7afqflbp0n81ige.apps.googleusercontent.com",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
};

export default config;
