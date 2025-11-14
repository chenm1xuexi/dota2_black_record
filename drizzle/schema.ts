import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, datetime, decimal } from "drizzle-orm/mysql-core";

/**
 * 选手表 - 记录游戏选手信息
 */
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  nickname: varchar("nickname", { length: 100 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  bio: text("bio"),
  mmrRank: varchar("mmrRank", { length: 50 }),
  mentalScore: int("mentalScore").default(50),
  preferredPositions: varchar("preferredPositions", { length: 50 }),
  icon: varchar("icon", { length: 255 }),
  isDeleted: mysqlEnum("isDeleted", ["y", "n"]).default("n").notNull(),
  createTime: timestamp("createTime").$type<Date>().default(() => new Date()).notNull(),
  updateTime: timestamp("updateTime").$type<Date>().default(() => new Date()).notNull(),
  createUserId: int("createUserId"),
  updateUserId: int("updateUserId"),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * 英雄表 - 记录 Dota 2 英雄信息 (基于 Dota2 官方接口)
 */
export const heroes = mysqlTable("heroes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameLoc: varchar("name_loc", { length: 100 }).notNull(),
  nameEnglishLoc: varchar("name_english_loc", { length: 100 }),
  orderId: int("order_id"),
  primaryAttr: int("primary_attr").notNull(),
  bioLoc: text("bio_loc"),
  hypeLoc: text("hype_loc"),
  npeDescLoc: text("npe_desc_loc"),
  icon: varchar("icon", { length: 255 }),
  indexImg: varchar("index_img", { length: 255 }),
  topImg: varchar("top_img", { length: 255 }),
  topVideo: varchar("top_video", { length: 255 }),
  cropsImg: varchar("crops_img", { length: 255 }),
  isDeleted: mysqlEnum("isDeleted", ["y", "n"]).default("n").notNull(),
  createTime: timestamp("createTime").$type<Date>().default(() => new Date()).notNull(),
  updateTime: timestamp("updateTime").$type<Date>().default(() => new Date()).notNull(),
  createUserId: int("createUserId"),
  updateUserId: int("updateUserId"),
});

export type Hero = typeof heroes.$inferSelect;
export type InsertHero = typeof heroes.$inferInsert;

/**
 * 比赛表 - 记录比赛基本信息
 */
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  matchDate: datetime("matchDate").notNull(),
  winnerSide: mysqlEnum("winnerSide", ["radiant", "dire"]).notNull(),
  isDeleted: mysqlEnum("isDeleted", ["y", "n"]).default("n").notNull(),
  createTime: timestamp("createTime").$type<Date>().default(() => new Date()).notNull(),
  updateTime: timestamp("updateTime").$type<Date>().default(() => new Date()).notNull(),
  createUserId: int("createUserId"),
  updateUserId: int("updateUserId"),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

/**
 * 比赛-选手关联表 - 记录每场比赛的选手参与信息
 */
export const matchParticipants = mysqlTable("matchParticipants", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  playerId: int("playerId").notNull(),
  playerNickname: varchar("playerNickname", { length: 100 }).notNull(),
  heroId: int("heroId").notNull(),
  heroName: varchar("heroName", { length: 100 }).notNull(),
  teamSide: mysqlEnum("teamSide", ["radiant", "dire"]).notNull(),
  position: int("position").notNull(),
  isMvp: int("isMvp").default(0).notNull(),
  isDeleted: mysqlEnum("isDeleted", ["y", "n"]).default("n").notNull(),
  createTime: timestamp("createTime").$type<Date>().default(() => new Date()).notNull(),
  updateTime: timestamp("updateTime").$type<Date>().default(() => new Date()).notNull(),
  createUserId: int("createUserId"),
  updateUserId: int("updateUserId"),
});

export type MatchParticipant = typeof matchParticipants.$inferSelect;
export type InsertMatchParticipant = typeof matchParticipants.$inferInsert;
