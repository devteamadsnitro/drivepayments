CREATE TABLE `leadEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` varchar(32) NOT NULL,
	`action` varchar(32) NOT NULL,
	`detail` varchar(255),
	`actorEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leadEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` varchar(32) NOT NULL,
	`reference` varchar(32) NOT NULL,
	`status` enum('new','review','docs','approved','declined','archived') NOT NULL DEFAULT 'new',
	`storageKey` varchar(512) NOT NULL,
	`sizeBytes` int NOT NULL DEFAULT 0,
	`docCount` int NOT NULL DEFAULT 0,
	`summaryIv` varchar(64),
	`summaryCiphertext` text,
	`notesCiphertext` text,
	`source` varchar(64) NOT NULL DEFAULT 'web',
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastViewedAt` timestamp,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `leads_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
ALTER TABLE `leadEvents` ADD CONSTRAINT `leadEvents_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `leadEvents_lead_idx` ON `leadEvents` (`leadId`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `leads_received_idx` ON `leads` (`receivedAt`);