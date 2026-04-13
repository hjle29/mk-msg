import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL
    ? { adapterPath: require.resolve('@next-community/adapter-vercel') }
    : {}),
};

export default nextConfig;
