# Skill Up Platform: 500 Students Load Test Report

- **Target URL**: `https://skilluo.vercel.app`
- **Total Students Simulated**: 500
- **Concurrency Mode**: burst (50 workers)
- **Total Duration**: 45.08 s
- **Overall Success Rate**: 3.2% (16/500)
- **Overall Throughput**: 33.27 req/s

---

## 1. Latency Breakdown

| Phase | Success Count | Min | P50 (Median) | P90 | P95 | P99 | Max | Mean (Avg) |
|---|---|---|---|---|---|---|---|---|
| **1. Registration** (`POST /api/auth/register`) | 147 | 851 ms | 1.49 s | 1.71 s | 1.80 s | 1.88 s | 1.88 s | 1.35 s |
| **2. Welcome Page HTML** (`GET /student`) | 147 | 97 ms | 123 ms | 691 ms | 696 ms | 719 ms | 735 ms | 225 ms |
| **3. Auth Profile API** (`GET /api/auth/me`) | 16 | 232 ms | 275 ms | 323 ms | 332 ms | 332 ms | 332 ms | 276 ms |
| **4. Combined Welcome Screen Load Time** | 147 | 248 ms | 470 ms | 30.15 s | 30.69 s | 30.71 s | 30.72 s | 6.77 s |
| **5. Full End-to-End Onboarding** | 16 | 1.25 s | 1.45 s | 1.69 s | 1.71 s | 1.71 s | 1.71 s | 1.50 s |

---

## 2. Response Status Distribution

```
Reg:201 | Pg:200 | Me:200 : 16
Reg:500 | Pg:null | Me:null : 237
Reg:201 | Pg:200 | Me:500 : 108
Reg:201 | Pg:200 | Me:TIMEOUT : 23
Reg:TIMEOUT | Pg:null | Me:null : 116
```

---

## 3. Bottleneck Analysis & Findings

1. **Registration Computational Overhead**:
   - Each registration executes bcrypt (10 rounds) which is compute-heavy.
   - Multiple sequential database queries to Supabase Mumbai from Vercel Serverless.
2. **Welcome Screen Performance**:
   - Static HTML for `/student` is delivered very fast (< 300 ms).
   - Dynamic user profile `/api/auth/me` query latency depends on Supabase connection pooling and network distance.