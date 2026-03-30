import { Form, Link } from "react-router";
import type { Route } from "./+types/home";
import styles from "../styles/releases.module.css";
import { getAllReleases, createRelease, deleteRelease } from "../database/operations.server";

export async function loader() {
  const releases = await getAllReleases();
  return { releases };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name") as string;
    const date = new Date((formData.get("date")).replace('T', ' '));
    const additionalInfo = formData.get("additionalInfo") as string; // Optional

    await createRelease(name, date, additionalInfo);
  } else if (intent === "delete") {
    const id = Number(formData.get("id"));
    await deleteRelease(id);
  }
  return { success: true };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { releases } = loaderData;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>ReleaseCheck</h1>
        <p>Your all-in-one release checklist tool</p>
      </header>

      {/* Main Card Wrapper */}
      <div className={styles.card}> 
        <div className={styles.cardHeader}>
          <h2 style={{ color: "#4f46e5", margin: 0 }}>All releases</h2>
          <Form method="post" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input type="hidden" name="intent" value="create" />
            
            <input 
              name="name" 
              placeholder="v1.0.0" 
              required 
              className={styles.inputField} 
            />
            
            <input 
              name="date" 
              type="datetime-local" 
              required 
              className={styles.inputField}  
            />

            <input 
              name="additionalInfo" 
              placeholder="Additional info (optional)" 
              className={styles.inputField} 
            />

            <button type="submit" className={styles.btnPrimary}>
              + New release
            </button>
          </Form>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Release</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {releases.map((rel) => (
              <tr key={rel.id}>
                <td>{rel.name}</td>
                <td>{rel.displayDate}</td>
                <td>
                  <span className={`${styles.badge} ${styles[`status${rel.status}`]}`}>
                    {rel.status}
                  </span>
                </td>
                <td>
                  <Link to={`/releases/${rel.id}`} style={{ marginRight: "1rem" }}>View 👁</Link>
                  <Form method="post" style={{ display: 'inline' }}>
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={rel.id} />
                    <button type="submit" style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete 🗑</button>
                  </Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> {/* This closes the .card */}
    </div> // This closes the .container
  );
}