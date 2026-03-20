const config = {
  backendUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://it3030-paf-2026-smart-campus-group-production.up.railway.app",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
};

export default config;
