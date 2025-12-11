#!/usr/bin/env bun


export const __script = true; // Marks file as a module to allow top-level await

interface CityConfig {
  name: string;
  centerLat: number;
  centerLon: number;
  latRange: number;
  lonRange: number;
}

const CITIES: CityConfig[] = [
  {
    name: "Prague",
    centerLat: 50.0755,
    centerLon: 14.4378,
    latRange: 0.15,
    lonRange: 0.2,
  },
  {
    name: "Turin",
    centerLat: 45.0703,
    centerLon: 7.6869,
    latRange: 0.15,
    lonRange: 0.2,
  },
  {
    name: "Hamburg",
    centerLat: 53.5511,
    centerLon: 9.9937,
    latRange: 0.2,
    lonRange: 0.25,
  },
  {
    name: "Berlin",
    centerLat: 52.52,
    centerLon: 13.405,
    latRange: 0.2,
    lonRange: 0.25,
  },
  {
    name: "Paris",
    centerLat: 48.8566,
    centerLon: 2.3522,
    latRange: 0.18,
    lonRange: 0.22,
  },
  {
    name: "London",
    centerLat: 51.5074,
    centerLon: -0.1278,
    latRange: 0.18,
    lonRange: 0.25,
  },
  {
    name: "Madrid",
    centerLat: 40.4168,
    centerLon: -3.7038,
    latRange: 0.18,
    lonRange: 0.22,
  },
  {
    name: "Vienna",
    centerLat: 48.2082,
    centerLon: 16.3738,
    latRange: 0.15,
    lonRange: 0.2,
  },
  {
    name: "Amsterdam",
    centerLat: 52.3676,
    centerLon: 4.9041,
    latRange: 0.12,
    lonRange: 0.18,
  },
  {
    name: "New York",
    centerLat: 40.7128,
    centerLon: -74.006,
    latRange: 0.25,
    lonRange: 0.3,
  },
  {
    name: "San Francisco",
    centerLat: 37.7749,
    centerLon: -122.4194,
    latRange: 0.18,
    lonRange: 0.22,
  },
  {
    name: "Tokyo",
    centerLat: 35.6762,
    centerLon: 139.6503,
    latRange: 0.25,
    lonRange: 0.3,
  },
  {
    name: "Sydney",
    centerLat: -33.8688,
    centerLon: 151.2093,
    latRange: 0.2,
    lonRange: 0.25,
  },
  {
    name: "Toronto",
    centerLat: 43.6532,
    centerLon: -79.3832,
    latRange: 0.2,
    lonRange: 0.25,
  },
  {
    name: "São Paulo",
    centerLat: -23.5505,
    centerLon: -46.6333,
    latRange: 0.25,
    lonRange: 0.3,
  },
  {
    name: "Mumbai",
    centerLat: 19.076,
    centerLon: 72.8777,
    latRange: 0.2,
    lonRange: 0.25,
  },
  {
    name: "Barcelona",
    centerLat: 41.3851,
    centerLon: 2.1734,
    latRange: 0.15,
    lonRange: 0.2,
  },
  {
    name: "Rome",
    centerLat: 41.9028,
    centerLon: 12.4964,
    latRange: 0.18,
    lonRange: 0.22,
  },
  {
    name: "Stockholm",
    centerLat: 59.3293,
    centerLon: 18.0686,
    latRange: 0.15,
    lonRange: 0.2,
  },
  {
    name: "Copenhagen",
    centerLat: 55.6761,
    centerLon: 12.5683,
    latRange: 0.12,
    lonRange: 0.18,
  },
  {
    name: "Dublin",
    centerLat: 53.3498,
    centerLon: -6.2603,
    latRange: 0.15,
    lonRange: 0.2,
  },
  {
    name: "Lisbon",
    centerLat: 38.7223,
    centerLon: -9.1393,
    latRange: 0.15,
    lonRange: 0.2,
  },
  {
    name: "Warsaw",
    centerLat: 52.2297,
    centerLon: 21.0122,
    latRange: 0.18,
    lonRange: 0.22,
  },
  {
    name: "Budapest",
    centerLat: 47.4979,
    centerLon: 19.0402,
    latRange: 0.15,
    lonRange: 0.2,
  },
  {
    name: "Athens",
    centerLat: 37.9838,
    centerLon: 23.7275,
    latRange: 0.18,
    lonRange: 0.22,
  },
  {
    name: "Istanbul",
    centerLat: 41.0082,
    centerLon: 28.9784,
    latRange: 0.2,
    lonRange: 0.25,
  },
  {
    name: "Dubai",
    centerLat: 25.2048,
    centerLon: 55.2708,
    latRange: 0.2,
    lonRange: 0.25,
  },
  {
    name: "Singapore",
    centerLat: 1.3521,
    centerLon: 103.8198,
    latRange: 0.1,
    lonRange: 0.15,
  },
  {
    name: "Seoul",
    centerLat: 37.5665,
    centerLon: 126.978,
    latRange: 0.2,
    lonRange: 0.25,
  },
  {
    name: "Bangkok",
    centerLat: 13.7563,
    centerLon: 100.5018,
    latRange: 0.2,
    lonRange: 0.25,
  },
];

