/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three"],
  images: {
    // domains: [
    //   "images.unsplash.com",
    //   "encrypted-tbn0.gstatic.com",
    // ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "embra.site",
      },
    ],
  },
};

export default nextConfig;
