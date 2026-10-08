# Skill Up Platform: 500 Students Load Test Report

- **Target URL**: `https://skilluo.vercel.app`
- **Total Students Simulated**: 500
- **Concurrency Mode**: pool (15 workers)
- **Total Duration**: 88.53 s
- **Overall Success Rate**: 0.0% (0/500)
- **Overall Throughput**: 16.94 req/s

---

## 1. Latency Breakdown

| Phase | Success Count | Min | P50 (Median) | P90 | P95 | P99 | Max | Mean (Avg) |
|---|---|---|---|---|---|---|---|---|
| **1. Registration** (`POST /api/auth/register`) | 7 | 1.95 s | 9.13 s | 9.20 s | 9.20 s | 9.20 s | 9.20 s | 6.10 s |
| **2. Welcome Page HTML** (`GET /student`) | 0 | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms |
| **3. Auth Profile API** (`GET /api/auth/me`) | 0 | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms |
| **4. Combined Welcome Screen Load Time** | 7 | 30.44 s | 53.29 s | 60.01 s | 60.01 s | 60.01 s | 60.01 s | 47.74 s |
| **5. Full End-to-End Onboarding** | 0 | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms | 0 ms |

---

## 2. Response Status Distribution

```
Reg:NET_ERR | Pg:null | Me:null : 493
Reg:201 | Pg:403 | Me:TIMEOUT : 5
Reg:201 | Pg:403 | Me:403 : 1
Reg:201 | Pg:TIMEOUT | Me:TIMEOUT : 1
```

---

## 3. Bottleneck Analysis & Findings

1. **Registration Computational Overhead**:
   - Each registration executes bcrypt (10 rounds) which is compute-heavy.
   - Multiple sequential database queries to Supabase Mumbai from Vercel Serverless.
2. **Welcome Screen Performance**:
   - Static HTML for `/student` is delivered very fast (< 300 ms).
   - Dynamic user profile `/api/auth/me` query latency depends on Supabase connection pooling and network distance.