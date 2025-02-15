/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // 优化输出文件
    outputFileTracingRoot: undefined,
    // 排除不需要的文件
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
        'node_modules/@next/swc-linux-x64-gnu',
        'node_modules/@next/swc-linux-x64-musl',
        'node_modules/sharp',
      ],
    },
  },
  // 优化构建输出
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig 