# GlassMind — Architecture Overview

## System Architecture

GlassMind is an Explainable AI (XAI) platform designed to make AI decisions transparent, interpretable, and trustworthy. The system follows a modular monorepo architecture with clear separation between frontend, backend, and shared contracts.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│              Next.js 15 (App Router)                    │
│         React 19 + TailwindCSS v4 + shadcn/ui          │
└──────────────────────┬──────────────────────────────────┘
                       │ REST / WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                     API Gateway                         │
│                  FastAPI + CORS                         │
├─────────────────────────────────────────────────────────┤
│                   Service Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ Planner  │  │Retriever │  │   Explanation       │    │
│  │          │  │          │  │   Engine             │    │
│  └──────────┘  └──────────┘  └────────────────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ Reranker │  │Confidence│  │  Counterfactual     │    │
│  │          │  │ Scorer   │  │  Generator           │    │
│  └──────────┘  └──────────┘  └────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐   │
│  │          LangGraph Orchestration                  │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                    Data Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │PostgreSQL│  │  Redis   │  │  Qdrant  │              │
│  │  (RDBMS) │  │ (Cache)  │  │ (Vector) │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Module Boundaries

### Frontend (`frontend/`)
- **Responsibility**: User interface, state management, API communication
- **Key patterns**: Component-based architecture, provider pattern, Zustand stores
- **Does NOT**: Contain business logic, make direct database calls

### Backend (`backend/`)
- **Responsibility**: API endpoints, AI orchestration, data persistence
- **Key patterns**: Service layer, repository pattern, dependency injection
- **Does NOT**: Serve static files, contain UI logic

### Shared (`shared/`)
- **Responsibility**: Type definitions, API contracts, event schemas
- **Key patterns**: TypeScript interfaces, JSON schemas
- **Does NOT**: Contain implementation code

## Data Flow

1. **User Query** → Frontend captures input and sends to backend API
2. **Planning** → LangGraph planner determines the execution strategy
3. **Retrieval** → Relevant documents retrieved from Qdrant vector store
4. **Reranking** → Results reranked for relevance
5. **Generation** → LLM generates response with explanations
6. **Confidence Scoring** → Confidence metrics computed for the response
7. **Explanation** → XAI techniques applied (SHAP, attention, counterfactuals)
8. **Visualization** → Explanation data packaged for frontend rendering
9. **Response** → Structured response with explanations sent to frontend

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Monorepo | Shared types, atomic deployments, unified CI/CD |
| App Router | Server components, streaming, improved performance |
| FastAPI | Async-native, auto-docs, Pydantic integration |
| LangGraph | Stateful multi-step AI workflows |
| Qdrant | Purpose-built vector DB with filtering |
| Zustand | Lightweight, TypeScript-first state management |
