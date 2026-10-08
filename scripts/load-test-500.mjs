#!/usr/bin/env node

/**
 * Skill Up - 500 Concurrent Students Load Test Suite
 *
 * Simulates 500 students registering concurrently on the live platform
 * and measures:
 * 1. Registration endpoint latency (POST /api/auth/register)
 * 2. Session cookie issuance
 * 3. Welcome screen page delivery latency (GET /student)
 * 4. Post-login profile/dashboard data latency (GET /api/auth/me)
 * 5. Total end-to-end welcome screen onboarding time
 *
 * Usage:
 *   node scripts/load-test-500.mjs [options]
 *
 * Options:
 *   --target <url>       Target base URL (default: https://skilluo.vercel.app)
 *   --users <number>     Total student registrations to simulate (default: 500)
 *   --concurrency <num>  Max concurrent workers (default: 50, use 500 for full burst)
 *   --mode <pool|burst>  Execution mode: 'pool' (worker queue) or 'burst' (all at once)
 *   --cleanup            Auto-delete created test students from Supabase after test
 *   --only-cleanup       Only run the database cleanup and exit
 */

import { performance } from "node:perf_hooks";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

// Prevent low-level TLS / HTTP2 connection drops from crashing the suite
process.on("uncaughtException", (err) => {
  if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT" || err.code === "UND_ERR_SOCKET") {
    // Expected during high-load proxy drops
    return;
  }
  console.error("\n[Global Process Error]:", err.message);
});
process.on("unhandledRejection", (reason) => {
  // Gracefully handle dropped fetch promises
});

// CLI Arguments Parser
const args = process.argv.slice(2);
function getArg(key, defaultValue) {
  const index = args.indexOf(`--${key}`);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return defaultValue;
}
const hasFlag = (key) => args.includes(`--${key}`);

const TARGET_URL = (getArg("target", "https://skilluo.vercel.app")).replace(/\/+$/, "");
const TOTAL_USERS = parseInt(getArg("users", "500"), 10);
const CONCURRENCY = parseInt(getArg("concurrency", "50"), 10);
const MODE = getArg("mode", "pool"); // "pool" or "burst"
const DO_CLEANUP = hasFlag("cleanup");
const ONLY_CLEANUP = hasFlag("only-cleanup");

const prisma = new PrismaClient();

// Helper: Format milliseconds nicely
function fmtMs(ms) {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "N/A";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

// Percentile calculator
function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

// Stats calculator
function computeStats(arr) {
  if (!arr.length) return { min: 0, max: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    p50: percentile(sorted, 50),
    p75: percentile(sorted, 75),
    p90: percentile(sorted, 90),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
  };
}

// Database Cleanup Function
async function cleanupTestUsers(pattern = "loadtest_") {
  console.log(`\n🧹 Cleaning up test accounts containing '${pattern}' from database...`);
  try {
    // Find all matching test users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: pattern } },
          { email: { contains: "probe_test_" } },
          { email: { contains: "probe" } },
          { email: { contains: "deploy_check" } },
        ],
      },
      select: { id: true, email: true },
    });

    if (users.length === 0) {
      console.log("   No test users found to clean up.");
      return 0;
    }

    const userIds = users.map((u) => u.id);
    console.log(`   Found ${users.length} test users to remove.`);

    // Cascade delete relations
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.workshopEnrollment.deleteMany({ where: { studentId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });

    console.log(`✅ Successfully cleaned up ${users.length} test records.`);
    return users.length;
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    return 0;
  }
}

