import type { User } from "@clerk/nextjs/api";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
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


export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

    getAll: publicProcedure.query(async () => {
      const allPosts = await prisma.emojiPost.findMany({
        take:100,
        orderBy: [
          { createdAt: "desc" }
        ]
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

    create: privateProcedure.input(
      z.object({
        content: z.string().emoji().min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const authorId = ctx.userId;
      const post = await ctx.prisma.emojiPost.create({
        data: {
                authorId,
                content: input.content,
        },
      });

      return post;
    }),
});
