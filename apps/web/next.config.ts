import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const config: NextConfig = {
  ...(process.env.DOCKER_BUILD ? { output: "standalone" } : {}),
  outputFileTracingRoot: path.join(__dirname, "../.."),
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  typescript: { ignoreBuildErrors: false },
  agentRules: false,
  // forbidden() renders app/forbidden.tsx with HTTP 403.
  experimental: { authInterrupts: true, serverActions: { bodySizeLimit: "6mb" } },
  env: {
    SATYA_BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
};

export default withNextIntl(config);