const DATASOURCES = [
  "funny_car",
  "baba_car",
  "cheap_mobile",
  "bad_diesel_vehicles",
  "pt_search_app",
  "ride_share_app",
  "navigation_system",
  "traffic_monitor",
];

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function formatPoint(lat: number, lon: number): string {
  return `POINT (${lon} ${lat})`;
}

function generateTimestamp(startDate: Date, endDate: Date): string {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = randomInt(start, end);
  const date = new Date(randomTime);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function generateTrip(city: CityConfig, startDate: Date, endDate: Date): string {
  const originLat = randomFloat(
    city.centerLat - city.latRange,
    city.centerLat + city.latRange
  );
  const originLon = randomFloat(
    city.centerLon - city.lonRange,
    city.centerLon + city.lonRange
  );

  const destinationLat = randomFloat(
    city.centerLat - city.latRange,
    city.centerLat + city.latRange
  );
  const destinationLon = randomFloat(
    city.centerLon - city.lonRange,
    city.centerLon + city.lonRange
  );

  const datetime = generateTimestamp(startDate, endDate);
  const datasource = randomChoice(DATASOURCES);

  return `${city.name},${formatPoint(originLat, originLon)},${formatPoint(destinationLat, destinationLon)},${datetime},${datasource}`;
}

async function generateCSV(
  outputPath: string,
  rowCount: number,
  startDate: Date = new Date("2016-01-01"),
  endDate: Date = new Date("2026-01-01")
): Promise<void> {
  console.log(`Generating ${rowCount.toLocaleString()} rows...`);
  console.log(`Date range: ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`);
  console.log(`Output: ${outputPath}`);

  const file = Bun.file(outputPath);
  const writer = file.writer();
  
  // Write CSV header
  writer.write("region,origin_coord,destination_coord,datetime,datasource\n");

  const batchSize = 100000;
  let written = 0;
  const startTime = Date.now();

  for (let i = 0; i < rowCount; i++) {
    const city = randomChoice(CITIES);
    const trip = generateTrip(city, startDate, endDate);
    writer.write(trip + "\n");
    written++;

    // Progress updates every batchSize rows
    if (written % batchSize === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = written / elapsed;
      const remaining = rowCount - written;
      const eta = remaining / rate;
      
      process.stdout.write(
        `\rProgress: ${written.toLocaleString()}/${rowCount.toLocaleString()} (${((written / rowCount) * 100).toFixed(2)}%) | ` +
        `Rate: ${rate.toFixed(0)} rows/s | ETA: ${eta.toFixed(0)}s`
      );
    }
  }

  await writer.end();
  
  const elapsed = (Date.now() - startTime) / 1000;
  const fileSize = (await file.arrayBuffer()).byteLength;
  
  console.log(`\n\n✅ Generated ${written.toLocaleString()} rows in ${elapsed.toFixed(2)}s`);
  console.log(`📁 File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📊 Average rate: ${(written / elapsed).toFixed(0)} rows/s`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const rowCount = args[0] ? Number.parseInt(args[0], 10) : 1000000; // Default 1M rows
const outputPath = args[1] || "trips.csv";
const startDateStr = args[2] || "2016-01-01";
const endDateStr = args[3] || "2026-01-01";

if (Number.isNaN(rowCount) || rowCount <= 0) {
  console.error("Error: Row count must be a positive number");
  process.exit(1);
}

const startDate = new Date(startDateStr);
const endDate = new Date(endDateStr);

if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
  console.error("Error: Invalid date format. Use YYYY-MM-DD");
  process.exit(1);
}

if (startDate >= endDate) {
  console.error("Error: Start date must be before end date");
  process.exit(1);
}

// Run the generator
try {
  await generateCSV(outputPath, rowCount, startDate, endDate);
} catch (error) {
  console.error("Error generating CSV:", error);
  process.exit(1);
}

