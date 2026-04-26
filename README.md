# ReleaseCheck 🚀

**ReleaseCheck** is a full-stack web application designed to help developers track and manage their software release cycles. It provides a structured checklist for each release, ensuring that critical steps—like merging pull requests and running final tests—are completed before deployment.

## 🌐 Live Demo
The application is deployed and accessible here:  
[https://cactro-22-03-2026.vercel.app/](https://cactro-22-03-2026.vercel.app/)

---

## 🛠 Project Structure & Setup

The repository is organized into two main branches to handle different environments:

* **`main`**: The production branch, optimized for deployment on **Vercel**.
* **`node_2`**: The local development branch, optimized for a standard Node.js environment.

### Local Development (Branch: `node_2`)
To run this project locally, follow these steps:
1.  **Switch Branch:** `git checkout node_2`
2.  **Install Dependencies:** `npm install`
3.  **Environment Variables:** Create a `.env` file in the root directory and add your database connection string:
    ```text
    DATABASE_URL=postgresql://arka:password@localhost:5432/release_db
    ```
4.  **Database Migration:** Run `npx drizzle-kit push` to sync the schema with your local database.
5.  **Build & Launch:**
    ```bash
    npm run build
    npm run start
    ```
    *The local server will be available at **http://localhost:3000***.

---

## 📊 Database Schema

The application uses **PostgreSQL** with **Drizzle ORM**. All release data is stored in a single, efficient table named `releases`:

| Field | Type | Description |
| :--- | :--- | :--- |
| **id** | Serial | Primary Key; unique identifier for each release. |
| **name** | Varchar | The version name (e.g., "v1.0.5"). **Required.** |
| **releaseDate** | Text | The scheduled date and time for the release. **Required.** |
| **additionalInfo** | Text | An optional field for remarks, notes, or extra tasks. |
| **completedSteps** | Array (Text) | Stores the IDs of finished checklist items to track progress. |

---

## 🔌 API Documentation

The application includes a **Resource Route** (API) designed for external consumption by tools like Postman or the VS Code REST Client.

**Production Base URL:** `https://cactro-22-03-2026.vercel.app/api/releases`  
**Local Base URL:** `http://localhost:3000/api/releases`

### Endpoints

#### 1. Fetch All Releases
* **Method:** `GET`
* **Description:** Retrieves a JSON list of all release records.

#### 2. Create a Release
* **Method:** `POST`
* **Body (JSON):**  
```json
    { "name": "v1.0.0", "date": "22-03-2026 11:00", "additionalInfo": "Optional note" }
```
* **Description:** Adds a new release to the database.

#### 3. Update a Release (Edit)
* **Method:** `PATCH`
* **URL Parameter:** `?id=[ReleaseID]`
* **Body (JSON):**
    ```json
    { "steps": ["merge", "tests"], "notes": "Updated remarks" }
    ```
* **Description:** Updates the checklist progress and the remarks for a specific release.

#### 4. Delete a Release
* **Method:** `DELETE`
* **URL Parameter:** `?id=[ReleaseID]`
* **Description:** Permanently removes a release record from the system.

---

## 📝 Testing Tools
The repository includes an `api.http` file for rapid testing.
* In the **`main`** branch, the file is pre-configured with the Vercel production URL.
* In the **`node_2`** branch, the file points to `http://localhost:3000` for local testing.