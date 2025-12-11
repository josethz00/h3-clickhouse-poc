import { Elysia, t } from "elysia";
import { createIngestionJob, ingestCSVFile } from "../services/ingestion";
import { mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";

export const ingestRoutes = new Elysia({ prefix: "/api/ingest" })
  .post(
    "/",
    async ({ body }) => {
      const file = body.file;
      if (!file) return { error: "No file provided" };

      const job = createIngestionJob();

      await mkdir("/tmp/uploads", { recursive: true });

      const filePath = `/tmp/uploads/${job.id}.csv`;

      const nodeStream = createWriteStream(filePath);
      const writable = new WritableStream({
        write(chunk) {
          return new Promise((resolve, reject) => {
            nodeStream.write(chunk, err => (err ? reject(err) : resolve()));
          });
        },
        close() {
          nodeStream.end();
        },
        abort(err) {
          nodeStream.destroy(err);
        }
      });

      await file.stream().pipeTo(writable);

      void ingestCSVFile(filePath, job.id).catch(err =>
        console.error(`Ingestion job ${job.id} failed:`, err)
      );

      return {
        job_id: job.id,
        status: job.status,
        message: "Ingestion started",
      };
    },
    {
      body: t.Object({
        file: t.File(),
      }),
      maxBodySize: 5 * 1024 * 1024 * 1024,
    }
  );
