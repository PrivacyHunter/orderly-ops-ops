import { getRouter } from './src/router';

async function test() {
  const router = getRouter();
  const result = router.getMatchedRoutes('/');
  console.log('Result[0] is array:', Array.isArray(result[0]));
  console.log('Result[0] length:', result[0]?.length);
  console.log('Result[1] (params):', result[1]);
  console.log('Result[2] (foundRoute):', !!result[2]);
}

test().catch(console.error);
