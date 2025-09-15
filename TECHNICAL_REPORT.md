# Technical Report: Totem Interactive AI-Powered FAQ System

**Project:** Totem Interactive  
**Version:** 1.0.0  
**Date:** September 2025  
**Technology Stack:** Node.js, Express.js, PostgreSQL, Hugging Face Transformers  

---

## Executive Summary

Totem Interactive is a sophisticated AI-powered FAQ management system that leverages semantic search capabilities and contextual query processing to provide intelligent responses to user inquiries. The system combines traditional database operations with modern AI/ML technologies to deliver accurate, context-aware answers while maintaining comprehensive analytics and user management features.

## System Architecture

### Core Components

**Backend Framework:** Node.js with Express.js  
- RESTful API architecture with modular route handling
- Middleware-based request processing pipeline
- Comprehensive error handling and validation

**Database Layer:** PostgreSQL 16  
- Relational data storage for FAQs, users, queries, and sessions
- Session management with automatic expiration handling
- Connection pooling for optimal performance
- Docker containerization for consistent deployment

**AI/ML Integration:** Hugging Face Transformers  
- 384-dimensional embedding generation using sentence-transformers/all-MiniLM-L6-v2
- Real-time embedding creation for all FAQ content at creation/update
- Cosine similarity matching with 0.2 threshold for semantic search
- JSON string storage format in PostgreSQL TEXT columns
- Automatic fallback to keyword matching when embeddings fail

**Caching System:** Node-cache  
- User query caching for performance optimization
- Configurable TTL and capacity management
- Reduced database load for frequent queries

### Application Structure

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

## API Specifications

### FAQ Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/faqs` | Retrieve all FAQs with optional filtering | None |
| GET | `/api/faqs/:id` | Get specific FAQ by ID | None |
| POST | `/api/faqs` | Create new FAQ entry | Validation Required |
| PUT | `/api/faqs/:id` | Update existing FAQ | Validation Required |
| DELETE | `/api/faqs/:id` | Remove FAQ from system | None |

### User Management Endpoints

| Method | Endpoint | Description | Features |
|--------|----------|-------------|----------|
| GET | `/api/users` | List all users | Pagination support |
| POST | `/api/users` | Create new user | Metadata support |
| GET | `/api/users/:id` | Get user details | Profile information |
| GET | `/api/users/:id/history` | User query history | Configurable limits |
| PUT | `/api/users/:id` | Update user information | Partial updates |
| DELETE | `/api/users/:id` | Remove user account | Cascade handling |

### Query Processing Endpoints

| Method | Endpoint | Description | AI Features |
|--------|----------|-------------|-------------|
| POST | `/api/queries` | Process intelligent query | Semantic matching |
| GET | `/api/queries` | Retrieve query history | Filtering options |
| GET | `/api/queries/:id` | Get specific query | Full context |
| GET | `/api/queries/analytics` | System analytics | Performance metrics |

## Technical Implementation

### Database Schema

The system uses PostgreSQL with the following key tables:

**FAQs Table:**
```sql
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    keywords TEXT[],
    embedding TEXT, -- JSON string of 384-dimensional vector
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Users Table:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Sessions Table:**
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_data JSONB DEFAULT '{}',
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Queries Table:**
```sql
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT,
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    context_faqs JSONB,
    similarity_scores JSONB,
    processing_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Semantic Search Engine

The system implements a sophisticated semantic search mechanism using vector embeddings:

**Key Features**

### Intelligent FAQ Management
- **CRUD Operations**: Complete lifecycle management for FAQ entries
- **Automatic Embedding Generation**: Real-time vector creation using HuggingFace transformers
- **Category-based Organization**: Structured FAQ categorization system
- **Keyword Support**: Enhanced searchability with custom keywords

### Session Management System
- **Automatic Session Creation**: Sessions created on user registration and login
- **24-Hour Expiration**: Default session lifetime with extension capabilities
- **Session Data Storage**: JSONB storage for flexible session metadata
- **Cleanup Operations**: Automated expired session removal
- **User Agent Tracking**: Security-focused session monitoring

### Advanced Query Processing
- **Semantic Search**: Vector similarity matching with cosine distance calculation
- **Context Assembly**: Intelligent FAQ selection based on relevance scores
- **Session Integration**: Query tracking with session context
- **Fallback Mechanisms**: Keyword matching when embedding generation fails
- **Performance Tracking**: Query processing time and similarity score logging

### User Authentication System
- **User Lifecycle**: Complete user registration and management
- **Login Endpoints**: Session-based authentication flow
- **Query History**: Comprehensive tracking of user interactions
- **Analytics Integration**: User behavior and system usage metrics

**Embedding Generation Process:**
1. FAQ content (question + answer) processed through HuggingFace API
2. sentence-transformers/all-MiniLM-L6-v2 model generates 384-dimensional vectors
3. Embeddings stored as JSON strings in PostgreSQL TEXT columns
4. Automatic embedding generation during FAQ creation and updates

