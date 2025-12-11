# H3 ClickHouse Data Pipeline

A scalable data ingestion and query service for trip data using ClickHouse and H3 spatial indexing.

## Features

- **CSV Data Generation**: Generate large CSV files for testing
- **H3-Based Aggregation**: Group similar trips by origin, destination, and hour using H3 spatial indexing
- **ClickHouse Storage**: Efficient columnar storage with compression
- **REST API**: Ingest data and query weekly averages
- **SSE Status Updates**: Real-time ingestion progress via Server-Sent Events
- **Docker Support**: Containerized deployment with docker-compose
- **Scalable**: Designed to handle 100M+ trips

## Architecture

- **Backend**: Elysia (Bun runtime)
- **Database**: ClickHouse (columnar database)
- **Spatial Indexing**: H3 (resolution 10 for block-level grouping)
- **API**: REST endpoints with SSE for status updates

## Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- Docker and Docker Compose (for containerized deployment)
- ClickHouse (via Docker Compose or standalone)

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Start ClickHouse and the API with Docker Compose

```bash
docker-compose up --build
```

Wait for ClickHouse to be healthy.
The API will be available at `http://localhost:3000`

### 4. Generate Sample Data

```bash
# Generate 1M rows (default)
bun run generate-csv

# Generate custom number of rows
bun run generate-csv 10000000 output.csv
```

## API Endpoints

### Health Check

```bash
GET /health
```

### Ingest CSV File

```bash
POST /api/ingest
Content-Type: multipart/form-data

# Using curl
curl -X POST http://localhost:3000/api/ingest \
  -F "file=@trips.csv"
```

Response:
```json
{
  "job_id": "018f1234-5678-9abc-def0-123456789abc",
  "status": "pending",
  "message": "Ingestion started"
}
```

### Get Ingestion Status (SSE)

```bash
GET /api/ingest/status/:jobId
Accept: text/event-stream
```

Opens an SSE connection that streams real-time progress updates.

### Get Weekly Average

```bash
GET /api/trips/weekly-average?min_lat=50.0&max_lat=50.1&min_lon=14.4&max_lon=14.5&region=Prague
```

Response:
```json
{
  "weekly_average": 1234.56,
  "total_weeks": 30,
  "total_trips": 37036
}
```

## H3 Aggregation Approach

Trips are grouped using H3 spatial indexing at resolution 10

- **Origin H3**: H3 cell ID for trip origin
- **Destination H3**: H3 cell ID for trip destination
- **Region**: City/region name

This approach naturally groups nearby locations, making it efficient for spatial queries while reducing storage requirements by 80-90%.

## Docker Deployment

### Build and Run

```bash
# Build the application
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Environment Variables

Set these in `docker-compose.yml` or `.env`:

```bash
CLICKHOUSE_HOST=clickhouse
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=
CLICKHOUSE_DATABASE=default
PORT=3000
```

## Development

### Project Structure

```
src/
  ├── index.ts              # Main application entry
  ├── db/
  │   ├── client.ts        # ClickHouse client
  ├── services/
  │   ├── ingestion.ts     # CSV ingestion logic
  │   ├── aggregation.ts   # H3-based aggregation
  │   ├── queries.ts       # Query services
  │   └── sse.ts           # SSE status updates
  ├── routes/
  │   ├── ingest.ts        # Ingestion endpoints
  │   ├── trips.ts         # Trip query endpoints
  │   └── status.ts        # Status endpoints
  └── types/
      └── trip.ts          # TypeScript types

scripts/
  └── generate-csv.ts      # CSV generation script

docs/
  ├── SCALABILITY.md       # Scalability documentation
  └── AWS_DEPLOYMENT.md    # AWS deployment guide
```

### Running Tests

```bash
# Generate test data
bun run generate-csv 100000 test.csv

# Ingest test data
curl -X POST http://localhost:3000/api/ingest -F "file=@test.csv"

# Query weekly average
curl "http://localhost:3000/api/trips/weekly-average?min_lat=50.0&max_lat=50.1&min_lon=14.4&max_lon=14.5&region=Prague"
```

## Scalability

See [docs/SCALABILITY.md](docs/SCALABILITY.md) for detailed information on:
- Data model optimizations
- Storage estimates for 100M rows
- Query performance characteristics
- Horizontal scaling strategies

## AWS Deployment

See [docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md) for:
- Architecture diagrams
- ECS Fargate deployment
- ClickHouse cluster setup
- Auto-scaling configuration
- Cost estimates
