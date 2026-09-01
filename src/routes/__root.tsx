import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ConsentBanner } from "@/components/ConsentBanner";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";


import appCss from "../styles.css?url";
import { ThemeProvider } from "@/components/ThemeProvider";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-neon-cyan">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-neon-cyan px-6 py-3 text-sm font-bold text-background transition-all hover:brightness-110"
          >
            GO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#080a0f] px-4 font-syne">
      <div className="glass max-w-xl w-full rounded-[3rem] p-12 text-center border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-8 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black uppercase italic leading-tight text-white">
            System <span className="text-primary">Interrupt</span>
          </h1>
          
          <p className="mt-6 text-muted-foreground text-sm uppercase tracking-[0.2em] font-bold">
            The elite experience was temporarily suspended due to a runtime anomaly.
          </p>
          
          <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
            <p className="text-[10px] font-mono text-muted-foreground break-all opacity-50">
              {error.message}
            </p>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-black uppercase italic tracking-widest hover:scale-105 transition-transform"
            >
              Recover System
            </button>
            <Link
              to="/"
              className="glass border border-white/10 px-8 py-4 rounded-xl font-black uppercase italic tracking-widest hover:bg-white/5 transition-colors text-white"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ambition Sports | Premium Custom Sportswear" },
      { name: "description", content: "High-performance custom sportswear and apparel manufacturer." },
      { property: "og:title", content: "Ambition Sports | Premium Custom Sportswear" },
      { property: "og:description", content: "High-performance custom sportswear and apparel manufacturer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "preconnect", href: "https://fselzoydtmtxomxlximi.supabase.co", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://fselzoydtmtxomxlximi.supabase.co" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,700;1,800&family=Syne:wght@600;700;800&family=Space+Grotesk:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;800&family=Inter:wght@400;600;700;900&display=swap",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Outlet />
            <Toaster position="top-right" theme="dark" closeButton />
            <ConsentBanner />
            <FloatingWhatsApp />
          </ThemeProvider>
        </QueryClientProvider>

        <Scripts />
      </body>
    </html>
  );
}
