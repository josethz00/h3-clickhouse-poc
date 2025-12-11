import { parse } from "csv-parse";
import { createReadStream, unlink } from "node:fs";
import { promisify } from "node:util";
import { getClickHouseClient } from "../db/client";
import { ParsedTrip, IngestionJob } from "../types/trip";
import { parsePointCoord } from "./aggregation";
import { uuidv7 } from "uuidv7";

const unlinkAsync = promisify(unlink);
const jobs = new Map<string, IngestionJob>();
const BATCH_SIZE = 100000;

export function createIngestionJob(): IngestionJob {
  const job: IngestionJob = {
    id: uuidv7(),
    status: "pending",
    total_rows: 0,
    processed_rows: 0,
  };
  jobs.set(job.id, job);
  return job;
}

export function getIngestionJob(jobId: string): IngestionJob | undefined {
  return jobs.get(jobId);
}

export function updateJobStatus(
  jobId: string,
  updates: Partial<IngestionJob>
): void {
  const job = jobs.get(jobId);
  if (job) {
    Object.assign(job, updates);
    jobs.set(jobId, job);
  }
}

async function insertRawTrips(trips: ParsedTrip[]): Promise<void> {
  if (trips.length === 0) return;

  const client = getClickHouseClient();

  const values = trips
    .map((t) => {
      const d = new Date(t.datetime);

      const dt =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0") +
        " " +
        String(d.getHours()).padStart(2, "0") +
        ":" +
        String(d.getMinutes()).padStart(2, "0") +
        ":" +
        String(d.getSeconds()).padStart(2, "0");

      return `(
        '${t.region}',
        ${t.origin_lat ?? "NULL"},
        ${t.origin_lon ?? "NULL"},
        ${t.destination_lat ?? "NULL"},
        ${t.destination_lon ?? "NULL"},
        '${dt}',
        '${t.datasource}'
      )`;
    })
    .join(",\n");

  const query = `
    INSERT INTO raw_trips (
      region,
      origin_lat,
      origin_lon,
      destination_lat,
      destination_lon,
      datetime,
      datasource
    )
    VALUES
    ${values};
  `;

  try {
    await client.command({ query }).then(() => console.log("Inserted batch of", trips.length, "trips"));
  } catch (err) {
    console.log(query);
    throw err;
  }
}


function parseCSVRow(row: Record<string, string>): ParsedTrip | null {
  try {
    const origin = parsePointCoord(row.origin_coord);
    const destination = parsePointCoord(row.destination_coord);
    const datetime = new Date(row.datetime);

    if (Number.isNaN(datetime.getTime())) {
      console.warn(`Invalid datetime: ${row.datetime}`);
      return null;
    }

    return {
      trip_id: uuidv7(),
      region: row.region,
      origin_lat: origin.lat,
      origin_lon: origin.lon,
      destination_lat: destination.lat,
      destination_lon: destination.lon,
      datetime,
      datasource: row.datasource,
    };
  } catch (error) {
    console.warn(`Failed to parse row:`, error);
    return null;
  }
}

async function countCSVRows(filePath: string): Promise<number> {
  const stream = createReadStream(filePath);
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  let count = 0;
  stream.pipe(parser);
  for await (const _ of parser) {
    count++;
  }
  return count;
}

export async function ingestCSVFile(
  filePath: string,
  jobId: string
): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  updateJobStatus(jobId, {
    status: "processing",
    started_at: new Date(),
  });

  try {
    // Count total rows first
    updateJobStatus(jobId, {
      status: "processing",
      // Keep status as processing but indicate we're counting
    });
    
    const totalRows = await countCSVRows(filePath);
    updateJobStatus(jobId, {
      total_rows: totalRows,
    });

    // Now process the file
    const stream = createReadStream(filePath);
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let batch: ParsedTrip[] = [];
    let processedRows = 0;

    stream.pipe(parser);
    for await (const row of parser) {
      const parsedTrip = parseCSVRow(row);
      if (parsedTrip) {
        batch.push(parsedTrip);
        processedRows++;

        if (batch.length >= BATCH_SIZE) {
          await insertRawTrips(batch);

          updateJobStatus(jobId, {
            processed_rows: processedRows,
          });

          /*
            Since ClickHouse inserts are blazingly fast, we add a small delay
            so the users can see progress updates in the job status endpoint. 
            This can be removed in a production system.
          */
          await new Promise(resolve => setTimeout(resolve, 5000));

          batch = [];
        }
      }
    }

    // Process remaining batch
    if (batch.length > 0) {
      await insertRawTrips(batch);
      updateJobStatus(jobId, {
        processed_rows: processedRows,
      });

      /*
        Since ClickHouse inserts are blazingly fast, we add a small delay
        so the users can see progress updates in the job status endpoint. 
        This can be removed in a production system.
      */
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    updateJobStatus(jobId, {
      status: "completed",
      completed_at: new Date(),
      processed_rows: processedRows,
    });

    try {
      await unlinkAsync(filePath);
    } catch (error) {
      console.warn(`Failed to delete temp file ${filePath}:`, error);
    }
  } catch (error) {
    updateJobStatus(jobId, {
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      completed_at: new Date(),
    });
    
    try {
      await unlinkAsync(filePath);
    } catch (unlinkError) {
      console.warn(`Failed to delete temp file ${filePath}:`, unlinkError);
    }
    
    throw error;
  }
}

