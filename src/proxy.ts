import { NextResponse, type NextRequest } from "next/server";

// The Workflow DevKit Local World delivers queue messages by POSTing to
// `http://localhost:<port>/.well-known/workflow/v1/*` from inside this same
// process, so those endpoints (and anything under /api/workflow) only need to
// be reachable on a localhost Host. Requests arriving through the public
// domain get a 404.
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (!LOCAL_HOST.test(host)) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/.well-known/workflow/:path*", "/api/workflow/:path*"],
};
