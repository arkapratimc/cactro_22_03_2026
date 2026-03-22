import { type RouteConfig,route, index } from "@react-router/dev/routes";

export default [// The main table list (Releases List mockup)
  index("./routes/home.tsx"), 

  // The detail/edit page (Add / update release mockup)
  // :id is the dynamic segment for the release database ID
  route("releases/:id", "./routes/release-detail.tsx"),
// NEW: Resource Route for REST Clients
  route("api/releases", "./routes/api.releases.ts"),] satisfies RouteConfig;
