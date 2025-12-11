# AWS Deployment Architecture

## Overview

This document outlines how to deploy the H3 ClickHouse Data Pipeline on AWS for production use.

## Component Details

### 1. Application Layer (ECS Fargate)

**Service**: Amazon ECS with Fargate launch type

**Configuration**:
- **Task Definition**: 
  - CPU: 1-4 vCPU (scale based on load)
  - Memory: 2-8 GB
  - Container: Built from Dockerfile
- **Service**:
  - Desired count: 2-10 tasks (auto-scaling)
  - Health checks: `/health` endpoint
  - Load balancing: Application Load Balancer

**Auto-scaling**:
- **Target**: CPU utilization 70%, Memory utilization 80%
- **Min tasks**: 2
- **Max tasks**: 20
- **Scale-out cooldown**: 60s
- **Scale-in cooldown**: 300s

**Environment Variables**:
```bash
PORT=3000
CLICKHOUSE_HOST=clickhouse-cluster.internal
CLICKHOUSE_PORT=9000
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=${SECRETS_MANAGER_PASSWORD}
CLICKHOUSE_DATABASE=default
NODE_ENV=production
AWS_REGION=us-east-1
S3_BUCKET=trips-data-bucket
```

### 2. Load Balancer (ALB)

**Type**: Application Load Balancer

**Configuration**:
- **Listeners**: 
  - HTTPS (443) - Terminate SSL/TLS
  - HTTP (80) - Redirect to HTTPS
- **Target Group**: 
  - Protocol: HTTP
  - Port: 3000
  - Health check: `/health` (every 30s)
- **SSL Certificate**: ACM certificate for your domain

### 3. ClickHouse Cluster

**Option A: Self-Hosted on EC2**

**Architecture**:
- **Instance Type**: r6i.2xlarge or larger (8+ vCPU, 64+ GB RAM)
- **Nodes**: 3 nodes (for high availability)
- **Storage**: 
  - EBS gp3 volumes (1-5 TB per node)
  - IOPS: 3000-10000
- **Network**: Private subnets, no public IPs
- **Security**: Security groups restricting access to ECS tasks only

**Configuration**:
- **Replication**: 3 replicas for fault tolerance
- **Sharding**: By region or hash-based
- **Backup**: Automated snapshots to S3

**Option B: ClickHouse Cloud (Managed Service)**

- Fully managed ClickHouse service
- Automatic scaling and backups
- Pay-per-use pricing
- VPC peering for private connectivity

### 4. Storage (S3)

**Bucket**: `trips-data-bucket`

**Structure**:
```
trips-data-bucket/
  ├── uploads/          # Temporary upload location
  ├── processed/        # Processed CSV files
  ├── backups/          # ClickHouse backups
  └── exports/          # Query result exports
```

**Lifecycle Policies**:
- Move uploads to Glacier after 30 days
- Delete processed files after 90 days
- Archive backups to Glacier after 7 days

**Access**: IAM roles for ECS tasks

### 5. Monitoring & Logging

**CloudWatch**:
- **Log Groups**: 
  - `/ecs/h3-clickhouse-app` (application logs)
  - `/clickhouse/server` (ClickHouse logs)
- **Metrics**:
  - ECS: CPU, Memory, Task count
  - ALB: Request count, latency, error rate
  - ClickHouse: Query count, query duration, disk usage
- **Alarms**:
  - High CPU/Memory utilization
  - High error rate
  - ClickHouse disk space < 20%

**X-Ray**:
- Distributed tracing for API requests
- Track request flow through ALB → ECS → ClickHouse

### 6. Secrets Management

**AWS Secrets Manager**:
- Store ClickHouse passwords
- Rotate credentials automatically
- Access via IAM roles (no hardcoded secrets)
