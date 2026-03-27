import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Use a project-relative build output directory to avoid invalid concatenated paths
  distDir: "src/.next",
  turbopack: {
    // Point Turbopack at the app source directory using a relative path
    root: "src",
  },
};

export default nextConfig;
