ATTACH TABLE _ UUID 'ae7aa7e2-1550-4858-b4b7-6a87e413dbb2'
(
    `trip_id` UUID DEFAULT generateUUIDv7(),
    `region` LowCardinality(String),
    `datasource` LowCardinality(String),
    `origin_lat` Float64 CODEC(ZSTD(1)),
    `origin_lon` Float64 CODEC(ZSTD(1)),
    `destination_lat` Float64 CODEC(ZSTD(1)),
    `destination_lon` Float64 CODEC(ZSTD(1)),
    `origin_h3` UInt64 MATERIALIZED geoToH3(origin_lat, origin_lon, 10),
    `destination_h3` UInt64 MATERIALIZED geoToH3(destination_lat, destination_lon, 10),
    `datetime` DateTime CODEC(Delta(4), LZ4),
    `date` Date MATERIALIZED toDate(datetime) CODEC(Delta(2), LZ4),
    `materialized_at` DateTime DEFAULT now()
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(date)
ORDER BY (region, date, datetime, origin_h3, destination_h3)
SETTINGS index_granularity = 8192
