import { getIngestionJob } from "./ingestion";


export function formatSSEMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function createStatusStream(jobId: string): ReadableStream {
  let intervalId: NodeJS.Timeout | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      const sendStatus = () => {
        if (isClosed) {
          return;
        }

        const job = getIngestionJob(jobId);
        if (!job) {
          controller.enqueue(
            new TextEncoder().encode(
              formatSSEMessage("error", { message: "Job not found" })
            )
          );
          controller.close();
          return;
        }

        const progress =
          job.total_rows > 0
            ? Math.round((job.processed_rows / job.total_rows) * 100)
            : 0;

        const statusData = {
          job_id: job.id,
          status: job.status,
          progress,
          total_rows: job.total_rows,
          processed_rows: job.processed_rows,
          error: job.error,
          started_at: job.started_at?.toISOString(),
          completed_at: job.completed_at?.toISOString(),
        };

        controller.enqueue(
          new TextEncoder().encode(formatSSEMessage("status", statusData))
        );

        if (job.status === "completed" || job.status === "failed") {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          controller.close();
        }
      };

      sendStatus();

      intervalId = setInterval(sendStatus, 500);
    },

    cancel() {
      isClosed = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  });

  return stream;
}

