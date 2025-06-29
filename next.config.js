/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Configure webpack for pdfjs-dist
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        'pdfjs-dist/build/pdf.worker.js': false,
      };
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
        url: false,
        buffer: false,
        stream: false,
        crypto: false,
      };
      
      // Ignore pdfjs worker in client-side bundles
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?js/,
        type: 'asset/resource',
        generator: {
          filename: 'static/worker/[hash][ext][query]',
        },
      });
    }
    
    return config;
  },
  // Ensure proper handling of external packages
  transpilePackages: ['pdfjs-dist'],
  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig; 