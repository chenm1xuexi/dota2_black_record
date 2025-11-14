import { and, desc, eq, sql, or, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { players, heroes, matches, matchParticipants, InsertPlayer, InsertHero, InsertMatch, InsertMatchParticipant } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!process.env.DATABASE_URL) {
    console.error("[Database] DATABASE_URL environment variable is not set");
    return null;
  }

  if (!_db) {
    try {
      _db = drizzle(process.env.DATABASE_URL, {
        logger: {
          logQuery(query, params) {
            console.log('[SQL]', query, '\n[PARAMS]', params);
          },
        },
      });
      console.log("[Database] Connection initialized successfully");
    } catch (error: any) {
      console.error("[Database] Failed to initialize connection:", error);
      console.error("[Database] Error details:", {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });
      _db = null;
    }
  }
  return _db;
}

// ============ Players ============

export async function getPlayers(filters?: {
  search?: string;
  mmrRank?: string;
  preferredPositions?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(players.isDeleted, 'n')];
  
  if (filters?.search) {
    conditions.push(like(players.nickname, `%${filters.search}%`));
  }
  
  if (filters?.mmrRank) {
    conditions.push(eq(players.mmrRank, filters.mmrRank));
  }
  
  if (filters?.preferredPositions) {
    conditions.push(like(players.preferredPositions, `%${filters.preferredPositions}%`));
  }

  return await db.select().from(players).where(and(...conditions)).orderBy(desc(players.createTime));
}

export async function getPlayerById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(players).where(and(eq(players.id, id), eq(players.isDeleted, 'n'))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPlayerByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection not available. Please check DATABASE_URL environment variable.");
  }

  try {
    const result = await db.select().from(players).where(and(eq(players.username, username), eq(players.isDeleted, 'n'))).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.error("[Database] Error in getPlayerByUsername:", error);
    console.error("[Database] Error details:", {
      message: error?.message,
      code: error?.code,
      errno: error?.errno,
      sqlState: error?.sqlState,
      sqlMessage: error?.sqlMessage,
    });
    throw new Error(`Database query failed: ${error?.message || error}`);
  }
}

export async function createPlayer(player: InsertPlayer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(players).values(player);
  return result;
}

export async function updatePlayer(id: number, player: Partial<InsertPlayer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(players).set({ ...player, updateTime: new Date() }).where(eq(players.id, id));
}

export async function deletePlayer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(players).set({ isDeleted: 'y', updateTime: new Date() }).where(eq(players.id, id));
}

export async function getPlayerStats(playerId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get all matches for this player
  const participations = await db
    .select({
      matchId: matchParticipants.matchId,
      teamSide: matchParticipants.teamSide,
      heroId: matchParticipants.heroId,
      winnerSide: matches.winnerSide,
      matchDate: matches.matchDate,
    })
    .from(matchParticipants)
    .innerJoin(matches, eq(matchParticipants.matchId, matches.id))
    .where(and(
      eq(matchParticipants.playerId, playerId),
      eq(matchParticipants.isDeleted, 'n'),
      eq(matches.isDeleted, 'n')
    ))
    .orderBy(desc(matches.matchDate));

  const totalMatches = participations.length;
  const wins = participations.filter(p => p.teamSide === p.winnerSide).length;
  const losses = totalMatches - wins;
  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

  return {
    totalMatches,
    wins,
    losses,
    winRate,
    recentMatches: participations.slice(0, 10),
  };
}

export async function getPlayerHeroStats(playerId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      heroId: matchParticipants.heroId,
      heroName: heroes.name,
      nameLoc: heroes.nameLoc,
      count: sql<number>`COUNT(*)`,
      wins: sql<number>`SUM(CASE WHEN ${matchParticipants.teamSide} = ${matches.winnerSide} THEN 1 ELSE 0 END)`,
    })
    .from(matchParticipants)
    .innerJoin(matches, eq(matchParticipants.matchId, matches.id))
    .innerJoin(heroes, eq(matchParticipants.heroId, heroes.id))
    .where(and(
      eq(matchParticipants.playerId, playerId),
      eq(matchParticipants.isDeleted, 'n'),
      eq(matches.isDeleted, 'n'),
      eq(heroes.isDeleted, 'n')
    ))
    .groupBy(matchParticipants.heroId, heroes.name, heroes.nameLoc)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(10);

  return result.map(r => ({
    heroId: r.heroId,
    heroName: r.heroName,
    nameLoc: r.nameLoc,
    count: Number(r.count),
    wins: Number(r.wins),
    winRate: Number(r.count) > 0 ? (Number(r.wins) / Number(r.count)) * 100 : 0,
  }));
}

