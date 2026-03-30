import {
    db 
} from "./db.server.js";
import {releases} from "./schema.server.js"
import { eq, sql, desc } from "drizzle-orm";

function formatDate(date) {
  const pad = (n) => n.toString().padStart(2, '0');

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // months are 0-based
  const year = date.getFullYear();

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Fetches all releases and calculates the status based on step completion.
 * This satisfies the "View list of all releases" requirement.
 */
export async function getAllReleases(totalStepsCount: number = 7) {
  const data = await db.select().from(releases).orderBy(desc(releases.releaseDate));
  
  return data.map((r) => {
    const count = r.completedSteps?.length ?? 0;
    let status: "Planned" | "Ongoing" | "Done" = "Planned";
    
    if (count === totalStepsCount) status = "Done";
    else if (count > 0) status = "Ongoing";


    // --- NEW LOGIC START ---
    // Extract the raw year, month, day, etc. from the DB date 
    // This ignores the timezone "shift" the browser usually does.
    const d = r.releaseDate;
    const displayDate = formatDate(d);
    
    return { ...r, status, displayDate };
  });
}

/**
 * Creates a new release entry.
 */
export async function createRelease(name: string, date: Date, info?: string) {
  return await db.insert(releases).values({
    name,
    releaseDate: date,
    additionalInfo: info,
  }).returning();
}

/**
 * Toggles a step in the array using PostgreSQL native array functions.
 * Satisfies "Check / uncheck steps" requirement.
 */
export async function toggleStep(releaseId: number, stepId: string) {
  return await db.update(releases)
    .set({
      completedSteps: sql`CASE 
        WHEN ${stepId} = ANY(completed_steps) THEN array_remove(completed_steps, ${stepId})
        ELSE array_append(completed_steps, ${stepId})
      END`
    })
    .where(eq(releases.id, releaseId));
}

/**
 * Updates the text area for a specific release.
 */
export async function updateNotes(releaseId: number, notes: string) {
  return await db.update(releases)
    .set({ additionalInfo: notes })
    .where(eq(releases.id, releaseId));
}

/**
 * Deletes a release.
 */
export async function deleteRelease(releaseId: number) {
  return await db.delete(releases).where(eq(releases.id, releaseId));
}


/**
 * Fetches a single release by its primary key.
 * Used by the loader in release-detail.tsx
 */
export async function getReleaseById(id: number) {
  const [result] = await db
    .select()
    .from(releases)
    .where(eq(releases.id, id))
    .limit(1);

  return result ?? null;
}

export async function updateRelease(id: number, steps: string[], notes: string) {
  return await db.update(releases)
    .set({ completedSteps: steps, additionalInfo: notes })
    .where(eq(releases.id, id));
}