/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add Turbopack-specific configurations
  experimental: {
    // Enable some optimizations that might help with the error
    serverActions: true,
    serverComponentsExternalPackages: [],
  },
  // Add API URL if it's not already set in environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  }
};

export default nextConfig;