export async function getPlayerRivals(playerId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get all matches where this player participated
  const playerMatches = await db
    .select({
      matchId: matchParticipants.matchId,
      teamSide: matchParticipants.teamSide,
      winnerSide: matches.winnerSide,
    })
    .from(matchParticipants)
    .innerJoin(matches, eq(matchParticipants.matchId, matches.id))
    .where(and(
      eq(matchParticipants.playerId, playerId),
      eq(matchParticipants.isDeleted, 'n'),
      eq(matches.isDeleted, 'n')
    ));

  if (playerMatches.length === 0) return [];

  const matchIds = playerMatches.map(m => m.matchId);

  // Get opponents from these matches
  const opponents = await db
    .select({
      playerId: matchParticipants.playerId,
      playerNickname: matchParticipants.playerNickname,
      teamSide: matchParticipants.teamSide,
      matchId: matchParticipants.matchId,
    })
    .from(matchParticipants)
    .where(and(
      inArray(matchParticipants.matchId, matchIds),
      eq(matchParticipants.isDeleted, 'n')
    ));

  // Calculate win rate against each opponent
  const rivalStats = new Map<number, { nickname: string; matches: number; wins: number }>();

  for (const opponent of opponents) {
    if (opponent.playerId === playerId) continue;

    const playerMatch = playerMatches.find(m => m.matchId === opponent.matchId);
    if (!playerMatch || playerMatch.teamSide === opponent.teamSide) continue;

    const stats = rivalStats.get(opponent.playerId) || { nickname: opponent.playerNickname, matches: 0, wins: 0 };
    stats.matches++;
    if (playerMatch.winnerSide === playerMatch.teamSide) {
      stats.wins++;
    }
    rivalStats.set(opponent.playerId, stats);
  }

  // Convert to array and calculate win rates
  const rivals = Array.from(rivalStats.entries()).map(([id, stats]) => ({
    playerId: id,
    playerNickname: stats.nickname,
    matches: stats.matches,
    wins: stats.wins,
    winRate: stats.matches > 0 ? (stats.wins / stats.matches) * 100 : 0,
  }));

  // Sort by lowest win rate (rivals)
  rivals.sort((a, b) => a.winRate - b.winRate);

  return rivals.slice(0, 5);
}

// ============ Heroes ============

export async function getHeroes(filters?: { search?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(heroes.isDeleted, 'n')];

  if (filters?.search) {
    conditions.push(
      or(
        like(heroes.name, `%${filters.search}%`),
        like(heroes.nameLoc, `%${filters.search}%`),
        like(heroes.nameEnglishLoc, `%${filters.search}%`)
      )!
    );
  }

  return await db.select().from(heroes).where(and(...conditions)).orderBy(desc(heroes.createTime));
}

export async function getHeroById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(heroes).where(and(eq(heroes.id, id), eq(heroes.isDeleted, 'n'))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createHero(hero: InsertHero) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(heroes).values(hero);
  return result;
}

export async function updateHero(id: number, hero: Partial<InsertHero>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(heroes).set({ ...hero, updateTime: new Date() }).where(eq(heroes.id, id));
}

export async function deleteHero(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(heroes).set({ isDeleted: 'y', updateTime: new Date() }).where(eq(heroes.id, id));
}

