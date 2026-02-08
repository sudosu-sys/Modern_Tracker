import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // This switches the URL automatically based on where the code is running
    NEXT_PUBLIC_API_MODERN_TRACKER_URL:
      process.env.NODE_ENV === 'production'
        ? 'https://moderntrackerbackend.pythonanywhere.com' // Your Production Backend
        : 'http://127.0.0.1:8000', // Your Local Backend
  },
};

export default nextConfig;
