/*
 * Database initialization script for external MySQL
 * 
 * This script creates the database and user for external MySQL setup.
 * 
 * Usage:
 *   mysql -u root -p < scripts/init-database.sql
 * 
 * After running this script, you can run init.sql to create tables and data:
 *   mysql -u root -p dota2 < scripts/init.sql
 */

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `dota2` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create user if not exists (MySQL 8.0+ syntax)
CREATE USER IF NOT EXISTS 'dota2user'@'%' IDENTIFIED BY 'dota2password123';

-- Grant privileges
GRANT ALL PRIVILEGES ON `dota2`.* TO 'dota2user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Use the database
USE `dota2`;

