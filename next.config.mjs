// // next.config.js
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "pixabay.com",
//       },
//       {
//         protocol: "https",
//         hostname: "cdn.pixabay.com",
//       },
//     ],
//   },
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all remote images (not recommended for production)
      },
    ],
  },
};

export default nextConfig;
