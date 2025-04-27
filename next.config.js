/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Changed from 'export' to 'standalone'
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['placehold.co'] // Add any image domains you're using
  },
};

module.exports = nextConfig;

