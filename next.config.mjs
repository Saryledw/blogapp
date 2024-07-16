/** @type {import('next').NextConfig} */
const nextConfig = {

	images: {
    loader: 'custom',
    loaderFile: './app/lib/custom-loader.ts',
  },

};

export default nextConfig;
