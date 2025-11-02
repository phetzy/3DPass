import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// Default Convex Auth middleware; no custom gating for now.
export default convexAuthNextjsMiddleware();

export const config = {
  // Run on all routes except static assets and Next internals
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
