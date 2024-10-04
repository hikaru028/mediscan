/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['datawithimages.s3.ap-southeast-2.amazonaws.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'datawithimages.s3.ap-southeast-2.amazonaws.com',
                pathname: '/images/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*', // Proxy to Backend
            },
        ];
    },
};

export default nextConfig;
