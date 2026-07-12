import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Allowed `quality` values for next/image. Photography site-wide is
     * served at 100 (see <SiteImage>); 75 stays available as the default
     * for anything that doesn't opt in.
     */
    qualities: [75, 100],
  },
};

export default nextConfig;
