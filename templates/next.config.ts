import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exports read files from public/ and the project root; body size allows
  // multi-MB screenshot uploads through /api/upload.
  experimental: { serverActions: { bodySizeLimit: "16mb" } },
};

export default nextConfig;
