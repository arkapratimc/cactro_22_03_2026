import { Form, Link, redirect } from "react-router";
import type { Route } from "./+types/release-detail";
import styles from "../styles/releases.module.css";
import { getReleaseById } from "../database/operations.server";
import {db} from "../database/db.server"
import { releases } from "../database/schema.server";
import { eq } from "drizzle-orm";

const STEPS = [
  { id: "merge", label: "All relevant GitHub pull requests merged" },
  { id: "changelog", label: "CHANGELOG.md files updated" },
  { id: "tests", label: "All tests are passing" },
  { id: "gh_release", label: "Releases in Github created" },
  { id: "deploy_demo", label: "Deployed in demo" },
  { id: "test_demo", label: "Tested thoroughly in demo" },
  { id: "prod", label: "Deployed in production" },
];

export async function loader({ params }: Route.LoaderArgs) {
  const release = await getReleaseById(Number(params.id));
  if (!release) throw new Response("Not Found", { status: 404 });
  return { release };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const id = Number(params.id);
  
  // Get all checked values from the checkboxes named "steps"
  const selectedSteps = formData.getAll("steps") as string[];
  const notes = formData.get("notes") as string;

  // Update both the steps array and the additional info in one go
  await db.update(releases)
    .set({ 
      completedSteps: selectedSteps,
      additionalInfo: notes 
    })
    .where(eq(releases.id, id));

  // Redirect back to the list view after saving
  return redirect("/");
}


const formatToSlashedDate = (dateString: string): string => {
  if (!dateString) return "";

  // Replaces all hyphens with slashes
  return dateString.replace(/-/g, "/");
};

export default function ReleaseDetail({ loaderData }: Route.ComponentProps) {
  const { release } = loaderData;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>ReleaseCheck</h1>
      </header>

      <div className={styles.card} style={{ padding: "1.5rem" }}>
        <nav style={{ marginBottom: "1rem", fontSize: "0.875rem" }}>
          <Link to="/" style={{ color: "#4f46e5" }}>All releases</Link> › {release.name}
        </nav>

        {/* Informational Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#6b7280" }}>RELEASE</label>
            <div style={{ padding: "0.5rem", border: "1px solid #e5e7eb", background: "#f9fafb", color: "#1f2937" }}>
              {release.name}
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#6b7280" }}>DATE</label>
            <div style={{ padding: "0.5rem", border: "1px solid #e5e7eb", background: "#f9fafb", color: "#1f2937" }}>
              {formatToSlashedDate(release.releaseDate)}
            </div>
          </div>
        </div>

        {/* Single Form for Everything */}
        <Form method="post">
          <div style={{ marginBottom: "2rem" }}>
            {STEPS.map((step) => (
              <label key={step.id} className={styles.checkboxRow}>
                <input 
                  type="checkbox" 
                  name="steps" 
                  value={step.id} 
                  defaultChecked={release.completedSteps?.includes(step.id)} 
                />
                <span style={{ color: "#1f2937" }}>{step.label}</span>
              </label>
            ))}
          </div>

          <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#6b7280" }}>
            ADDITIONAL REMARKS
          </label>
          <textarea 
            name="notes" 
            className={styles.textarea} 
            defaultValue={release.additionalInfo ?? ""}
            style={{ color: "#1f2937" }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <button type="submit" className={styles.btnPrimary}>
              Save ✓
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}