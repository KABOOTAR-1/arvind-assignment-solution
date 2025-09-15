# Video Demonstration Guide: Totem Interactive AI FAQ System

## 🎬 Video Script & Storyboard (2-3 Minutes)

### **Opening (0:00 - 0:20)**
**Scene:** Project overview with code editor showing project structure
**Narration:** 
"Welcome to Totem Interactive - an AI-powered FAQ management system built with Node.js, PostgreSQL, and Hugging Face transformers. This system provides intelligent query processing with semantic search capabilities."

**Visual:** 
- Show project folder structure in VS Code

## 📝 Demo Script

### **Introduction (0:00 - 0:30)**
**Scene:** Application overview and setup
**Narration:**
"Welcome to Totem Interactive - an AI-powered FAQ system that combines semantic search with intelligent session management. Built with Node.js, PostgreSQL, and HuggingFace transformers, this system understands natural language queries and provides contextual answers using 384-dimensional embeddings."

**Visual:**
- Show project structure in IDE
- Display running Docker containers (PostgreSQL)
- Show server startup in terminal: `npm start`
- Brief overview of the tech stack and architecture

### **API Testing Setup (0:30 - 1:00)**
**Scene:** Setting up API testing environment
**Narration:**
"Let's demonstrate our comprehensive REST API. We'll use PowerShell to showcase FAQ management, user authentication with automatic session creation, and intelligent query processing."

**Visual:**
- Open PowerShell terminal
- Show prepared API commands
- Display base URL: http://localhost:3000

### **FAQ Management Demo (1:00 - 1:30)**
**Scene:** CRUD operations on FAQ endpoints
**Narration:**
"First, let's manage our FAQ database. Each FAQ automatically generates embeddings for semantic search."

**API Calls to demonstrate:**

1. **GET /api/faqs** - List all FAQs

2. **POST /api/faqs** - Create new FAQ
```json
Request: {
  "question": "What are your business hours?",
  "answer": "We are open Monday to Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. We are closed on Sundays and public holidays.",
  "category": "general"
}

Response: {
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "question": "What are your business hours?",
    "answer": "We are open Monday to Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. We are closed on Sundays and public holidays.",
    "category": "general",
    "embedding": "[0.1234, -0.5678, ...]",
    "created_at": "2024-01-15T14:30:00Z"
  }
}
```

3. **GET /api/faqs/:id** - Get specific FAQ by ID

### **User Management Demo (1:30 - 1:50)**
**Scene:** User operations and history tracking
**Narration:**
"The system tracks users and their query history for personalized responses."

**API Calls:**

1. **POST /api/users** - Create user
```json
Request: {
  "name": "John Doe",
  "email": "john@example.com",
  "metadata": {
    "preferences": {
      "detail_level": "detailed"
    }
  }
}

Response: {
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "metadata": {
        "preferences": {
          "detail_level": "detailed"
        }
      }
    },
    "session": {
      "id": "987fcdeb-51a2-43d1-b789-123456789abc",
      "expires_at": "2024-01-16T14:30:00Z"
    }
  }
}
```

2. **GET /api/users/:id** - Get user details
```json
Response: {
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "metadata": {
      "preferences": {
        "detail_level": "detailed"
      }
    },
    "created_at": "2024-01-15T14:30:00Z"
  }
}
```

### **AI Query Processing Demo (2:00 - 2:30)**
**Scene:** Intelligent query processing showcase
**Narration:**
"Here's the AI magic - semantic search using 384-dimensional embeddings and cosine similarity. Watch how the system understands natural language queries and matches different phrasings to the same FAQ with varying confidence scores. The system generates embeddings in real-time and stores them as JSON strings in PostgreSQL."

**API Calls:**

1. **POST /api/queries** - Process intelligent query
```json
Request: {
  "question": "When are you open?",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}

Response: {
  "success": true,
  "data": {
    "question": "When are you open?",
    "answer": "We are open Monday to Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. We are closed on Sundays and public holidays.",
    "confidence": 0.92,
    "source": "semantic_match",
    "faq_id": "550e8400-e29b-41d4-a716-446655440001",
    "responseTime": 245
  }
}
```

### **Analytics & Performance Demo (3:30 - 4:00)**
**Scene:** System analytics and performance metrics
**Narration:**
"Finally, let's check our system analytics. The audit service tracks all query processing for performance monitoring and insights."

**API Calls:**

1. **GET /api/queries/analytics** - System performance analytics
```json
Request: GET /api/queries/analytics

Response: {
  "success": true,
  "data": {
    "totalQueries": 15,
    "averageResponseTime": 245,
    "averageConfidence": 0.87,
    "queryDistribution": {
      "general": 8,
      "account": 3,
      "payment": 2,
      "shipping": 1,
      "returns": 1
    },
    "performanceMetrics": {
      "fastestQuery": 120,
      "slowestQuery": 450,
      "highConfidenceQueries": 12,
      "lowConfidenceQueries": 3
    }
  }
}
```


