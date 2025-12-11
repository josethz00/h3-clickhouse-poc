ATTACH TABLE _ UUID '8e4e1f31-f570-4c25-bcc1-51e60e943fbf'
(
    `hostname` LowCardinality(String) COMMENT 'Hostname of the server executing the query.',
    `event_date` Date COMMENT 'Date of sampling moment.',
    `event_time` DateTime COMMENT 'Timestamp of the sampling moment.',
    `event_time_microseconds` DateTime64(6) COMMENT 'Timestamp of the sampling moment with microseconds precision.',
    `timestamp_ns` UInt64 COMMENT 'Timestamp of the sampling moment in nanoseconds.',
    `revision` UInt32 COMMENT 'ClickHouse server build revision.',
    `trace_type` Enum8('Real' = 0, 'CPU' = 1, 'Memory' = 2, 'MemorySample' = 3, 'MemoryPeak' = 4, 'ProfileEvent' = 5) COMMENT 'Trace type: `Real` represents collecting stack traces by wall-clock time. `CPU` represents collecting stack traces by CPU time. `Memory` represents collecting allocations and deallocations when memory allocation exceeds the subsequent watermark. `MemorySample` represents collecting random allocations and deallocations. `MemoryPeak` represents collecting updates of peak memory usage. `ProfileEvent` represents collecting of increments of profile events.',
    `thread_id` UInt64 COMMENT 'Thread identifier.',
    `query_id` String COMMENT 'Query identifier that can be used to get details about a query that was running from the query_log system table.',
    `trace` Array(UInt64) COMMENT 'Stack trace at the moment of sampling. Each element is a virtual memory address inside ClickHouse server process.',
    `size` Int64 COMMENT 'For trace types Memory, MemorySample or MemoryPeak is the amount of memory allocated, for other trace types is 0.',
    `ptr` UInt64 COMMENT 'The address of the allocated chunk.',
    `event` LowCardinality(String) COMMENT 'For trace type ProfileEvent is the name of updated profile event, for other trace types is an empty string.',
    `increment` Int64 COMMENT 'For trace type ProfileEvent is the amount of increment of profile event, for other trace types is 0.',
    `build_id` String ALIAS 'E0FF0D5BE10CEFDCD7BEE5B7F246BEDBA88EC1C4'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'Contains stack traces collected by the sampling query profiler.'
