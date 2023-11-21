import type { User } from "@clerk/nextjs/api";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";

const filterUserForClient = (user: User) => {
  return {
          id: user.id,
          username: user.username,
          profilePicture: user.profileImageUrl
        }
}

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
      const allPosts = await prisma.emojiPost.findMany({
        take:100,
      });

      const users = (await clerkClient.users.getUserList({
        userId: allPosts.map((post) => post.authorId),
        limit:100,
      })).map(filterUserForClient);

      console.log(users);
      
      return allPosts.map((post) => {
        const author = users.find((users) => users.id === post.authorId);

        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (!author || !author.username) 
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Author for post not found",
          });

        return {
        post,
        author: {
          ...author,
          username: author.username,
        },
      }});
    }),
});
