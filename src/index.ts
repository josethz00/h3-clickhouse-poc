import { Elysia } from "elysia";
import { ingestRoutes } from "./routes/ingest";
import { tripsRoutes } from "./routes/trips";
import { statusRoutes } from "./routes/status";

const app = new Elysia()
  .get("/", () => ({
    message: "H3 ClickHouse Data Pipeline API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      ingest: "POST /api/ingest",
      weeklyAverage: "GET /api/trips/weekly-average",
      ingestionStatus: "GET /api/ingestion/status/:jobId",
      jobStatus: "GET /api/ingestion/job/:jobId",
    },
  }))
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .use(ingestRoutes)
  .use(tripsRoutes)
  .use(statusRoutes)
  .onError(({ code, error }) => {
    console.error(`Error [${code}]:`, error);
    let message: string;
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else {
      message = JSON.stringify(error);
    }
    return {
      error: code,
      message,
    };
  });

const port = Number.parseInt(process.env.PORT || "3000", 10);

try {
  app.listen(port);
  console.log(
    `🚀 H3 ClickHouse Data Pipeline API running at http://${app.server?.hostname}:${app.server?.port}`
  );
} catch (error) {
  console.error("Failed to initialize schema:", error);
  process.exit(1);
}
