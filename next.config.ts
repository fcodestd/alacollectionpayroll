/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mengabaikan error TypeScript saat deploy
  typescript: {
    ignoreBuildErrors: true,
  },
  // Mengabaikan warning/error ESLint saat deploy
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
