CREATE TABLE IF NOT EXISTS raw_trips
(
  trip_id UUID DEFAULT generateUUIDv7(),

  region LowCardinality(String),
  datasource LowCardinality(String),

  origin_lat Float64 CODEC(ZSTD),
  origin_lon Float64 CODEC(ZSTD),
  destination_lat Float64 CODEC(ZSTD),
  destination_lon Float64 CODEC(ZSTD),

  origin_h3 UInt64 MATERIALIZED geoToH3(origin_lat, origin_lon, 10),
  destination_h3 UInt64 MATERIALIZED geoToH3(destination_lat, destination_lon, 10),

  datetime DateTime CODEC(Delta, LZ4),
  date Date MATERIALIZED toDate(datetime) CODEC(Delta, LZ4),

  materialized_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (region, date, datetime, origin_h3, destination_h3)
PARTITION BY toYYYYMM(date)
SETTINGS index_granularity = 8192;
