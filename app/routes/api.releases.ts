import type { Route } from "./+types/api.releases";
import { 
  getAllReleases, 
  createRelease, 
  updateRelease, 
  deleteRelease 
} from "../database/operations.server";

// GET /api/releases
export async function loader() {
  const allReleases = await getAllReleases();
  return Response.json(allReleases);
}

// POST, PATCH, DELETE /api/releases
export async function action({ request }: Route.ActionArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  // --- CREATE (POST) ---
  if (request.method === "POST") {
    const body = await request.json();
    if (!body.name || !body.date) {
      return Response.json({ error: "Name and Date required" }, { status: 400 });
    }
    const newRel = await createRelease(body.name, new Date(body.date), body.additionalInfo);
    return Response.json(newRel, { status: 201 });
  }

  // ID is required for Update and Delete
  if (!id) {
    return Response.json({ error: "Release ID required in query params" }, { status: 400 });
  }
  const releaseId = Number(id);

  // --- UPDATE (PATCH) ---
  if (request.method === "PATCH") {
    const body = await request.json(); // Expects { steps: string[], notes: string }
    await updateRelease(releaseId, body.steps, body.notes);
    return Response.json({ message: "Updated successfully" });
  }

  // --- DELETE (DELETE) ---
  if (request.method === "DELETE") {
    await deleteRelease(releaseId);
    return Response.json({ message: "Deleted successfully" });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}