CREATE TABLE `heroes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`name_loc` varchar(100) NOT NULL,
	`name_english_loc` varchar(100),
	`order_id` int,
	`primary_attr` int NOT NULL,
	`bio_loc` text,
	`hype_loc` text,
	`npe_desc_loc` text,
	`index_img` varchar(255),
	`top_img` varchar(255),
	`top_video` varchar(255),
	`crops_img` varchar(255),
	`isDeleted` enum('y','n') NOT NULL DEFAULT 'n',
	`createTime` timestamp NOT NULL,
	`updateTime` timestamp NOT NULL,
	`createUserId` int,
	`updateUserId` int,
	CONSTRAINT `heroes_id` PRIMARY KEY(`id`),
	CONSTRAINT `heroes_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `matchParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`playerId` int NOT NULL,
	`playerNickname` varchar(100) NOT NULL,
	`heroId` int NOT NULL,
	`heroName` varchar(100) NOT NULL,
	`teamSide` enum('radiant','dire') NOT NULL,
	`position` int NOT NULL,
	`isMvp` int NOT NULL DEFAULT 0,
	`isDeleted` enum('y','n') NOT NULL DEFAULT 'n',
	`createTime` timestamp NOT NULL,
	`updateTime` timestamp NOT NULL,
	`createUserId` int,
	`updateUserId` int,
	CONSTRAINT `matchParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchDate` datetime NOT NULL,
	`winnerSide` enum('radiant','dire') NOT NULL,
	`isDeleted` enum('y','n') NOT NULL DEFAULT 'n',
	`createTime` timestamp NOT NULL,
	`updateTime` timestamp NOT NULL,
	`createUserId` int,
	`updateUserId` int,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nickname` varchar(100) NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`bio` text,
	`mmrRank` varchar(50),
	`mentalScore` int DEFAULT 50,
	`preferredPositions` varchar(50),
	`icon` varchar(255),
	`isDeleted` enum('y','n') NOT NULL DEFAULT 'n',
	`createTime` timestamp NOT NULL,
	`updateTime` timestamp NOT NULL,
	`createUserId` int,
	`updateUserId` int,
	CONSTRAINT `players_id` PRIMARY KEY(`id`),
	CONSTRAINT `players_nickname_unique` UNIQUE(`nickname`),
	CONSTRAINT `players_username_unique` UNIQUE(`username`)
);
