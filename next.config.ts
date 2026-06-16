import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.127', '192.168.1.137', '192.168.1.138'],
  turbopack: {},
};

export default nextConfig;
