import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/auth(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Check if user is authenticated
  const { userId } = await auth();

  // If user is not authenticated and trying to access a protected route
  if (!isPublicRoute(req) && !userId) {
    const url = new URL("/auth", req.url);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access auth page, redirect to home
  if (isPublicRoute(req) && userId) {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
