import { Elysia } from "elysia";
import { getIngestionJob } from "../services/ingestion";
import { createStatusStream } from "../services/sse";

export const statusRoutes = new Elysia({ prefix: "/api/ingest" })
  .get("/status/:jobId", ({ params, set }) => {
    const { jobId } = params;

    const job = getIngestionJob(jobId);
    if (!job) {
      set.status = 404;
      return {
        error: "Job not found",
      };
    }

    // Set SSE headers
    set.headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    };

    // Return the SSE stream
    return new Response(createStatusStream(jobId), {
      headers: set.headers,
    });
  });

