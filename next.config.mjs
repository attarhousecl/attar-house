/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
