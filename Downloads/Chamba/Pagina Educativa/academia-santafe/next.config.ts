import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Deshabilitar overlay de errores en desarrollo completamente
  devIndicators: {
    appIsrStatus: false,
  },
  // Deshabilitar overlay de errores
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
