import { executeQuery } from "../db/client";
import { WeeklyAverageQuery } from "../types/trip";

interface WeeklyAverageResult {
  weekly_average: number;
  total_weeks: number;
  total_trips: number;
}

export async function getWeeklyAverageWithSpatialFilter(
  query: WeeklyAverageQuery
): Promise<WeeklyAverageResult> {
  const { bounding_box, region } = query;

  const polygonExpr = `
  [
    ({minLon:Float64}, {minLat:Float64}),
    ({minLon:Float64}, {maxLat:Float64}),
    ({maxLon:Float64}, {maxLat:Float64}),
    ({maxLon:Float64}, {minLat:Float64})
  ]
  `;

  const h3Expr = `h3PolygonToCells(${polygonExpr}, 7)`;

  let innerWhere = `origin_h3 IN ${h3Expr}`;
  if (region) {
    innerWhere += ` AND region = {region:String}`;
  }

  const sqlQuery = `
    SELECT
      avg(weekly_trips) AS weekly_average,
      count() AS total_weeks,
      sum(weekly_trips) AS total_trips
    FROM (
      SELECT
        count() AS weekly_trips
      FROM raw_trips
      WHERE ${innerWhere}
      GROUP BY toStartOfWeek(datetime)
      LIMIT 10
    )
  `;

  const params = {
    minLat: bounding_box.min_lat,
    maxLat: bounding_box.max_lat,
    minLon: bounding_box.min_lon,
    maxLon: bounding_box.max_lon,
    region,
  };

  const results = await executeQuery<{
    total_trips: number;
    total_weeks: number;
  }>(sqlQuery, params);

  if (results.length === 0) {
    return { weekly_average: 0, total_weeks: 0, total_trips: 0 };
  }

  const result = results[0];
  const weeklyAverage =
    result.total_weeks > 0 ? result.total_trips / result.total_weeks : 0;

  return {
    weekly_average: Math.round(weeklyAverage * 100) / 100,
    total_weeks: result.total_weeks,
    total_trips: result.total_trips,
  };
}
