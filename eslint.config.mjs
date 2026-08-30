import nextConfig from "eslint-config-next/core-web-vitals";

export default [
  ...nextConfig,
  {
    rules: {
      // Existing storefront hydration/local-storage synchronization intentionally
      // uses effects; keep the repo's established behavior without false errors.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
