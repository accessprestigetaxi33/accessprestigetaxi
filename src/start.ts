import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { goneResponse, isRemovedPage } from "./lib/removed-pages";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  if (new URL(request.url).pathname.startsWith("/lovable/")) {
    return next();
  }
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Pages retirées : redirection 301 vers /page-indisponible (noindex).
// Les anciens articles de blog inexistants (404) sont aussi redirigés.
const removedPagesMiddleware = createMiddleware().server(async ({ next, request }) => {
  const { pathname } = new URL(request.url);
  if (request.method === "GET" || request.method === "HEAD") {
    if (isRemovedPage(pathname)) return goneResponse();
  }
  const result = await next();
  const status = (result as { response?: Response }).response?.status ?? (result as unknown as Response).status;
  if (pathname.startsWith("/blog/") && status === 404) {
    return goneResponse();
  }
  return result;
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, removedPagesMiddleware, csrfMiddleware],
}));