export async function getHeroStats(heroId: number) {
  const db = await getDb();
  if (!db) return null;

  const participations = await db
    .select({
      teamSide: matchParticipants.teamSide,
      winnerSide: matches.winnerSide,
    })
    .from(matchParticipants)
    .innerJoin(matches, eq(matchParticipants.matchId, matches.id))
    .where(and(
      eq(matchParticipants.heroId, heroId),
      eq(matchParticipants.isDeleted, 'n'),
      eq(matches.isDeleted, 'n')
    ));

  const totalMatches = participations.length;
  const wins = participations.filter(p => p.teamSide === p.winnerSide).length;
  const losses = totalMatches - wins;
  const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

  // Get total match count for pick rate
  const totalMatchesResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${matches.id})` })
    .from(matches)
    .where(eq(matches.isDeleted, 'n'));

  const allMatches = Number(totalMatchesResult[0]?.count || 0);
  const pickRate = allMatches > 0 ? (totalMatches / allMatches) * 100 : 0;

  return {
    totalMatches,
    wins,
    losses,
    winRate,
    pickRate,
  };
}

export async function getHeroPlayerStats(heroId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      playerId: matchParticipants.playerId,
      playerNickname: matchParticipants.playerNickname,
      count: sql<number>`COUNT(*)`,
      wins: sql<number>`SUM(CASE WHEN ${matchParticipants.teamSide} = ${matches.winnerSide} THEN 1 ELSE 0 END)`,
    })
    .from(matchParticipants)
    .innerJoin(matches, eq(matchParticipants.matchId, matches.id))
    .where(and(
      eq(matchParticipants.heroId, heroId),
      eq(matchParticipants.isDeleted, 'n'),
      eq(matches.isDeleted, 'n')
    ))
    .groupBy(matchParticipants.playerId, matchParticipants.playerNickname)
    .orderBy(desc(sql`COUNT(*)`));

  return result.map(r => ({
    playerId: r.playerId,
    playerNickname: r.playerNickname,
    count: Number(r.count),
    wins: Number(r.wins),
    winRate: Number(r.count) > 0 ? (Number(r.wins) / Number(r.count)) * 100 : 0,
  }));
}

// ============ Matches ============

export async function getMatches(filters?: {
  startDate?: Date;
  endDate?: Date;
  playerIds?: number[];
  winnerSide?: 'radiant' | 'dire';
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(matches.isDeleted, 'n')];
  
  if (filters?.startDate) {
    conditions.push(sql`${matches.matchDate} >= ${filters.startDate}`);
  }
  
  if (filters?.endDate) {
    conditions.push(sql`${matches.matchDate} <= ${filters.endDate}`);
  }
  
  if (filters?.winnerSide) {
    conditions.push(eq(matches.winnerSide, filters.winnerSide));
  }

  let query = db.select().from(matches).where(and(...conditions)).orderBy(desc(matches.matchDate));

  let matchList = await query;

  // Filter by player IDs if provided
  if (filters?.playerIds && filters.playerIds.length > 0) {
    const matchIds = matchList.map(m => m.id);
    if (matchIds.length === 0) return [];

    const participantMatches = await db.select({ matchId: matchParticipants.matchId })
      .from(matchParticipants)
      .where(and(
        inArray(matchParticipants.matchId, matchIds),
        inArray(matchParticipants.playerId, filters.playerIds),
        eq(matchParticipants.isDeleted, 'n')
      ));

    const filteredMatchIds = new Set(participantMatches.map(p => p.matchId));
    matchList = matchList.filter(m => filteredMatchIds.has(m.id));
  }

  // Get participants for all matches with hero names and icons
  const matchIds = matchList.map(m => m.id);
  if (matchIds.length === 0) return [];

  const allParticipants = await db
    .select({
      id: matchParticipants.id,
      matchId: matchParticipants.matchId,
      playerId: matchParticipants.playerId,
      playerNickname: matchParticipants.playerNickname,
      heroId: matchParticipants.heroId,
      heroName: heroes.name,
      nameLoc: heroes.nameLoc,
      heroIcon: heroes.icon,
      playerIcon: players.icon,
      teamSide: matchParticipants.teamSide,
      position: matchParticipants.position,
      isMvp: matchParticipants.isMvp,
    })
    .from(matchParticipants)
    .leftJoin(heroes, eq(matchParticipants.heroId, heroes.id))
    .leftJoin(players, eq(matchParticipants.playerId, players.id))
    .where(and(
      inArray(matchParticipants.matchId, matchIds),
      eq(matchParticipants.isDeleted, 'n')
    ));

  // Group participants by match
  const participantsByMatch = new Map<number, typeof allParticipants>();
  allParticipants.forEach(p => {
    if (!participantsByMatch.has(p.matchId)) {
      participantsByMatch.set(p.matchId, []);
    }
    participantsByMatch.get(p.matchId)!.push(p);
  });

  return matchList.map(match => ({
    ...match,
    participants: participantsByMatch.get(match.id) || []
  }));
}

export async function getMatchById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(matches).where(and(eq(matches.id, id), eq(matches.isDeleted, 'n'))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getMatchDetails(id: number) {
  const match = await getMatchById(id);
  if (!match) return null;

  const participants = await getMatchParticipants(id);

  return {
    ...match,
    participants,
  };
}

export async function getMatchParticipants(matchId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: matchParticipants.id,
      playerId: matchParticipants.playerId,
      playerNickname: matchParticipants.playerNickname,
      heroId: matchParticipants.heroId,
      heroName: heroes.name,
      nameLoc: heroes.nameLoc,
      heroIcon: heroes.icon,
      playerIcon: players.icon,
      teamSide: matchParticipants.teamSide,
      position: matchParticipants.position,
      isMvp: matchParticipants.isMvp,
    })
    .from(matchParticipants)
    .leftJoin(heroes, eq(matchParticipants.heroId, heroes.id))
    .leftJoin(players, eq(matchParticipants.playerId, players.id))
    .where(and(
      eq(matchParticipants.matchId, matchId),
      eq(matchParticipants.isDeleted, 'n'),
      eq(heroes.isDeleted, 'n')
    ))
    .orderBy(matchParticipants.teamSide, matchParticipants.position);
}

export async function createMatch(match: InsertMatch, participants: InsertMatchParticipant[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const matchResult = await db.insert(matches).values(match);
  const matchId = Number(matchResult[0].insertId);

  // Get hero names in Chinese for all participants
  const heroIds = [...new Set(participants.map(p => p.heroId))];
  const heroResults = await db
    .select({ id: heroes.id, nameLoc: heroes.nameLoc })
    .from(heroes)
    .where(inArray(heroes.id, heroIds));

  const heroNameMap = new Map(heroResults.map(h => [h.id, h.nameLoc]));

  // Update participants with Chinese hero names
  const participantsWithMatchId = participants.map(p => ({
    ...p,
    matchId,
    heroName: heroNameMap.get(p.heroId) || p.heroName,
  }));

  await db.insert(matchParticipants).values(participantsWithMatchId);

  return matchId;
}

export async function updateMatch(id: number, match: Partial<InsertMatch>, participants?: InsertMatchParticipant[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(matches).set({ ...match, updateTime: new Date() }).where(eq(matches.id, id));

  if (participants) {
    // Soft delete old participants
    await db.update(matchParticipants).set({ isDeleted: 'y', updateTime: new Date() }).where(eq(matchParticipants.matchId, id));

    // Get hero names in Chinese for all participants
    const heroIds = [...new Set(participants.map(p => p.heroId))];
    const heroResults = await db
      .select({ id: heroes.id, nameLoc: heroes.nameLoc })
      .from(heroes)
      .where(inArray(heroes.id, heroIds));

    const heroNameMap = new Map(heroResults.map(h => [h.id, h.nameLoc]));

    // Update participants with Chinese hero names
    const participantsWithMatchId = participants.map(p => ({
      ...p,
      matchId: id,
      heroName: heroNameMap.get(p.heroId) || p.heroName,
    }));

    // Insert new participants
    await db.insert(matchParticipants).values(participantsWithMatchId);
  }
}

export async function deleteMatch(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(matches).set({ isDeleted: 'y', updateTime: new Date() }).where(eq(matches.id, id));
  await db.update(matchParticipants).set({ isDeleted: 'y', updateTime: new Date() }).where(eq(matchParticipants.matchId, id));
}

// ============ Statistics ============

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const totalMatchesResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(matches)
    .where(eq(matches.isDeleted, 'n'));

  const totalPlayersResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(players)
    .where(eq(players.isDeleted, 'n'));

  const totalHeroesResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(heroes)
    .where(eq(heroes.isDeleted, 'n'));

  const radiantWinsResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(matches)
    .where(and(eq(matches.winnerSide, 'radiant'), eq(matches.isDeleted, 'n')));

  const totalMatches = Number(totalMatchesResult[0]?.count || 0);
  const radiantWins = Number(radiantWinsResult[0]?.count || 0);
  const radiantWinRate = totalMatches > 0 ? (radiantWins / totalMatches) * 100 : 50;

  const playerWinRates = await getPlayerWinRates();
  const topHeroes = await getTopHeroes(10);
  const recentMatches = await getRecentMatches(10);

  return {
    totalMatches,
    totalPlayers: Number(totalPlayersResult[0]?.count || 0),
    totalHeroes: Number(totalHeroesResult[0]?.count || 0),
    radiantWinRate,
    direWinRate: 100 - radiantWinRate,
    playerWinRates,
    topHeroes,
    recentMatches,
  };
}

export async function getPlayerWinRates() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      playerId: matchParticipants.playerId,
      playerNickname: matchParticipants.playerNickname,
      totalMatches: sql<number>`COUNT(*)`,
      wins: sql<number>`SUM(CASE WHEN ${matchParticipants.teamSide} = ${matches.winnerSide} THEN 1 ELSE 0 END)`,
      playerIcon: players.icon,
    })
    .from(matchParticipants)
    .innerJoin(matches, eq(matchParticipants.matchId, matches.id))
    .leftJoin(players, eq(matchParticipants.playerId, players.id))
    .where(and(
      eq(matchParticipants.isDeleted, 'n'),
      eq(matches.isDeleted, 'n'),
      eq(players.isDeleted, 'n')
    ))
    .groupBy(matchParticipants.playerId, matchParticipants.playerNickname, players.icon)
    .orderBy(desc(sql`SUM(CASE WHEN ${matchParticipants.teamSide} = ${matches.winnerSide} THEN 1 ELSE 0 END) / COUNT(*)`));

  return result.map(r => ({
    playerId: r.playerId,
    playerNickname: r.playerNickname,
    totalMatches: Number(r.totalMatches),
    wins: Number(r.wins),
    winRate: Number(r.totalMatches) > 0 ? (Number(r.wins) / Number(r.totalMatches)) * 100 : 0,
    playerIcon: r.playerIcon,
  }));
}

export async function getTopHeroes(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      heroId: matchParticipants.heroId,
      heroName: heroes.name,
      nameLoc: heroes.nameLoc,
      count: sql<number>`COUNT(*)`,
      wins: sql<number>`SUM(CASE WHEN ${matchParticipants.teamSide} = ${matches.winnerSide} THEN 1 ELSE 0 END)`,
      icon: heroes.icon,
    })
    .from(matchParticipants)
    .innerJoin(matches, eq(matchParticipants.matchId, matches.id))
    .innerJoin(heroes, eq(matchParticipants.heroId, heroes.id))
    .where(and(
      eq(matchParticipants.isDeleted, 'n'),
      eq(matches.isDeleted, 'n'),
      eq(heroes.isDeleted, 'n')
    ))
    .groupBy(matchParticipants.heroId, heroes.name, heroes.nameLoc, heroes.icon)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit);

  return result.map(r => ({
    heroId: r.heroId,
    heroName: r.heroName,
    nameLoc: r.nameLoc,
    count: Number(r.count),
    wins: Number(r.wins),
    winRate: Number(r.count) > 0 ? (Number(r.wins) / Number(r.count)) * 100 : 0,
    icon: r.icon,
  }));
}

export async function getRecentMatches(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const recentMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.isDeleted, 'n'))
    .orderBy(desc(matches.matchDate))
    .limit(limit);

  const matchesWithParticipants = await Promise.all(
    recentMatches.map(async (match) => {
      const participants = await getMatchParticipants(match.id);
      return { ...match, participants };
    })
  );

  return matchesWithParticipants;
}

export async function getWinRateTrend() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      matchDate: matches.matchDate,
      winnerSide: matches.winnerSide,
    })
    .from(matches)
    .where(eq(matches.isDeleted, 'n'))
    .orderBy(matches.matchDate);

  return result;
}

export async function getAttendanceStats(year: number, month: number) {
  const db = await getDb();
  if (!db) return null;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const monthMatches = await db
    .select({ id: matches.id, matchDate: matches.matchDate })
    .from(matches)
    .where(and(
      eq(matches.isDeleted, 'n'),
      sql`${matches.matchDate} >= ${startDate}`,
      sql`${matches.matchDate} <= ${endDate}`
    ));

  const totalMatches = monthMatches.length;
  const matchIds = monthMatches.map(m => m.id);

  if (matchIds.length === 0) {
    return { totalMatches: 0, playerAttendance: [], matchDates: [] };
  }

  const participations = await db
    .select({
      playerId: matchParticipants.playerId,
      playerNickname: matchParticipants.playerNickname,
      matchId: matchParticipants.matchId,
    })
    .from(matchParticipants)
    .where(and(
      inArray(matchParticipants.matchId, matchIds),
      eq(matchParticipants.isDeleted, 'n')
    ));

  const playerStats = new Map<number, { nickname: string; count: number }>();

  for (const p of participations) {
    const stats = playerStats.get(p.playerId) || { nickname: p.playerNickname, count: 0 };
    stats.count++;
    playerStats.set(p.playerId, stats);
  }

  const playerAttendance = Array.from(playerStats.entries()).map(([id, stats]) => ({
    playerId: id,
    playerNickname: stats.nickname,
    matchCount: stats.count,
    attendanceRate: totalMatches > 0 ? (stats.count / totalMatches) * 100 : 0,
  }));

  playerAttendance.sort((a, b) => b.attendanceRate - a.attendanceRate);

  // Group matches by date
  const matchDateMap = new Map<string, number>();
  for (const match of monthMatches) {
    const dateStr = match.matchDate.toISOString().split('T')[0];
    matchDateMap.set(dateStr, (matchDateMap.get(dateStr) || 0) + 1);
  }

  const matchDates = Array.from(matchDateMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    totalMatches,
    playerAttendance,
    matchDates,
  };
}
