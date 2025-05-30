/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["three"],
  images: {
    domains: ["images.unsplash.com", "encrypted-tbn0.gstatic.com"],
  },
};

export default nextConfig;