2. **GET /api/queries** - View all processed queries
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/queries?userId=$userId1" -Method GET
```
---

## 🎬 **Closing (3:50 - 4:00)**
**Scene:** Summary and conclusion
**Narration:**
"This demonstrates Totem Interactive's powerful combination of AI-driven semantic search, automatic session management, and comprehensive analytics. The system provides intelligent, contextual responses while maintaining detailed audit trails for performance optimization."

**Visual:**
- Show final terminal output with all successful API calls
- Display system architecture diagram briefly
- Show project repository structure

---

## 📋 Pre-Recording Checklist

### Environment Setup
- [ ] Docker containers running (PostgreSQL)
- [ ] Node.js server started (`npm start`)
- [ ] Database populated with sample data and embeddings
- [ ] HuggingFace API token configured
- [ ] All dependencies installed
- [ ] PowerShell/terminal ready for API calls

### Session Management Verification
- [ ] User creation auto-generates sessions
- [ ] Login endpoint creates new sessions
- [ ] Session expiration working (24-hour default)
- [ ] Session data updates functioning
- [ ] Session cleanup operations ready

### Recording Setup
- [ ] Screen recording software configured
- [ ] Audio levels tested
- [ ] PowerShell commands prepared and tested
- [ ] Script reviewed and practiced
- [ ] Backup API calls prepared in case of failures

### Content Verification
- [ ] All API endpoints responding correctly
- [ ] Sample data loaded and verified
- [ ] Embedding generation working
- [ ] Semantic search returning results
- [ ] Session management endpoints functional
- [ ] User authentication flow working
- [ ] Analytics endpoints providing data
- [ ] Error handling demonstrations prepared

### Post-Recording
- [ ] Video edited and compressed
- [ ] Captions/subtitles added if needed
- [ ] Upload to designated platform
- [ ] Documentation updated with video links

---

## 🎯 **Key Demo Points to Emphasize**

### **Technical Excellence**
- **384-dimensional embeddings** for semantic understanding
- **Real-time embedding generation** with HuggingFace API
- **Cosine similarity matching** with configurable thresholds
- **Automatic session management** with 24-hour expiration

### **Business Value**
- **Natural language understanding** - users ask questions naturally
- **Intelligent matching** - different phrasings find same answers
- **User context tracking** - personalized experience with sessions
- **Performance analytics** - comprehensive audit logging

### **System Robustness**
- **Comprehensive validation** with Joi schemas
- **Error handling** at all layers
- **Security features** with Helmet.js and CORS
- **Scalable architecture** with modular design

---

## 📊 **Sample Test Queries for Demo**

### **Business Hours Variations**
- "When are you open?"
- "What time do you close?"
- "Are you open on weekends?"
- "What are your hours?"

### **Password Reset Variations**
- "I forgot my password"
- "How do I reset my login?"
- "I can't remember my credentials"
- "Lost password help"

### **Payment Method Variations**
- "What cards do you accept?"
- "Can I pay with PayPal?"
- "What payment options are available?"
- "Do you take credit cards?"

### **Return Policy Variations**
- "How do I return something?"
- "What's your return policy?"
- "Can I get a refund?"
- "Return process information"

---

## 🎥 **Recording Settings**
- **Resolution:** 1920x1080 (1080p)
- **Frame Rate:** 30 FPS
- **Audio:** Clear microphone, noise cancellation
- **Duration:** 3:30 - 4:00 minutes
- **Format:** MP4 for universal compatibility
- Highlight how all return the same FAQ (faq_id: 550e8400-e29b-41d4-a716-446655440001) 
- Show confidence scores ranging from 0.84 to 0.95
- Display response times (all under 250ms)
- Use color coding: Green for high confidence (>0.9), Yellow for medium (0.8-0.9)
- Add visual arrows pointing to the same FAQ being matched

### **Analytics & Monitoring (2:30 - 2:45)**
**Scene:** System analytics and performance metrics
**Narration:**
"The system provides comprehensive analytics for monitoring query performance and user interactions."

**API Calls:**
1. **GET /api/queries/analytics** - Show system metrics
2. **GET /api/queries** - Display query history with filtering

### **Closing (2:45 - 3:00)**
**Scene:** Code editor with technical highlights
**Narration:**
"Totem Interactive combines modern AI with robust backend architecture - featuring semantic search, real-time analytics, and enterprise-ready scalability."

**Visual:**
- Quick scroll through key code files
- Show Docker containers running
- Display final API response with metrics

---

## 🛠️ Recording Setup & Tools

### **Recommended Tools:**

**Screen Recording:**
- **OBS Studio** (Free, professional quality)
- **Camtasia** (Paid, easy editing)
- **Loom** (Quick, web-based)

**API Testing:**
- **Postman** (Most popular, good UI)
- **Thunder Client** (VS Code extension)
- **Insomnia** (Clean interface)

**Video Editing:**
- **DaVinci Resolve** (Free, professional)
- **Adobe Premiere Pro** (Paid, industry standard)
- **Filmora** (User-friendly, affordable)

### **Recording Settings:**
- **Resolution:** 1920x1080 (1080p)
- **Frame Rate:** 30 FPS
- **Audio:** Clear microphone, noise cancellation
- **Duration:** 2:30 - 3:00 minutes

---

## 📋 Pre-Recording Checklist

### Environment Setup
- [ ] Docker containers running (PostgreSQL)
- [ ] Node.js server started (`npm start`)
- [ ] Database populated with sample data and embeddings
- [ ] HuggingFace API token configured
- [ ] All dependencies installed
- [ ] PowerShell/terminal ready for API calls

### Session Management Verification
- [ ] User creation auto-generates sessions
- [ ] Login endpoint creates new sessions
- [ ] Session expiration working (24-hour default)
- [ ] Session data updates functioning
- [ ] Session cleanup operations ready

### Recording Setup
- [ ] Screen recording software configured
- [ ] Audio levels tested
- [ ] Browser tabs prepared (if using Postman/Insomnia)
- [ ] Script reviewed and practiced
- [ ] Backup API calls prepared in case of failures

### Content Verification
- [ ] All API endpoints responding correctly
- [ ] Sample data loaded and verified
- [ ] Embedding generation working
- [ ] Semantic search returning results
- [ ] Session management endpoints functional
- [ ] User authentication flow working
- [ ] Error handling demonstrations prepared

### Post-Recording
- [ ] Video edited and compressed
- [ ] Captions/subtitles added if needed
- [ ] Upload to designated platform
- [ ] Documentation updated with video links

### **Sample Test Data:**

**Users:**
```json
{
  "name": "Demo User",
  "email": "demo@toteminteractive.com",
  "metadata": {
    "preferences": {
      "detail_level": "detailed"
    }
  }
}
```

**FAQs:**
```json
{
  "question": "How do I reset my password?",
  "answer": "Click 'Forgot Password' on the login page and follow email instructions.",
  "category": "account"
}
```

**Semantic Similarity Test Queries:**

**Business Hours FAQ Testing (Embedding-based matching):**
- "When are you open?" → Expected similarity: ~0.85+ (cosine similarity)
- "What time do you close?" → Expected similarity: ~0.75+ (cosine similarity)
- "Are you available on weekends?" → Expected similarity: ~0.65+ (cosine similarity)
- "Business hours schedule" → Expected similarity: ~0.90+ (cosine similarity)
- "Operating times information" → Expected similarity: ~0.80+ (cosine similarity)

**Note:** Confidence scores are calculated from similarity scores and other factors. Minimum similarity threshold is 0.2.

**Password Reset FAQ Testing:**
- "How do I reset my password?" → Expected confidence: ~0.98
- "Forgot my password" → Expected confidence: ~0.91
- "Password recovery help" → Expected confidence: ~0.89
- "Can't remember login details" → Expected confidence: ~0.82

**Payment Methods FAQ Testing:**
- "What payment options do you accept?" → Expected confidence: ~0.94
- "How can I pay?" → Expected confidence: ~0.88
- "Payment methods available" → Expected confidence: ~0.92
- "Credit card accepted?" → Expected confidence: ~0.85

---

## 🎥 Recording Tips

### **Visual Best Practices:**
1. **Clean Interface:** Hide taskbar, close unnecessary windows
2. **Zoom Level:** Increase font size for better visibility
3. **Cursor Highlighting:** Enable cursor effects for clarity
4. **Smooth Transitions:** Move slowly between applications
5. **Response Timing:** Wait for API responses to fully load

### **Audio Guidelines:**
1. **Clear Narration:** Speak slowly and clearly
2. **Background Music:** Optional, keep volume low
3. **Sound Effects:** Minimal, only for transitions
4. **Microphone:** Use external mic for better quality

### **Content Flow:**
1. **Hook:** Start with compelling overview
2. **Problem-Solution:** Show what the system solves
3. **Features:** Demonstrate key capabilities
4. **Technical Depth:** Show code/architecture briefly
5. **Call-to-Action:** End with next steps

---

## 📤 Post-Production

### **Editing Checklist:**
- [ ] Add intro/outro graphics
- [ ] Include captions for accessibility
- [ ] Add zoom effects for important details
- [ ] Insert transition effects between sections
- [ ] Balance audio levels
- [ ] Export in multiple formats (MP4, WebM)

### **Distribution Formats:**
- **YouTube:** 1080p MP4, optimized for web
- **LinkedIn:** Square format (1:1) version
- **GitHub:** Embedded in README or releases
- **Presentation:** Lower resolution for file size

### **Metadata:**
- **Title:** "Totem Interactive: AI-Powered FAQ System Demo"
- **Description:** Include GitHub link and key features
- **Tags:** Node.js, AI, FAQ, REST API, PostgreSQL
- **Thumbnail:** Clean screenshot with project logo
