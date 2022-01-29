import type { appRouter } from './server';
import { createClient, createBetterClient } from './trpc/client';
import { createRouterProxy } from './trpc/client/createRouterProxy';

const client = createClient<typeof appRouter>();
const betterClient = createBetterClient<typeof appRouter>();

betterClient.post.some();

const { queries } = createRouterProxy<typeof appRouter>();

async function main() {
  {
    // you can CMD+click `greeting` below to get to the definition
    const greeting = await client.query(queries.greeting, { hello: 'world' });
    // you can CMD+click `post.all` below to get to the definition
    const posts = await client.query(queries['post.all']);

    console.log({ greeting, posts });
  }

  {
    // we can also use string based path if we prefer that
    // (but then you can't click your way to the backend)
    const greeting = await client.query('greeting', { hello: 'string' });
    const posts = await client.query('post.all');

    console.log({ greeting, posts });
  }

  // full dot-notation RPC
  // no "Go to definition
  {
    const greeting = await betterClient.greeting({ hello: 'string' });
    const posts = await betterClient.post.all();
    console.log({ greeting, posts });
  }
}

main();
