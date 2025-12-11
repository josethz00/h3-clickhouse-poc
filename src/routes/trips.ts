import { Elysia, t } from "elysia";
import { getWeeklyAverageWithSpatialFilter } from "../services/queries";
import { WeeklyAverageQuery } from "../types/trip";

export const tripsRoutes = new Elysia({ prefix: "/api/trips" })
  .get(
    "/weekly-average",
    async ({ query }) => {
      const { min_lat, max_lat, min_lon, max_lon, region } = query;

      if (
        min_lat >= max_lat ||
        min_lon >= max_lon ||
        min_lat < -90 ||
        max_lat > 90 ||
        min_lon < -180 ||
        max_lon > 180
      ) {
        return {
          error: "Invalid bounding box parameters",
        };
      }

      const queryParams: WeeklyAverageQuery = {
        bounding_box: {
          min_lat: Number.parseFloat(min_lat),
          max_lat: Number.parseFloat(max_lat),
          min_lon: Number.parseFloat(min_lon),
          max_lon: Number.parseFloat(max_lon),
        },
        region: region || undefined,
      };

      try {
        const result = await getWeeklyAverageWithSpatialFilter(queryParams);
        return result;
      } catch (error) {
        console.error("Error querying weekly average:", error);
        return {
          error: "Failed to query weekly average",
          message: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      query: t.Object({
        min_lat: t.String(),
        max_lat: t.String(),
        min_lon: t.String(),
        max_lon: t.String(),
        region: t.Optional(t.String()),
      }),
    }
  );