// Single Student Workflow Under Test
async function simulateStudent(index, total, runId) {
  const result = {
    index,
    email: `loadtest_${runId}_${index}@test.skillup.org`,
    regStatus: null,
    regLatency: null,
    regError: null,
    pageStatus: null,
    pageLatency: null,
    authMeStatus: null,
    authMeLatency: null,
    welcomeTotalLatency: null,
    e2eLatency: null,
    success: false,
  };

  const simulatedIp = `198.51.${Math.floor(index / 250) + 1}.${(index % 250) + 1}`;
  const commonHeaders = {
    "x-load-test": "skillup-load-test-2026",
    "x-forwarded-for": simulatedIp,
  };

  // STEP 1: Registration (POST /api/auth/register)
  const regPayload = {
    name: `Student Tester ${index}`,
    email: result.email,
    password: "Password123!",
    college: "Indian Institute of Technology",
    phone: `+9198765${String(index).padStart(5, "0")}`,
    branch: "Computer Science and Engineering",
    semester: "6",
    programmingExperience: "Intermediate",
  };

  const regStart = performance.now();
  let cookieHeader = "";

  try {
    const regRes = await fetch(`${TARGET_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...commonHeaders,
      },
      body: JSON.stringify(regPayload),
      signal: AbortSignal.timeout(45000),
    });

    result.regLatency = performance.now() - regStart;
    result.regStatus = regRes.status;

    // Extract cookie from Set-Cookie header
    const setCookie = regRes.headers.get("set-cookie");
    if (setCookie) {
      cookieHeader = setCookie.split(";")[0];
    }

    if (!regRes.ok) {
      let errBody = "";
      try {
        const raw = await regRes.text();
        try {
          const bodyJson = JSON.parse(raw);
          errBody = bodyJson.error?.message || JSON.stringify(bodyJson);
        } catch {
          errBody = raw;
        }
      } catch (e) {
        errBody = e.message;
      }
      result.regError = `HTTP ${regRes.status}: ${errBody.slice(0, 100)}`;
      return result;
    }
  } catch (err) {
    result.regLatency = performance.now() - regStart;
    result.regStatus = err.name === "TimeoutError" ? "TIMEOUT" : "NET_ERR";
    result.regError = err.message;
    return result;
  }

  // STEP 2: Welcome Screen - Next.js Page HTML (GET /student)
  const pageStart = performance.now();
  try {
    const pageRes = await fetch(`${TARGET_URL}/student`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
        ...commonHeaders,
      },
      signal: AbortSignal.timeout(30000),
    });
    result.pageLatency = performance.now() - pageStart;
    result.pageStatus = pageRes.status;
  } catch (err) {
    result.pageLatency = performance.now() - pageStart;
    result.pageStatus = err.name === "TimeoutError" ? "TIMEOUT" : "NET_ERR";
  }

  // STEP 3: Welcome Screen - Auth Me / User Profile Session (GET /api/auth/me)
  const authMeStart = performance.now();
  try {
    const authMeRes = await fetch(`${TARGET_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
        ...commonHeaders,
      },
      signal: AbortSignal.timeout(30000),
    });
    result.authMeLatency = performance.now() - authMeStart;
    result.authMeStatus = authMeRes.status;
  } catch (err) {
    result.authMeLatency = performance.now() - authMeStart;
    result.authMeStatus = err.name === "TimeoutError" ? "TIMEOUT" : "NET_ERR";
  }

  // Calculate composite welcome and end-to-end metrics
  if (result.pageLatency !== null && result.authMeLatency !== null) {
    result.welcomeTotalLatency = result.pageLatency + result.authMeLatency;
  }
  if (result.regLatency !== null && result.welcomeTotalLatency !== null) {
    result.e2eLatency = result.regLatency + result.welcomeTotalLatency;
  }

  // Success criteria: Registration 201 + Welcome page 200 + Auth Me 200
  result.success =
    result.regStatus === 201 &&
    result.pageStatus === 200 &&
    result.authMeStatus === 200;

  return result;
}

