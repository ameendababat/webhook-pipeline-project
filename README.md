# Webhook Pipeline Service

A webhook-driven task processing pipeline service that receives webhooks, processes them through configurable actions, and delivers results to registered subscribers.

## Features

- **Pipeline Management**: CRUD operations for pipelines
- **Webhook Ingestion**: Receive webhooks and queue for background processing
- **Multiple Actions**: Upper case, reverse string, add timestamp
- **Retry Logic**: Automatic retry with exponential backoff for failed deliveries
- **Job Tracking**: Query job status and delivery history
- **Dockerized**: Full containerized setup with docker-compose
- **CI/CD**: GitHub Actions pipeline for testing and building

## Architecture

Webhook → Express API → Queue (BullMQ) → Worker → Action → Deliveries → Subscribers
↓
PostgreSQL (persistence)


### Components

1. **API Server** (Express): Handles pipeline management, webhook ingestion, and job queries
2. **Queue** (BullMQ with Redis): Manages background job processing
3. **Worker**: Processes jobs, executes actions, handles deliveries with retries
4. **Database** (PostgreSQL): Stores pipelines, jobs, subscribers, and delivery attempts

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for development)
- npm or yarn

## Quick Start

1. Clone the repository:
```bash
git clone <your-repo-url>
cd webhook-pipeline

Start the services:
docker compose up -d

Wait for services to be healthy (about 10 seconds)

Test the health endpoint:

curl http://localhost:3000/health

