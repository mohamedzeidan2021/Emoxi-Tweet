import type { User } from "@clerk/nextjs/api";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  
    getUserByUsername: publicProcedure.input(z.object({username: z.string()})).
    query(async ({ input }) => {
        const [user] = await clerkClient.users.getUserList({
            username: [input.username],
        });

        if (!user) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR", 
                message: "User not found.",
            });
        }

        return filterUserForClient(user);
    }),

});