**Semantic Matching Algorithm:**
1. User query converted to 384-dimensional embedding vector
2. Cosine similarity calculated against all stored FAQ embeddings
3. Results filtered by similarity threshold (0.2 minimum)
4. Top matches ranked by similarity score
5. Fallback to keyword matching if embedding generation fails

**Context Assembly Process:**
1. User metadata retrieval and preference analysis
2. Semantic similarity matching against FAQ database using embeddings
3. Recent query history integration for context
4. Confidence scoring based on similarity scores and multiple factors

**Answer Generation:**
- Primary match selection based on cosine similarity thresholds
- Fallback responses for low-confidence queries or embedding failures
- Context-aware personalization capabilities

### Performance Optimization

**Database Optimization:**
- Connection pooling with configurable limits (max 5 concurrent)
- Parameterized queries for SQL injection prevention
- Indexed searches for improved query performance

**Caching Strategy:**
- User-specific query caching (100 queries per user)
- 1-hour TTL with 10-minute cleanup cycles
- Cache hit rate monitoring for optimization

**Response Time Metrics:**
- Context assembly timing tracking
- End-to-end response time logging
- Performance analytics for system monitoring

### Security Implementation

**Input Validation:** Joi schema validation for all endpoints
- FAQ validation: question (10-1000 chars), answer (10-5000 chars)
- User validation: optional email format, metadata object validation
- Query validation: question (3-1000 chars), UUID format for IDs

**Security Headers:** Helmet.js integration
- XSS protection and content security policies
- CORS configuration for cross-origin requests
- Rate limiting capabilities (configurable)

**Database Security:**
- Environment variable configuration for credentials
- Connection timeout and error handling
- Prepared statements for query execution

## Configuration Management

### Environment Variables

**Database Configuration:**
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=kabootar
DB_PASSWORD=redpower
DB_DATABASE=totemdatabase
DB_MAX_CLIENTS=5
DB_IDLE_TIMEOUT=30000
```

**AI/ML Configuration:**
```
HF_TOKEN=<huggingface_token>
HF_MODEL=sentence-transformers/all-MiniLM-L6-v2
CONTEXT_SEMANTIC_MATCHES_LIMIT=5
CONTEXT_RECENT_QUERIES_LIMIT=5
CONTEXT_SIMILARITY_THRESHOLD=0.2
```

**Embedding System Configuration:**
```
# Embedding dimensions: 384 (fixed by model)
# Storage format: JSON strings in TEXT columns
# Similarity algorithm: Cosine similarity
# Minimum similarity threshold: 0.2
# Fallback: Keyword matching when embeddings fail
```

**Performance Tuning:**
```
CACHE_MAX_QUERIES_PER_USER=100
CACHE_STD_TTL=3600
CACHE_CHECK_PERIOD=600
ANALYTICS_DEFAULT_LIMIT=100
USER_HISTORY_DEFAULT_LIMIT=50
```

## Deployment Architecture

### Docker Integration

**PostgreSQL Container:**
- Official PostgreSQL 16 image
- Health check monitoring with 10-second intervals
- Persistent volume storage for data retention
- Automatic restart policies

**Application Deployment:**
- Environment-based configuration
- Port mapping (3000:3000)
- Docker Compose orchestration

### Monitoring and Analytics

**Audit Logging:**
- Context assembly process tracking
- Query performance metrics
- User interaction patterns
- System health monitoring

**Performance Metrics:**
- Average response times
- Confidence score distributions
- Cache hit/miss ratios
- Database query performance

## Development Workflow

### Code Quality Standards

**Architecture Patterns:**
- MVC separation with clear layer boundaries
- Service-oriented architecture for business logic
- Middleware pattern for cross-cutting concerns
- Repository pattern for data access

**Error Handling:**
- Centralized error handling middleware
- Structured error responses with consistent format
- Comprehensive logging for debugging
- Graceful degradation for service failures

### Testing Strategy

**API Testing:**
- RESTful endpoint validation
- Input validation testing
- Error response verification
- Performance benchmarking

**Integration Testing:**
- Database connectivity validation
- AI service integration testing
- Cache functionality verification
- End-to-end workflow testing

## Scalability Considerations

### Horizontal Scaling

**Database Scaling:**
- Read replica support for query distribution
- Connection pool optimization for concurrent users
- Query optimization and indexing strategies

**Application Scaling:**
- Stateless service design for load balancing
- Microservice architecture readiness
- Caching layer for reduced database load

## Conclusion

Totem Interactive represents a robust, scalable solution for AI-powered FAQ management. The system successfully integrates modern AI/ML capabilities with traditional web application architecture, providing intelligent query processing while maintaining high performance and security standards. The modular design ensures maintainability and extensibility for future enhancements.

