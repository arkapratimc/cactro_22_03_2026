import { Form, Link, useSubmit } from "react-router";
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
    const date = formData.get("date");
    const additionalInfo = formData.get("additionalInfo") as string; // Optional

    await createRelease(name, date, additionalInfo);
  } else if (intent === "delete") {
    const id = Number(formData.get("id"));
    await deleteRelease(id);
  }
  return { success: true };
}
/**
 * Converts "YYYY-MM-DDTHH:mm" to "DD-MM-YYYY HH:mm"
 */
export const formatReleaseDate = (dateString: string): string => {
  if (!dateString) return "";

  // Split the date and time parts
  const [datePart, timePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-");

  return `${day}-${month}-${year} ${timePart}`;
};
export default function Home({ loaderData }: Route.ComponentProps) {
  const { releases } = loaderData;

  const submit = useSubmit();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // 1. Get the raw date from the input (e.g., "2026-04-26T14:30")
    const rawDate = formData.get("date") as string;
    // console.log(rawDate)
    // 2. Convert to your desired string format
    // For example, a readable locale string or just a clean ISO string
    const formattedDate = formatReleaseDate(rawDate); 
    console.log(formattedDate)
    // 3. Swap the value in formData before submitting
    formData.set("date", formattedDate);

    // 4. Submit imperatively to your action
    submit(formData, { method: "post" });
  };

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
          <Form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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