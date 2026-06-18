/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'santizzima.com' }],
        destination: 'https://www.santizzima.com/:path*',
        permanent: true,
      },
    ]
  },
  allowedDevOrigins: [
    'vm-project-database-connection.vusercontent.net',
    'localhost',
    '127.0.0.1',
  ],
}

export default nextConfig
