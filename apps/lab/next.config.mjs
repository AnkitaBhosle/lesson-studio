/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ls/schema", "@ls/orchestrator", "@ls/agents", "@ls/models", "@ls/media", "@ls/fixtures"],
};
export default nextConfig;
