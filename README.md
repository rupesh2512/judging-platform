# Online Code Judge Platform

[![Status](https://img.shields.io/badge/status-production-ready-green.svg)](https://github.com/)

## 🚀 Overview

**CodeArena** is a production-ready online code judge platform designed for competitive programming and code execution testing. It supports **Python**, **JavaScript**, and **C++** with secure Docker sandbox isolation.

### Key Features

- **Multi-language support**: Python, JavaScript, C++
- **Secure execution**: Docker sandboxes with resource limits
- **Queue-based processing**: BullMQ + Redis for scalable job handling
- **REST API**: Submit code and poll results
- **Production-grade**: Docker Compose deployment with MongoDB persistence

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐
│    Frontend     │    │     API (3000)   │    │   MongoDB   │
│ (your app)      │───▶│ ┌──────────────┘    │◀──│   (27017)   │
└─────────────────┘    │ │ REST endpoints   │    └─────────────┘
                       │ │ Queue submission │
                       │ └──────────────────┘
                              │
                       ┌──────────────────┐    ┌─────────────┐
                       │    Worker        │───▶│     Redis   │
                       │ ┌──────────────┘    │    │   (6379)   │
                       │ │ Processes jobs   │    └─────────────┘
                       │ │ Runs sandboxes  │
                       │ └──────────────────┘
                              │
                       ┌──────────────────┐
                       │ Docker Sandboxes │
                       │ (Python/JS/C++)  │
                       └──────────────────┘
```

## 📋 Supported Languages

| Language   | Runtime     | Time Limit | Memory Limit |
| ---------- | ----------- | ---------- | ------------ |
| Python 3.x | Python 3.9+ | 2s         | 256MB        |
| JavaScript | Node.js 18+ | 2s         | 256MB        |
| C++        | GCC 12+     | 1s         | 256MB        |

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- 8GB+ RAM recommended

### 1. Clone & Setup

```bash
git clone <your-repo>
cd judge-platform
mkdir temp  # Create temp directory for file sharing
```

### 2. Start Services

```bash
docker-compose up --build
```

### 3. API Usage

**Submit Code:**

```bash
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(2+2)",
    "language": "python"
  }'
```

**Check Result:**

```bash
curl http://localhost:3000/submission/YOUR_SUBMISSION_ID
```

**Response Example:**

```json
{
	"_id": "671f3c...",
	"code": "print(2+2)",
	"language": "python",
	"status": "completed",
	"stdout": "4\n",
	"verdict": "Accepted",
	"stderr": ""
}
```

## 🛠️ Project Structure

```
judge-platform/
├── api/                    # REST API (Node.js/Express)
│   ├── src/index.js        # API endpoints
│   └── src/models/         # Mongoose schemas
├── worker/                 # Job processor
│   ├── src/sandboxRunner.js # Executes code in Docker
│   └── src/index.js        # BullMQ worker
├── sandbox/                # Language runtimes
│   ├── python/Dockerfile
│   ├── javascript/Dockerfile
│   └── cpp/Dockerfile
├── docker-compose.yml      # Orchestration
└── temp/                   # Shared temp files
```

## 🔧 Configuration

Environment variables (set in `docker-compose.yml`):

| Variable         | Default              | Purpose                |
| ---------------- | -------------------- | ---------------------- |
| `MONGO_URI`      | `mongodb://mongo...` | MongoDB connection     |
| `REDIS_HOST`     | `redis`              | Redis host             |
| `HOST_TEMP_PATH` | Platform-specific    | Temp directory on host |

## 🧪 Testing

1. **Health Check:**

   ```bash
   curl http://localhost:3000/
   # ➜ "CodeArena API Running"
   ```



## 🔒 Security Features

- **Docker sandbox isolation**
- **Resource limits** (CPU/Memory)
- **No network access** in sandboxes
- **File system isolation** (`/app/temp` only)
- **Timeout enforcement**

## 🐛 Troubleshooting

| Issue                         | Solution                          |
| ----------------------------- | --------------------------------- |
| Worker can't spawn containers | Check Docker socket mount         |
| "temp path not accessible"    | Create `./temp/` dir              |
| Mongo connection refused      | Wait for MongoDB startup          |
| Redis connection issues       | Check `docker-compose logs redis` |

## 📈 Scaling

**Horizontal scaling:**

```yaml
# docker-compose.yml
worker:
  build: ./worker
  deploy:
    replicas: 3 # Multiple workers
```

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests
4. Submit PR

## 🙌 Acknowledgments

Built with ❤️ using:

- [Node.js](https://nodejs.org)
- [Docker](https://docker.com)
- [MongoDB](https://mongodb.com)
- [Redis](https://redis.io)
- [BullMQ](https://bullmq.io)

---

**⭐ Star us on GitHub if you found this useful!**

---

<div align="center">
  <sub>Ready for production • Secure sandboxes • Multi-language</sub>
</div>
