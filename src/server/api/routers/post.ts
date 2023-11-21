import { z } from "zod";
import { PrismaClient } from '@prisma/client';

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const prisma = new PrismaClient();

let post = {
  id: 1,
  name: "Hello World",
};

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      post = { id: post.id + 1, name: input.name };
      return post;
    }),

    getLatest: publicProcedure.query(() => {
      return post;
    }),

    getAll: publicProcedure.query(async () => {
      const allPosts = await prisma.emojiPost.findMany();
      return allPosts;
    }),
});
