import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: path.join(process.cwd(), "src/.next"),
  turbopack: {
    root: path.join(process.cwd(), "src"),
  },
};

export default nextConfig;
