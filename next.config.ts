import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Use the default Next.js dist directory so platforms like Vercel
  // find .next/routes-manifest.json without extra configuration.
  distDir: ".next",
  turbopack: {
    // Point Turbopack at the app source directory using a relative path
    root: "src",
  },
};

export default nextConfig;
