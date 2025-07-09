import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicRoute = createRouteMatcher(["/auth"]);

export default convexAuthNextjsMiddleware(async (request) => {
  // Check if user is authenticated
  const isAuthenticated = await isAuthenticatedNextjs();

  // If user is not authenticated and trying to access a protected route
  if (!isPublicRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }

  // If user is authenticated and trying to access auth page, redirect to home
  if (isPublicRoute(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
