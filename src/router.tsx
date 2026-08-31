import { createRouter as createTanStackRouter, createMemoryHistory } from "@tanstack/react-router";
import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

// Monkey-patch to fix potential undefined errors in SSR/HMR
if (typeof window === 'undefined') {
  // @ts-ignore
  globalThis.__TSR__ = globalThis.__TSR__ || {};
}

export function getRouter() {
  const isServer = typeof document === 'undefined';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Content rarely changes between page views: serve instantly from cache
        // instead of re-fetching (and flashing empty) on every mount.
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
      },
    },
  });

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    history: isServer ? createMemoryHistory() : undefined as any,
    // Ship the server-fetched query cache to the browser so content is present
    // in the very first paint instead of popping in one block at a time.
    dehydrate: () => ({ queryState: dehydrate(queryClient) as any }),
    hydrate: (dehydrated: any) => {
      if (dehydrated?.queryState) hydrate(queryClient, dehydrated.queryState);
    },
  });

  // Ensure router stores are initialized
  if (!router.stores) {
    (router as any).stores = {
      state: {
        subscribe: () => () => {},
        get: () => ({
          status: 'idle',
          resolvedData: {},
          error: null,
          isFetching: false,
          isLoading: false,
        })
      }
    };
  }

  if (!isServer) {
    (window as any).__TSR__ = { router };
  }

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
