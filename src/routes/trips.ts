import { Elysia, t } from "elysia";
import { getWeeklyAverageWithSpatialFilter } from "../services/queries";
import { WeeklyAverageQuery } from "../types/trip";

export const tripsRoutes = new Elysia({ prefix: "/api/trips" })
.get("/weekly-average", async ({ query }) => {
  const minLat = Number.parseFloat(query.min_lat);
  const maxLat = Number.parseFloat(query.max_lat);
  const minLon = Number.parseFloat(query.min_lon);
  const maxLon = Number.parseFloat(query.max_lon);
  const region = query.region;
  
  if (
    Number.isNaN(minLat) ||
    Number.isNaN(maxLat) ||
    Number.isNaN(minLon) ||
    Number.isNaN(maxLon)
  ) {
    return { error: "Invalid numeric bounding box parameters" };
  }
  
  if (
    minLat >= maxLat ||
    minLon >= maxLon ||
    minLat < -90 ||
    maxLat > 90 ||
    minLon < -180 ||
    maxLon > 180
  ) {
    return { error: "Invalid bounding box parameters" };
  }
  
  const queryParams: WeeklyAverageQuery = {
    bounding_box: {
      min_lat: minLat,
      max_lat: maxLat,
      min_lon: minLon,
      max_lon: maxLon,
    },
    region: region || undefined,
  };
  
  try {
    return await getWeeklyAverageWithSpatialFilter(queryParams);
  } catch (error) {
    console.error("Error querying weekly average:", error);
    return {
      error: "Failed to query weekly average",
      message: error instanceof Error ? error.message : String(error),
    };
  }
});


