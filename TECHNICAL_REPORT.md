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
- Relational data storage for FAQs, users, and queries
- Connection pooling for optimal performance
- Docker containerization for consistent deployment

**AI/ML Integration:** Hugging Face Transformers  
- Semantic similarity matching using sentence-transformers/all-MiniLM-L6-v2
- Context-aware answer generation
- Configurable similarity thresholds

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

### Semantic Search Engine

The system implements a sophisticated semantic search mechanism:

**Context Assembly Process:**
1. User metadata retrieval and preference analysis
2. Semantic similarity matching against FAQ database
3. Recent query history integration for context
4. Confidence scoring based on multiple factors

**Answer Generation:**
- Primary match selection based on similarity thresholds
- Fallback responses for low-confidence queries
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
CONTEXT_SIMILARITY_THRESHOLD=0.5
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

