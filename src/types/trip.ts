export interface RawTrip {
  region: string;
  origin_coord: string;
  destination_coord: string;
  datetime: string;
  datasource: string;
}

export interface ParsedTrip {
  trip_id: string;
  region: string;
  origin_lat: number;
  origin_lon: number;
  destination_lat: number;
  destination_lon: number;
  datetime: Date;
  datasource: string;
}

export interface BoundingBox {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

export interface WeeklyAverageQuery {
  bounding_box: BoundingBox;
  region?: string;
}

export interface IngestionJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  total_rows: number;
  processed_rows: number;
  error?: string;
  started_at?: Date;
  completed_at?: Date;
}

