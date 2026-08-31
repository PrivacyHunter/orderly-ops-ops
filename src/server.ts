import { createStartHandler, defaultRenderHandler } from '@tanstack/react-start/server'
import { getRouter } from './router'

const handler = createStartHandler({
  handler: defaultRenderHandler,
})

export default {
  fetch: async (request: Request) => {
    try {
      if (!request || !request.url) {
        return new Response('Bad Request', { status: 400 });
      }

      // getRouter() ensures we have a clean router instance for each request
      const router = getRouter();
      
      const response = await handler(request);
      return response;
    } catch (err: any) {
      console.error('[SSR] Handler Error:', err);
      
      const errorData = {
        message: err.message || 'Internal Server Error',
        type: 'SSR_HANDLER_ERROR',
        url: request.url
      };

      return new Response(JSON.stringify(errorData), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
