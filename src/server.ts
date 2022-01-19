import { expectTypeOf } from 'expect-type';
import { z } from 'zod';
import {
  createRouterWithContext,
  createUseNewContext,
  pipedResolver,
  useZod,
} from './trpc/server';

////////////////////// app ////////////////////////////
// context
type TestContext = {
  user?: {
    id: string;
  };
};

// boilerplate for each app, in like a utils
const resolver = pipedResolver<TestContext>();
const createRouter = createRouterWithContext<TestContext>();
const useNewContextFactory = createUseNewContext<TestContext>();
////////// app middlewares ////////
const useIsAuthed = useNewContextFactory((params) => {
  if (!params.ctx.user) {
    return {
      error: {
        code: 'UNAUTHORIZED',
      },
    };
  }
  return {
    ctx: {
      ...params.ctx,
      user: params.ctx.user,
    },
  };
});

/////////// app root router //////////
export const appRouter = createRouter({
  queries: {
    'post.all': (params) => {
      return {
        data: [
          {
            id: 1,
            title: 'hello tRPC',
          },
        ],
      };
    },
    greeting: resolver(
      // adds zod input validation
      useZod(
        z.object({
          hello: z.string(),
          lengthOf: z
            .string()
            .transform((s) => s.length)
            .optional()
            .default(''),
        }),
      ),
      (params) => {
        type TContext = typeof params.ctx;
        type TInput = typeof params.input;
        expectTypeOf<TContext>().toMatchTypeOf<{ user?: { id: string } }>();
        expectTypeOf<TInput>().toMatchTypeOf<{
          hello: string;
          lengthOf: number;
        }>();

        return {
          data: {
            greeting: 'hello ' + params.ctx.user?.id ?? params.input.hello,
          },
        };
      },
    ),
    whoami: resolver(
      //
      useIsAuthed(),
      ({ ctx }) => {
        return { data: `your id is ${ctx.user.id}` };
      },
    ),
  },
});
