import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { isAdmin } from "@/lib/admin";

const isSignInPage = createRouteMatcher(["/giris"]);
const isAdminRoute = createRouteMatcher(["/yonetim(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/");
  }

  if (!isAdminRoute(request)) {
    return;
  }

  if (!(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/giris");
  }

  const token = await convexAuth.getToken();
  if (!token) {
    return nextjsMiddlewareRedirect(request, "/giris");
  }

  try {
    const user = await fetchQuery(api.userFunctions.currentUser, {}, { token });
    if (!isAdmin(user)) {
      return nextjsMiddlewareRedirect(request, "/");
    }
  } catch {
    return nextjsMiddlewareRedirect(request, "/");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
