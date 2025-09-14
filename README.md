# Totem Interactive - AI-Powered FAQ System

A sophisticated Node.js application that provides intelligent FAQ management with semantic search capabilities, contextual query processing, and comprehensive analytics.

## 🚀 Features

- **Intelligent FAQ Management**: Create, read, update, and delete FAQs with semantic search
- **Contextual Query Processing**: AI-powered query answering using Hugging Face transformers
- **User Management**: Complete user lifecycle management with query history tracking
- **Advanced Analytics**: Query performance metrics and usage analytics
- **Semantic Similarity**: Context-aware matching using sentence transformers
- **Caching System**: Optimized performance with intelligent caching
- **Audit Logging**: Comprehensive logging for context assembly and query processing
- **RESTful API**: Well-structured REST endpoints with proper validation

## 🏗️ Architecture

```
src/
├── config/          # Database and application configuration
├── controllers/     # Request handlers and business logic
├── middlewares/     # Validation, logging, and error handling
├── models/          # Database models and queries
├── routes/          # API route definitions
├── scripts/         # Database setup and utility scripts
└── service/         # Core services (context, cache, audit)
```

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL 16
- **AI/ML**: Hugging Face Transformers (sentence-transformers/all-MiniLM-L6-v2)
- **Validation**: Joi schema validation
- **Security**: Helmet.js, CORS
- **Containerization**: Docker & Docker Compose
- **Caching**: Node-cache

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd toteminteractive
```

### 2. Environment Setup

Copy the `.env` file and configure your environment variables:

```bash
# Database Configuration (Docker PostgreSQL)
POSTGRES_USER=kabootar
POSTGRES_PASSWORD=redpower
POSTGRES_DB=totemdatabase

# Application Database Configuration
DB_USER=kabootar
DB_PASSWORD=redpower
DB_DATABASE=totemdatabase
DB_HOST=localhost
DB_PORT=5432
DB_MAX_CLIENTS=5
DB_IDLE_TIMEOUT=30000

# Hugging Face Configuration
HF_TOKEN=your_huggingface_token_here
HF_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Cache Configuration
CACHE_MAX_QUERIES_PER_USER=100
CACHE_STD_TTL=3600
CACHE_CHECK_PERIOD=600

# Context Processing Configuration
CONTEXT_SEMANTIC_MATCHES_LIMIT=5
CONTEXT_RECENT_QUERIES_LIMIT=5
CONTEXT_SIMILARITY_THRESHOLD=0.5

# Application Configuration
ANALYTICS_DEFAULT_LIMIT=100
USER_HISTORY_DEFAULT_LIMIT=50
PORT=3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Database

```bash
docker-compose up -d
```

### 5. Setup Database Schema

```bash
npm run setup-db
```

### 6. Start the Application

```bash
node server.js
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### FAQ Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/faqs` | Get all FAQs | - |
| GET | `/api/faqs/:id` | Get FAQ by ID | - |
| POST | `/api/faqs` | Create new FAQ | `{ question, answer, category?, keywords? }` |
| PUT | `/api/faqs/:id` | Update FAQ | `{ question, answer, category?, keywords? }` |
| DELETE | `/api/faqs/:id` | Delete FAQ | - |

### User Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/users` | Get all users | Query: `limit`, `offset` |
| GET | `/api/users/:id` | Get user by ID | - |
| GET | `/api/users/:id/history` | Get user's query history | Query: `limit` |
| POST | `/api/users` | Create new user | `{ name?, email?, metadata? }` |
| PUT | `/api/users/:id` | Update user | `{ name?, email?, metadata? }` |
| DELETE | `/api/users/:id` | Delete user | - |

### Query Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/queries` | Get all queries | Query: `limit`, `offset`, `userId` |
| GET | `/api/queries/:id` | Get query by ID | - |
| GET | `/api/queries/analytics` | Get analytics data | Query: `from`, `to`, `limit` |
| POST | `/api/queries` | Process new query | `{ question, userId?, sessionId? }` |

## 🔧 Configuration

### Database Configuration

The application uses PostgreSQL with the following key configurations:

- **Connection Pool**: Configurable max clients and idle timeout
- **Health Checks**: Built-in database health monitoring
- **Migrations**: Automated schema setup via setup script

### AI/ML Configuration

- **Model**: Uses sentence-transformers/all-MiniLM-L6-v2 for semantic similarity
- **Similarity Threshold**: Configurable threshold for context matching
- **Context Limits**: Configurable limits for semantic matches and recent queries

### Caching Strategy

- **User Query Cache**: Stores recent queries per user
- **TTL Management**: Configurable time-to-live for cached data
- **Performance Optimization**: Reduces database load for frequent queries

## 🧪 Testing

### Manual API Testing

You can test the APIs using tools like Postman, curl, or PowerShell:

```powershell
# Get all FAQs
Invoke-RestMethod -Uri "http://localhost:3000/api/faqs" -Method GET

# Create a new FAQ
$body = @{
    question = "What is AI?"
    answer = "Artificial Intelligence is..."
    category = "Technology"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/faqs" -Method POST -Body $body -ContentType "application/json"

# Process a query
$queryBody = @{
    question = "Tell me about artificial intelligence"
    userId = "123e4567-e89b-12d3-a456-426614174000"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/queries" -Method POST -Body $queryBody -ContentType "application/json"
```

## 🔒 Security Features

- **Helmet.js**: Security headers and protection
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: Joi schema validation for all endpoints
- **Error Handling**: Comprehensive error handling and logging
- **SQL Injection Protection**: Parameterized queries

## 📊 Monitoring & Analytics

The application provides comprehensive analytics including:

- **Query Performance**: Response times and confidence scores
- **Usage Metrics**: Query frequency and user activity
- **Context Assembly**: Detailed logging of semantic matching
- **Cache Performance**: Hit rates and optimization metrics

## 🐳 Docker Support

The application includes Docker support with:

- **PostgreSQL Container**: Fully configured database container
- **Health Checks**: Database availability monitoring
- **Volume Persistence**: Data persistence across container restarts
- **Environment Configuration**: Easy environment variable management