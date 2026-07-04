CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`scenario_id` text NOT NULL,
	`author_name` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`grade_level` text NOT NULL,
	`subjects` text NOT NULL,
	`difficulty` integer NOT NULL,
	`duration` integer NOT NULL,
	`idea` text NOT NULL,
	`content` text NOT NULL,
	`equipment` text,
	`curriculum_connection` text,
	`teaching_design` text,
	`assessment` text,
	`images` text,
	`tinkercad_link` text,
	`author_name` text,
	`author_id` text,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);