import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { authService } from "./_core/sdk";

export const appRouter = router({
  auth: router({
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const player = await db.getPlayerByUsername(input.username);

        if (!player) {
          throw new Error("Invalid username or password");
        }

        const isValidPassword = await authService.verifyPassword(input.password, player.password);

        if (!isValidPassword) {
          throw new Error("Invalid username or password");
        }

        if (player.isDeleted === 'y') {
          throw new Error("Account is deleted");
        }

        const token = await authService.createSessionToken(player);

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
          success: true,
          player: {
            id: player.id,
            nickname: player.nickname,
            username: player.username,
            icon: player.icon,
          },
        };
      }),

    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        return null;
      }

      return {
        id: ctx.user.id,
        nickname: ctx.user.nickname,
        username: ctx.user.username,
        icon: ctx.user.icon,
      };
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  players: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        mmrRank: z.string().optional(),
        preferredPositions: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getPlayers(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlayerById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        nickname: z.string().min(1),
        username: z.string().min(1),
        password: z.string().min(1),
        bio: z.string().optional(),
        mmrRank: z.string().optional(),
        mentalScore: z.number().min(0).max(100).optional(),
        preferredPositions: z.string().optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const hashedPassword = await authService.hashPassword(input.password);

        await db.createPlayer({
          ...input,
          password: hashedPassword,
          createUserId: ctx.user.id,
          updateUserId: ctx.user.id,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nickname: z.string().min(1).optional(),
        username: z.string().min(1).optional(),
        password: z.string().optional(),
        bio: z.string().optional(),
        mmrRank: z.string().optional(),
        mentalScore: z.number().min(0).max(100).optional(),
        preferredPositions: z.string().optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;

        if (data.password) {
          data.password = await authService.hashPassword(data.password);
        }

        await db.updatePlayer(id, {
          ...data,
          updateUserId: ctx.user.id,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deletePlayer(input.id);
        return { success: true };
      }),

    stats: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlayerStats(input.id);
      }),

    heroStats: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlayerHeroStats(input.id);
      }),

    rivals: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlayerRivals(input.id);
      }),
  }),

  heroes: router({
    list: publicProcedure
      .input(z.object({
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getHeroes(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getHeroById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        nameLoc: z.string().min(1),
        nameEnglishLoc: z.string().optional(),
        orderId: z.number().optional(),
        primaryAttr: z.number(),
        bioLoc: z.string().optional(),
        hypeLoc: z.string().optional(),
        npeDescLoc: z.string().optional(),
        indexImg: z.string().optional(),
        topImg: z.string().optional(),
        topVideo: z.string().optional(),
        cropsImg: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createHero({
          ...input,
          createUserId: ctx.user.id,
          updateUserId: ctx.user.id,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        nameLoc: z.string().min(1).optional(),
        nameEnglishLoc: z.string().optional(),
        orderId: z.number().optional(),
        primaryAttr: z.number().optional(),
        bioLoc: z.string().optional(),
        hypeLoc: z.string().optional(),
        npeDescLoc: z.string().optional(),
        indexImg: z.string().optional(),
        topImg: z.string().optional(),
        topVideo: z.string().optional(),
        cropsImg: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await db.updateHero(id, {
          ...data,
          updateUserId: ctx.user.id,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteHero(input.id);
        return { success: true };
      }),

    stats: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getHeroStats(input.id);
      }),

    playerStats: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getHeroPlayerStats(input.id);
      }),
  }),

  matches: router({
    list: publicProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
      }).optional())
      .query(async ({ input }) => {
        const matches = await db.getMatches();
        return {
          matches: matches,
          total: matches.length,
        };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getMatchById(input.id);
      }),

    details: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getMatchDetails(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        matchDate: z.string(),
        winnerSide: z.enum(["radiant", "dire"]),
        participants: z.array(z.object({
          playerId: z.number(),
          playerNickname: z.string(),
          heroId: z.number(),
          teamSide: z.enum(["radiant", "dire"]),
          position: z.number(),
          isMvp: z.number().default(0),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const matchData = {
          matchDate: new Date(input.matchDate),
          winnerSide: input.winnerSide,
          createUserId: ctx.user.id,
          updateUserId: ctx.user.id,
        };
        const participantData = input.participants.map(p => ({
          matchId: 0, // Will be set by the database
          playerId: p.playerId,
          playerNickname: p.playerNickname,
          heroId: p.heroId,
          heroName: '', // Will be updated by createMatch function
          teamSide: p.teamSide,
          position: p.position,
          isMvp: p.isMvp ? 1 : 0,
          createUserId: ctx.user.id,
          updateUserId: ctx.user.id,
        }));
        await db.createMatch(matchData, participantData);
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        matchDate: z.string().optional(),
        winnerSide: z.enum(["radiant", "dire"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        if (data.matchDate) {
          data.matchDate = new Date(data.matchDate);
        }
        await db.updateMatch(id, {
          ...data,
          updateUserId: ctx.user.id,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMatch(input.id);
        return { success: true };
      }),
  }),

  dashboard: router({
    stats: publicProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
