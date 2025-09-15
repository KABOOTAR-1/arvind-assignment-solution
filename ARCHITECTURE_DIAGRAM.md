# Totem Interactive - System Architecture Diagram

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOTEM INTERACTIVE FAQ SYSTEM                 │
│                     AI-Powered Knowledge Base                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │  Web Frontend   │    │  Mobile Apps    │
│                 │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     REST API Gateway    │
                    │    (Express.js Server)  │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                       │                        │
┌───────▼───────┐    ┌─────────▼────────┐    ┌─────────▼────────┐
│   Middleware   │    │   Route Handlers │    │   Controllers    │
│                │    │                  │    │                  │
│ • Validation   │    │ • FAQ Routes     │    │ • FAQ Controller │
│ • Logging      │    │ • User Routes    │    │ • User Controller│
│ • Error Handle │    │ • Query Routes   │    │ • Query Control  │
│ • CORS/Helmet  │    │ • Session Routes │    │ • Session Control│
└───────┬───────┘    └─────────┬────────┘    └─────────┬────────┘
        │                      │                       │
        └──────────────────────┼───────────────────────┘
                               │
              ┌────────────────▼────────────────┐
              │         BUSINESS LOGIC          │
              └────────────────┬────────────────┘
                               │
    ┌──────────────────────────┼──────────────────────────┐
    │                          │                          │
┌───▼────┐  ┌─────────▼────────┐  ┌────────▼────────┐   │
│ Models │  │     Services     │  │   AI/ML Engine  │   │
│        │  │                  │  │                 │   │
│ • FAQ  │  │ • Context Svc    │  │ • HuggingFace   │   │
│ • User │  │ • Semantics Svc  │  │ • Embeddings    │   │
│ • Query│  │ • Cache Service  │  │ • Similarity    │   │
│ • Sess │  │ • Audit Service  │  │ • 384D Vectors  │   │
└───┬────┘  └─────────┬────────┘  └────────┬────────┘   │
    │                 │                    │            │
    └─────────────────┼────────────────────┘            │
                      │                                 │
         ┌────────────▼────────────┐                    │
         │      DATA LAYER         │                    │
         └────────────┬────────────┘                    │
                      │                                 │
    ┌─────────────────┼─────────────────┐              │
    │                 │                 │              │
┌───▼────┐  ┌────────▼────────┐  ┌─────▼──────┐      │
│PostgreS│  │  Redis Cache    │  │ HuggingFace│      │
│Database│  │                 │  │    API     │      │
│        │  │ • User Queries  │  │            │      │
│ • FAQs │  │ • Session Data  │  │ • Embedding│      │
│ • Users│  │ • Performance   │  │   Generation│      │
│ • Query│  │   Metrics       │  │ • ML Models│      │
│ • Sess │  └─────────────────┘  └────────────┘      │
│ • Audit│                                           │
└────────┘                                           │
                                                     │
              ┌──────────────────────────────────────┘
              │
    ┌─────────▼─────────┐
    │   EXTERNAL APIs   │
    │                   │
    │ • HuggingFace Hub │
    │ • Transformer API │
    │ • Model Registry  │
    └───────────────────┘
```

## 🔄 Data Flow Architecture

```
USER REQUEST FLOW:
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Client │───▶│   API   │───▶│Validate │───▶│Controller│
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                                                   │
                                                   ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Response │◀───│ Format  │◀───│Business │◀───│ Context │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                               │  Logic       │ Service
                               ▼              ▼
                        ┌─────────┐    ┌─────────┐
                        │Database │    │   AI    │
                        │ Models  │    │ Service │
                        └─────────┘    └─────────┘

SEMANTIC SEARCH FLOW:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│User Question│───▶│  Generate   │───▶│  Compare    │
│   "Hours?"  │    │ Embedding   │    │ Similarity  │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │HuggingFace  │    │   Find      │
                   │384D Vector  │    │Best Matches │
                   └─────────────┘    └─────────────┘
                                             │
                                             ▼
                                      ┌─────────────┐
                                      │   Return    │
                                      │   Answer    │
                                      └─────────────┘
```

## 🗂️ Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CONTROLLERS                              │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│FAQController│UserController│QueryController│SessionController  │
│             │             │             │                     │
│• CRUD FAQs  │• User Mgmt  │• Process Q  │• Session Mgmt       │
│• Categories │• Login/Reg  │• Analytics  │• Auto-create        │
│• Embeddings │• History    │• Context    │• Expiration         │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         MODELS                                  │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│  FAQ Model  │ User Model  │Query Model  │  Session Model      │
│             │             │             │                     │
│• Questions  │• Profile    │• Q&A Pairs  │• User Sessions      │
│• Answers    │• Email      │• Similarity │• Session Data       │
│• Embeddings │• Metadata   │• Timestamps │• Auto-expiry        │
│• Categories │• Created    │• Context    │• Tracking           │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICES                                 │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│Context Svc  │Semantics Svc│HuggingFace  │Cache/Audit Services │
│             │             │   Service   │                     │
│• Assemble   │• Similarity │• Embeddings │• Performance        │
│• User Data  │• Matching   │• 384D Vec   │• Query Cache        │
│• Recent Q   │• Threshold  │• API Calls  │• Audit Logs         │
│• Bundle     │• Ranking    │• ML Models  │• Analytics          │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
```

