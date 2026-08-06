CREATE TABLE `learner_states` (
	`user_id` text PRIMARY KEY NOT NULL,
	`state_json` text NOT NULL,
	`updated_at` text NOT NULL
);
