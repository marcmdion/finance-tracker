import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoBasePath = "/finance-tracker";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? repoBasePath : "",
  assetPrefix: isGithubPages ? `${repoBasePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