## 🔐 Security & Session Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Network   │    │Application  │    │    Data     │
│  Security   │    │  Security   │    │  Security   │
│             │    │             │    │             │
│• CORS       │    │• Validation │    │• Encryption │
│• Helmet.js  │    │• Sanitize   │    │• Env Vars   │
│• HTTPS/TLS  │    │• SQL Inject │    │• Audit Log  │
└─────────────┘    └─────────────┘    └─────────────┘

SESSION MANAGEMENT FLOW:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│User Creates │───▶│Auto Session │───▶│24hr Expiry  │
│  Account    │    │  Generated  │    │   Timer     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│User Login   │───▶│New Session  │───▶│Session Data │
│  Endpoint   │    │  Created    │    │   Stored    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    USERS    │    │    FAQS     │    │   QUERIES   │
│             │    │             │    │             │
│• id (PK)    │    │• id (PK)    │    │• id (PK)    │
│• name       │    │• question   │    │• question   │
│• email      │    │• answer     │    │• answer     │
│• metadata   │    │• category   │    │• user_id FK │
│• created_at │    │• keywords   │    │• session_id │
│• updated_at │    │• embedding  │    │• context    │
└──────┬──────┘    │• created_at │    │• similarity │
       │           │• updated_at │    │• proc_time  │
       │           └─────────────┘    │• created_at │
       │                              └──────┬──────┘
       │                                     │
       ▼                                     ▼
┌─────────────┐                      ┌─────────────┐
│USER_SESSIONS│                      │ AUDIT_LOGS  │
│             │                      │             │
│• id (PK)    │                      │• id (PK)    │
│• user_id FK │◀─────────────────────│• query_id FK│
│• sess_data  │                      │• context    │
│• expires_at │                      │• algorithm  │
│• created_at │                      │• assembly   │
│• updated_at │                      │• metrics    │
└─────────────┘                      │• created_at │
                                     └─────────────┘

RELATIONSHIPS:
• Users (1) ──── (Many) Sessions
• Users (1) ──── (Many) Queries  
• Sessions (1) ── (Many) Queries
• Queries (1) ─── (Many) Audit_Logs
```

## 🚀 AI/ML Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEMANTIC SEARCH ENGINE                      │
└─────────────────────────────────────────────────────────────────┘

INPUT PROCESSING:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│User Query   │───▶│Preprocess   │───▶│Tokenization │
│"Store hours"│    │Text Clean   │    │& Normalize  │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
EMBEDDING GENERATION:                        ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│HuggingFace  │◀───│sentence-    │◀───│Send to API  │
│   API       │    │transformers │    │   Request   │
└─────────────┘    └─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│384D Vector  │───▶│Store in DB  │───▶│JSON Format  │
│Embedding    │    │PostgreSQL   │    │Text Column  │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
SIMILARITY MATCHING:                         ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Cosine Sim   │◀───│Compare All  │◀───│Retrieve All │
│Calculation  │    │FAQ Vectors  │    │Embeddings   │
└─────────────┘    └─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Filter by    │───▶│Rank by      │───▶│Return Best  │
│Threshold    │    │Confidence   │    │Match Answer │
│(≥ 0.2)      │    │Score        │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🔄 Deployment Architecture

```
DEVELOPMENT ENVIRONMENT:
┌─────────────────────────────────────────────────────────────────┐
│                      LOCAL SETUP                               │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│   Node.js   │ PostgreSQL  │    Redis    │   HuggingFace       │
│Application  │  Container  │   Cache     │      API            │
│             │             │             │                     │
│• Port 3000  │• Port 5432  │• Port 6379  │• External Service   │
│• Hot Reload │• Docker     │• Docker     │• API Key Required   │
│• Dev Logs   │• Local Vol  │• Memory     │• Rate Limited       │
└─────────────┴─────────────┴─────────────┴─────────────────────┘

PRODUCTION ENVIRONMENT:
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Load Balancer│───▶│App Instance │    │App Instance │
│   (Nginx)   │    │     #1      │    │     #2      │
└─────────────┘    └──────┬──────┘    └──────┬──────┘
                          │                  │
                          ▼                  ▼
                   ┌─────────────────────────────┐
                   │    PostgreSQL Cluster       │
                   │  ┌─────────┐ ┌─────────┐   │
                   │  │ Master  │ │ Replica │   │
                   │  └─────────┘ └─────────┘   │
                   └─────────────────────────────┘
                                  │
                                  ▼
                          ┌─────────────┐
                          │Redis Cluster│
                          │High Avail.  │
                          └─────────────┘
```

---

## 📋 Architecture Principles

### **🎯 Design Patterns**
- **MVC Architecture**: Clear separation of concerns
- **Service Layer**: Business logic encapsulation  
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: Loose coupling

### **⚡ Performance**
- **Connection Pooling**: Database efficiency
- **Caching Strategy**: Redis for hot data
- **Async Processing**: Non-blocking operations
- **Optimized Queries**: Indexed database access

### **🔒 Security**
- **Input Validation**: Joi schema validation
- **SQL Injection**: Parameterized queries
- **Session Security**: Auto-expiration & tracking
- **Environment Config**: Secure credential storage

### **📈 Scalability**
- **Stateless Design**: Horizontal scaling ready
- **Microservice Ready**: Modular architecture
- **Load Balancing**: Multi-instance support
- **Database Scaling**: Master-replica setup
