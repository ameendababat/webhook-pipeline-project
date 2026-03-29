# Webhook Pipeline Service

A webhook-driven task processing pipeline that receives incoming events, processes them through configurable actions, and delivers results to multiple subscribers.

This project demonstrates an event-driven architecture using a queue-based background worker system.

---

# Overview

The service allows users to create **pipelines** consisting of:

1. **Webhook source** – an endpoint that receives events
2. **Processing action** – a transformation applied to the payload
3. **Subscribers** – URLs where the processed result is delivered

Incoming webhooks are **queued for background processing** instead of being processed synchronously.

---

# Architecture

Client Webhook
↓
Express API
↓
BullMQ Queue (Redis)
↓
Worker Processor
↓
Action Processing
↓
Delivery Service
↓
Subscriber Endpoints

PostgreSQL is used for persistence.

---

# Tech Stack

* TypeScript
* Node.js
* Express
* PostgreSQL
* Drizzle ORM
* Redis
* BullMQ
* Docker
* GitHub Actions

---

# Features

### Pipeline Management

Create, update, retrieve, and delete pipelines.

### Webhook Ingestion

Receive webhooks and enqueue them for background processing.

### Background Job Processing

Jobs are executed asynchronously by a worker using BullMQ.

### Processing Actions

Pipelines can apply transformations to incoming payloads.

Available actions:

* **uppercase** – convert all string values to uppercase
* **reverse** – reverse all string values
* **addTimestamp** – append processing timestamps

### Delivery System

Processed payloads are delivered to subscriber URLs.

### Retry Logic

Failed deliveries are retried automatically using exponential backoff.

### Job Tracking

Track job status and delivery attempts via API.

### Dockerized Deployment

Run the entire stack with Docker Compose.

---

# Project Structure

```
src
 ├─ api
 │   ├─ pipelines.ts
 │   ├─ webhook.ts
 │   └─ jobs.ts
 │
 ├─ services
 │   └─ deliveryService.ts
 │
 ├─ workers
 │   └─ processor.ts
 │
 ├─ queue
 │   └─ index.ts
 │
 ├─ database
 │   ├─ db.ts
 │   └─ schema.ts
 │
 └─ utils
     ├─ retry.ts
     └─ logger.ts
```

---

# Database Schema

Main tables:

**pipelines**
Stores pipeline.

**subscribers**
URLs subscribed to pipeline events.

**jobs**
Stores webhook events and processing status.

**deliveries**
Tracks delivery attempts to subscribers.

---

# Quick Start

### 1 Clone repository

```
git clone <your-repository-url>
cd webhook-pipeline
```

### 2 Start services

```
docker compose up -d
```

This starts:

* PostgreSQL
* Redis
* API server
* Worker processor

### 3 Verify service

```
curl http://localhost:3000/health
```

---

# API Documentation

## Create Pipeline

```
POST /api/pipelines
```

Request

```
{
  "name": "My Pipeline",
  "action": "uppercase",
  "subscribers": [
    "https://webhook.site/xxx",
    "https://example.com/webhook"
  ]
}
```

---

## Get All Pipelines

```
GET /api/pipelines
```

---

## Get Pipeline by ID

```
GET /api/pipelines/:id
```

---

## Update Pipeline

```
PUT /api/pipelines/:id
```

Request

```
{
  "name": "Updated Pipeline",
  "action": "reverse",
  "subscribers": ["https://example.com/webhook"]
}
```

---

## Delete Pipeline

```
DELETE /api/pipelines/:id
```

---

# Webhook Endpoint

Send webhook events to a pipeline:

```
POST /webhook/:pipelineId
```

Example payload

```
{
  "event": "user.created",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

Response

```
{
  "message": "Webhook received and queued for processing",
  "jobId": 123
}
```

---

# Job Monitoring

## Get Job Status

```
GET /api/jobs/:jobId
```

Response

```
{
  "id": 123,
  "status": "completed",
  "pipelineId": 1,
  "payload": {...},
  "processedPayload": {...},
  "createdAt": "...",
  "processedAt": "..."
}
```

---

## Get Delivery Attempts

```
GET /api/jobs/:jobId/deliveries
```

Response

```
[
  {
    "subscriberUrl": "...",
    "status": "success",
    "attempt": 2,
    "deliveredAt": "..."
  }
]
```

---

# Running Locally (Development)

```
npm install
npm run dev
```

Worker

```
npm run worker
```

# Future Improvements

* webhook authentication
* rate limiting
* metrics and monitoring
* dashboard UI

---

# License

ameen
