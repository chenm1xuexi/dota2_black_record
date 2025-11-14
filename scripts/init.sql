-- Dota 2 Battle Management System Database Initialization
-- This script runs when the MySQL container is first created

-- Set timezone
SET time_zone = '+00:00';

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS dota2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dota2;

-- Set default charset
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Tables will be created by Drizzle migrations
-- This file only initializes database-level settings

-- Create default admin user (password: admin123)
-- Note: Password should be changed after first login
-- The actual user will be created through the application

-- Insert initial data if needed
-- This will be handled by the application migration system

SET FOREIGN_KEY_CHECKS = 1;

-- Create indexes for better performance
-- These will also be created by Drizzle migrations

-- Log initialization completion
SELECT 'Database initialization completed successfully' AS status;
