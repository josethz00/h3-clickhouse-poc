# Scalability Documentation

## Overview

This document explains how the H3 ClickHouse Data Pipeline is designed to scale to 100 million entries and beyond.

## Data Model Optimizations

### 1. Columnar Storage (ClickHouse)

ClickHouse uses a columnar storage engine that provides:
- **High compression ratios**: Typically 5-10x compression for numeric data
- **Fast analytical queries**: Only reads necessary columns
- **Efficient aggregations**: Native support for SUM, COUNT, AVG operations

### 2. H3 Spatial Indexing

**Approach**: Trips are grouped by H3 cell IDs at resolution 10 for origin and destination.

**Benefits**:
- **Natural grouping**: Nearby locations automatically fall into the same H3 cell
- **Hierarchical structure**: Can query at different resolutions if needed
- **Efficient lookups**: H3 cells can be indexed and queried as strings
- **Reduced data volume**: Aggregation reduces raw trip data significantly

**Example**: 
- 100M raw trips → ~10-50M aggregated records (depending on trip distribution)
- Compression ratio: ~80-90% reduction in storage

### 3. Table Schema Design

#### Raw Trips Table
```sql
CREATE TABLE raw_trips (
  region String,
  origin_lat Float64,
  origin_lon Float64,
  destination_lat Float64,
  destination_lon Float64,
  datetime DateTime,
  datasource String
)
ENGINE = MergeTree()
ORDER BY (region, datetime)
PARTITION BY toYYYYMM(datetime)
```

**Optimizations**:
- **Partitioning by month**: Reduces data scanned per query
- **Ordering by (region, date)**: Optimizes time-range queries
- **Index granularity**: 8192 rows per index mark (default, good balance)
- **Custom CODECS**: Ensuring less I/O, and more cache hits, improving overall query performance


## Storage Estimates

### Raw Trips (100M rows)
- Average row size: ~100 bytes (uncompressed)
- Uncompressed: ~10 GB
- Compressed (ClickHouse): ~1-2 GB (5-10x compression)
- With partitioning overhead: ~2-3 GB


**Total estimated storage**: ~2.5-3.5 GB for 100M trips

## Scalability Proof

### 1. ClickHouse Benchmarks

ClickHouse is proven to handle:
- **Billions of rows** on single servers
- **Petabytes of data** in distributed setups
- **Sub-second queries** on large datasets

### 2. Partitioning Strategy

- **Monthly partitions**

### 3. Horizontal Scaling (Future)

The architecture supports horizontal scaling:
- **ClickHouse clusters**: Distributed tables across multiple nodes
- **Sharding**: Partition data by region or time
- **Replication**: High availability and read scaling