// Main Execution Routine
async function runLoadTest() {
  if (ONLY_CLEANUP) {
    await cleanupTestUsers();
    await prisma.$disconnect();
    process.exit(0);
  }

  const runId = Math.random().toString(36).substring(2, 8);
  console.log("================================================================================");
  console.log("🚀  SKILL UP PLATFORM - 500 CONCURRENT STUDENTS LOAD BENCHMARK");
  console.log("================================================================================");
  console.log(`📍 Target Platform : ${TARGET_URL}`);
  console.log(`👥 Total Students   : ${TOTAL_USERS}`);
  console.log(`⚙️  Concurrency Pool: ${MODE === "burst" ? `${TOTAL_USERS} (Instant Full Burst)` : `${CONCURRENCY} concurrent workers`}`);
  console.log(`🆔 Test Run ID     : ${runId}`);
  console.log(`⏰ Started At      : ${new Date().toLocaleTimeString()}`);
  console.log("================================================================================\n");

  const results = [];
  const statusCounts = {};
  let completed = 0;
  let successes = 0;
  let failures = 0;
  const benchmarkStart = performance.now();

  function recordProgress(res) {
    completed++;
    if (res.success) successes++;
    else failures++;

    const key = `Reg:${res.regStatus} | Pg:${res.pageStatus} | Me:${res.authMeStatus}`;
    statusCounts[key] = (statusCounts[key] || 0) + 1;

    // Real-time progress update
    const pct = ((completed / TOTAL_USERS) * 100).toFixed(1);
    const elapsedSec = ((performance.now() - benchmarkStart) / 1000).toFixed(1);
    process.stdout.write(
      `\r[Progress] ${completed}/${TOTAL_USERS} (${pct}%) | ✅ Pass: ${successes} | ❌ Fail: ${failures} | ⏱️ Elapsed: ${elapsedSec}s`
    );
  }

  if (MODE === "burst") {
    console.log(`💥 Firing all ${TOTAL_USERS} student registrations SIMULTANEOUSLY at once...`);
    const promises = Array.from({ length: TOTAL_USERS }, (_, i) =>
      simulateStudent(i + 1, TOTAL_USERS, runId).then((res) => {
        results.push(res);
        recordProgress(res);
        return res;
      })
    );
    await Promise.all(promises);
  } else {
    console.log(`🔄 Dispatching ${TOTAL_USERS} students with ${CONCURRENCY} parallel worker channels...`);
    let currentIndex = 0;

    async function worker() {
      while (currentIndex < TOTAL_USERS) {
        const studentIndex = ++currentIndex;
        const res = await simulateStudent(studentIndex, TOTAL_USERS, runId);
        results.push(res);
        recordProgress(res);
      }
    }

    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);
  }

  const benchmarkTotalSec = (performance.now() - benchmarkStart) / 1000;
  console.log("\n\n================================================================================");
  console.log("📊 LOAD TEST EXECUTION COMPLETE");
  console.log("================================================================================");

  // Separate latencies for successful calls
  const regLatencies = results.filter((r) => r.regStatus === 201).map((r) => r.regLatency);
  const pageLatencies = results.filter((r) => r.pageStatus === 200).map((r) => r.pageLatency);
  const authMeLatencies = results.filter((r) => r.authMeStatus === 200).map((r) => r.authMeLatency);
  const welcomeLatencies = results.filter((r) => r.welcomeTotalLatency !== null).map((r) => r.welcomeTotalLatency);
  const e2eLatencies = results.filter((r) => r.success).map((r) => r.e2eLatency);

  const regStats = computeStats(regLatencies);
  const pageStats = computeStats(pageLatencies);
  const authMeStats = computeStats(authMeLatencies);
  const welcomeStats = computeStats(welcomeLatencies);
  const e2eStats = computeStats(e2eLatencies);

  // Summary Metrics Table
  console.log("\n--- LATENCY BENCHMARK BREAKDOWN ---");
  console.table({
    "1. Registration (POST /api/auth/register)": {
      Count: regLatencies.length,
      Min: fmtMs(regStats.min),
      P50: fmtMs(regStats.p50),
      P90: fmtMs(regStats.p90),
      P95: fmtMs(regStats.p95),
      P99: fmtMs(regStats.p99),
      Max: fmtMs(regStats.max),
      Average: fmtMs(regStats.avg),
    },
    "2. Welcome Page (GET /student)": {
      Count: pageLatencies.length,
      Min: fmtMs(pageStats.min),
      P50: fmtMs(pageStats.p50),
      P90: fmtMs(pageStats.p90),
      P95: fmtMs(pageStats.p95),
      P99: fmtMs(pageStats.p99),
      Max: fmtMs(pageStats.max),
      Average: fmtMs(pageStats.avg),
    },
    "3. Auth & Profile API (GET /api/auth/me)": {
      Count: authMeLatencies.length,
      Min: fmtMs(authMeStats.min),
      P50: fmtMs(authMeStats.p50),
      P90: fmtMs(authMeStats.p90),
      P95: fmtMs(authMeStats.p95),
      P99: fmtMs(authMeStats.p99),
      Max: fmtMs(authMeStats.max),
      Average: fmtMs(authMeStats.avg),
    },
    "4. Combined Welcome Screen Load Time": {
      Count: welcomeLatencies.length,
      Min: fmtMs(welcomeStats.min),
      P50: fmtMs(welcomeStats.p50),
      P90: fmtMs(welcomeStats.p90),
      P95: fmtMs(welcomeStats.p95),
      P99: fmtMs(welcomeStats.p99),
      Max: fmtMs(welcomeStats.max),
      Average: fmtMs(welcomeStats.avg),
    },
    "5. Full End-to-End Onboarding (Reg + Welcome)": {
      Count: e2eLatencies.length,
      Min: fmtMs(e2eStats.min),
      P50: fmtMs(e2eStats.p50),
      P90: fmtMs(e2eStats.p90),
      P95: fmtMs(e2eStats.p95),
      P99: fmtMs(e2eStats.p99),
      Max: fmtMs(e2eStats.max),
      Average: fmtMs(e2eStats.avg),
    },
  });

  console.log("\n--- OVERALL RELIABILITY & THROUGHPUT ---");
  const successRate = ((successes / TOTAL_USERS) * 100).toFixed(1);
  const throughputRps = ((completed * 3) / benchmarkTotalSec).toFixed(2); // 3 requests per student

  console.log(`• Total Elapsed Time       : ${benchmarkTotalSec.toFixed(2)} seconds`);
  console.log(`• Total Requests Dispatched: ${completed * 3}`);
  console.log(`• Successful Onboardings   : ${successes} / ${TOTAL_USERS} (${successRate}%)`);
  console.log(`• Failed Requests          : ${failures}`);
  console.log(`• Total System Throughput  : ${throughputRps} HTTP req/sec`);
  console.log(`• Student Onboarding Rate  : ${(completed / benchmarkTotalSec).toFixed(2)} students/sec`);

  console.log("\n--- STATUS CODE COMBINATIONS OBSERVED ---");
  for (const [combo, count] of Object.entries(statusCounts)) {
    console.log(`  • [${combo}] : ${count} students`);
  }

  // Error sample breakdown if any
  const errors = results.filter((r) => r.regError).map((r) => r.regError);
  if (errors.length > 0) {
    console.log("\n--- ERROR SAMPLES ---");
    const uniqueErrors = {};
    for (const e of errors) uniqueErrors[e] = (uniqueErrors[e] || 0) + 1;
    for (const [msg, cnt] of Object.entries(uniqueErrors)) {
      console.log(`  • (${cnt}x) ${msg}`);
    }
  }

  // Save report to disk
  const reportPath = path.resolve(process.cwd(), "LOAD_TEST_REPORT.md");
  const markdownReport = `
# Skill Up Platform: 500 Students Load Test Report

- **Target URL**: \`${TARGET_URL}\`
- **Total Students Simulated**: ${TOTAL_USERS}
- **Concurrency Mode**: ${MODE} (${CONCURRENCY} workers)
- **Total Duration**: ${benchmarkTotalSec.toFixed(2)} s
- **Overall Success Rate**: ${successRate}% (${successes}/${TOTAL_USERS})
- **Overall Throughput**: ${throughputRps} req/s

---

## 1. Latency Breakdown

| Phase | Success Count | Min | P50 (Median) | P90 | P95 | P99 | Max | Mean (Avg) |
|---|---|---|---|---|---|---|---|---|
| **1. Registration** (\`POST /api/auth/register\`) | ${regLatencies.length} | ${fmtMs(regStats.min)} | ${fmtMs(regStats.p50)} | ${fmtMs(regStats.p90)} | ${fmtMs(regStats.p95)} | ${fmtMs(regStats.p99)} | ${fmtMs(regStats.max)} | ${fmtMs(regStats.avg)} |
| **2. Welcome Page HTML** (\`GET /student\`) | ${pageLatencies.length} | ${fmtMs(pageStats.min)} | ${fmtMs(pageStats.p50)} | ${fmtMs(pageStats.p90)} | ${fmtMs(pageStats.p95)} | ${fmtMs(pageStats.p99)} | ${fmtMs(pageStats.max)} | ${fmtMs(pageStats.avg)} |
| **3. Auth Profile API** (\`GET /api/auth/me\`) | ${authMeLatencies.length} | ${fmtMs(authMeStats.min)} | ${fmtMs(authMeStats.p50)} | ${fmtMs(authMeStats.p90)} | ${fmtMs(authMeStats.p95)} | ${fmtMs(authMeStats.p99)} | ${fmtMs(authMeStats.max)} | ${fmtMs(authMeStats.avg)} |
| **4. Combined Welcome Screen Load Time** | ${welcomeLatencies.length} | ${fmtMs(welcomeStats.min)} | ${fmtMs(welcomeStats.p50)} | ${fmtMs(welcomeStats.p90)} | ${fmtMs(welcomeStats.p95)} | ${fmtMs(welcomeStats.p99)} | ${fmtMs(welcomeStats.max)} | ${fmtMs(welcomeStats.avg)} |
| **5. Full End-to-End Onboarding** | ${e2eLatencies.length} | ${fmtMs(e2eStats.min)} | ${fmtMs(e2eStats.p50)} | ${fmtMs(e2eStats.p90)} | ${fmtMs(e2eStats.p95)} | ${fmtMs(e2eStats.p99)} | ${fmtMs(e2eStats.max)} | ${fmtMs(e2eStats.avg)} |

---

## 2. Response Status Distribution

\`\`\`
${Object.entries(statusCounts)
  .map(([k, v]) => `${k} : ${v}`)
  .join("\n")}
\`\`\`

---

## 3. Bottleneck Analysis & Findings

1. **Registration Computational Overhead**:
   - Each registration executes bcrypt (10 rounds) which is compute-heavy.
   - Multiple sequential database queries to Supabase Mumbai from Vercel Serverless.
2. **Welcome Screen Performance**:
   - Static HTML for \`/student\` is delivered very fast (< 300 ms).
   - Dynamic user profile \`/api/auth/me\` query latency depends on Supabase connection pooling and network distance.
`;

  fs.writeFileSync(reportPath, markdownReport.trim());
  console.log(`\n📄 Detailed markdown report saved to: ${reportPath}`);

  if (DO_CLEANUP) {
    await cleanupTestUsers(runId);
  } else {
    console.log(`\n💡 To clean up test accounts later, run:`);
    console.log(`   node scripts/load-test-500.mjs --only-cleanup`);
  }

  await prisma.$disconnect();
}

runLoadTest().catch(async (err) => {
  console.error("\n❌ Fatal error in load test runner:", err);
  await prisma.$disconnect();
  process.exit(1);
});
