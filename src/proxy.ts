import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isRestaurantStaffRoute = pathname.startsWith("/restaurant/dashboard");

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isRestaurantStaffRoute && role !== "RESTAURANT_STAFF" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const isProtectedCustomerRoute = ["/cart", "/checkout", "/orders", "/profile"].some((p) =>
    pathname.startsWith(p)
  );

  if (isProtectedCustomerRoute && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/restaurant/dashboard/:path*", "/cart", "/checkout/:path*", "/orders/:path*", "/profile/:path*"],
};
