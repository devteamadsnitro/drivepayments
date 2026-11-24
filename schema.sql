-- Esquema MySQL de DrivePayments (MySQL 8)
-- Generado desde la base de datos del proyecto.

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `name` text DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `loginMethod` varchar(64) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `passwordHash` varchar(255) DEFAULT NULL,
  `sessionVersion` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `users_openId_unique` (`openId`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=360001;

CREATE TABLE IF NOT EXISTS `leads` (
  `id` varchar(32) NOT NULL,
  `reference` varchar(32) NOT NULL,
  `status` enum('new','review','docs','approved','declined','archived') NOT NULL DEFAULT 'new',
  `storageKey` varchar(512) NOT NULL,
  `sizeBytes` int NOT NULL DEFAULT '0',
  `docCount` int NOT NULL DEFAULT '0',
  `summaryIv` varchar(64) DEFAULT NULL,
  `summaryCiphertext` text DEFAULT NULL,
  `notesCiphertext` text DEFAULT NULL,
  `source` varchar(64) NOT NULL DEFAULT 'web',
  `receivedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastViewedAt` timestamp NULL DEFAULT NULL,
  `wrappedKey` varchar(1024) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `leads_reference_unique` (`reference`),
  KEY `leads_status_idx` (`status`),
  KEY `leads_received_idx` (`receivedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE IF NOT EXISTS `leadEvents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leadId` varchar(32) NOT NULL,
  `action` varchar(32) NOT NULL,
  `detail` varchar(255) DEFAULT NULL,
  `actorEmail` varchar(320) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `leadEvents_leadId_leads_id_fk` (`leadId`),
  KEY `leadEvents_lead_idx` (`leadId`),
  CONSTRAINT `leadEvents_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=120001;

