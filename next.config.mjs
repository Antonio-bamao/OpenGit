import { getNextDistDir } from "./src/lib/next-dist-dir.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: getNextDistDir(process.env.NODE_ENV)
};

export default nextConfig;

