import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const releases = pgTable("releases", {
  id: serial("id").primaryKey(),
  
  // Mandatory: Name of the release (e.g., "Version 1.0.1")
  name: varchar("name", { length: 255 }).notNull(),
  
  // Mandatory: Due date for the release
  releaseDate: timestamp("release_date").notNull(),
  
  // Optional: "Additional remarks / tasks" textarea
  additionalInfo: text("additional_info"),
  
  /** * Store completed step IDs here. 
   * Example: ['check_tests', 'merge_pr']
   * This allows you to track progress without a complex join table.
   */
  completedSteps: text("completed_steps").array().notNull().default([]),
});