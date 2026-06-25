import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.66", "localhost", "127.0.0.1"],
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
