# Architect Knowledge Base

## Architecture Patterns Reference

### 1. Microservices Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Service  │    │  Order Service  │    │Product Service  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │    API    │  │    │  │    API    │  │    │  │    API    │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │ Database  │  │    │  │ Database  │  │    │  │ Database  │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Use Cases**:
- Large, complex applications
- Independent team development
- Different technology stacks per service
- High scalability requirements

### 2. Hexagonal Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Adapters (Ports)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │     Web     │  │     API     │  │     CLI     │        │
│  │  Interface  │  │  Interface  │  │  Interface  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                 │                 │              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Application Core                         │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │             Business Logic                      │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│         │                 │                 │              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Database   │  │  External   │  │  Message    │        │
│  │   Adapter   │  │   Service   │  │   Queue     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 3. Event-Driven Architecture
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Service   │    │    Event    │    │   Service   │
│      A      │───▶│    Bus      │───▶│      B      │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Service   │
                   │      C      │
                   └─────────────┘
```

## Technology Stack Recommendations

### 1. Web Applications
```yaml
Frontend:
  SPA: React, Vue.js, Angular
  SSR: Next.js, Nuxt.js, SvelteKit
  Mobile: React Native, Flutter
  
Backend:
  API: Node.js (Express, Fastify), Python (FastAPI, Django)
  Enterprise: Java (Spring Boot), C# (.NET Core)
  
Database:
  Relational: PostgreSQL, MySQL
  NoSQL: MongoDB, Redis
  Search: Elasticsearch
  
Infrastructure:
  Container: Docker, Kubernetes
  Cloud: AWS, Azure, Google Cloud
  CI/CD: GitHub Actions, GitLab CI
```

### 2. Data Processing
```yaml
Batch Processing:
  - Apache Spark
  - Apache Airflow
  - AWS Batch
  
Stream Processing:
  - Apache Kafka
  - Apache Pulsar
  - AWS Kinesis
  
Analytics:
  - Apache Superset
  - Grafana
  - Tableau
```

## Performance Optimization Strategies

### 1. Caching Layers
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │     CDN     │    │   Server    │
│   Cache     │    │   Cache     │    │   Cache     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Application │    │ Application │    │  Database   │
│   Server    │    │   Server    │    │   Server    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 2. Database Optimization
- **Indexing Strategy**: Create indexes for frequent queries
- **Query Optimization**: Use EXPLAIN plans to optimize queries
- **Connection Pooling**: Manage database connections efficiently
- **Read Replicas**: Distribute read operations
- **Partitioning**: Split large tables for better performance

### 3. Scalability Patterns
```
Load Balancer
      │
   ┌──┴──┐
   │     │
   ▼     ▼
App     App
Server  Server
   │     │
   └──┬──┘
      │
   Database
```

## Security Architecture Patterns

### 1. Zero Trust Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Identity &  │  │   Device    │  │   Network   │        │
│  │   Access    │  │   Security  │  │   Security  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    API      │  │    Web      │  │   Mobile    │        │
│  │   Gateway   │  │   Portal    │  │     App     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 2. API Security
- **Authentication**: OAuth 2.0, JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Prevent abuse and DDoS
- **Input Validation**: Sanitize all inputs
- **HTTPS**: Encrypt all communications

## Monitoring and Observability

### 1. Three Pillars of Observability
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Metrics   │    │    Logs     │    │   Traces    │
│             │    │             │    │             │
│ • CPU Usage │    │ • App Logs  │    │ • Request   │
│ • Memory    │    │ • Error     │    │   Flow      │
│ • Response  │    │   Logs      │    │ • Latency   │
│   Time      │    │ • Access    │    │   Tracking  │
│             │    │   Logs      │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 2. Alerting Strategy
- **SLA-based Alerts**: Monitor service level agreements
- **Anomaly Detection**: Detect unusual patterns
- **Escalation Policies**: Define who gets notified when
- **Runbook Integration**: Link alerts to resolution procedures

## Common Anti-Patterns to Avoid

### 1. Architecture Anti-Patterns
- **Big Ball of Mud**: Lack of clear structure
- **Spaghetti Code**: Tangled dependencies
- **Golden Hammer**: Using one solution for everything
- **Premature Optimization**: Optimizing before measuring
- **Vendor Lock-in**: Over-dependence on specific vendors

### 2. Design Anti-Patterns
- **God Object**: One class doing everything
- **Tight Coupling**: Components too dependent on each other
- **Circular Dependencies**: Components depending on each other
- **Interface Bloat**: Too many methods in interfaces
- **Singleton Abuse**: Overusing singleton pattern

## Migration Strategies

### 1. Strangler Fig Pattern
```
┌─────────────────────────────────────────────────────────────┐
│                    Legacy System                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Module    │  │   Module    │  │   Module    │        │
│  │      A      │  │      B      │  │      C      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ (Gradual Migration)
┌─────────────────────────────────────────────────────────────┐
│                    New System                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Service    │  │  Service    │  │  Service    │        │
│  │      A      │  │      B      │  │      C      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 2. Database Migration
- **Dual Write**: Write to both old and new systems
- **Event Sourcing**: Capture all changes as events
- **Blue-Green Deployment**: Switch between environments
- **Canary Releases**: Gradual rollout to users