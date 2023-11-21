import { z } from "zod";
import { PrismaClient } from '@prisma/client';

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";

import { filterUserForClient } from "~/server/helpers/filterUserForClient";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */ 
  prefix: "@upstash/ratelimit",
});

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
        content: z.string().emoji("Only emojis are allowed").min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const authorId = ctx.userId;
      
      const { success } = await ratelimit.limit(authorId); 

      if (!success) throw new TRPCError({code: "TOO_MANY_REQUESTS"});

      const post = await ctx.prisma.emojiPost.create({
        data: {
                authorId,
                content: input.content,
        },
      });

      return post;
    }),
});
