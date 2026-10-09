"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Terminal,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  HelpCircle,
  FileCode2,
  Play,
  RotateCcw,
  Bug,
  BookOpen,
  Trophy,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ScheduleDay {
  day: string;
  dayNumber: number;
  date: string;
  isOptional?: boolean;
  mainTopic: string;
  practicalFocus: string;
  summary: string;
  coreConcepts: string[];
  practicalExercises: string[];
  keyDeliverable: string;
  sampleCode: string;
  consoleOutput: string;
}

const SCHEDULE_DAYS: ScheduleDay[] = [
  {
    day: "Day 1",
    dayNumber: 1,
    date: "12 Oct",
    mainTopic: "C++ Fundamentals",
    practicalFocus: "Syntax, variables, data types, I/O and operators",
    summary:
      "Understand the execution model of C++, compiler toolchains, standard streams, variable memory allocation, and arithmetic/logical operations.",
    coreConcepts: [
      "Program structure: #include, main(), namespaces, return codes",
      "Standard input/output: std::cin, std::cout, std::endl, stream buffers",
      "Primitive data types: int, float, double, char, bool, string",
      "Type casting & memory sizes (sizeof operator)",
      "Arithmetic, relational, logical, and assignment operators",
    ],
    practicalExercises: [
      "Hello World and formatted student bio output",
      "User input arithmetic calculator (sum, diff, product, quotient, mod)",
      "Temperature converter (Celsius to Fahrenheit)",
      "Simple Interest and compound formula calculator",
    ],
    keyDeliverable: "First compiled C++ binary & interactive arithmetic calculator",
    sampleCode: `#include <iostream>
#include <iomanip>

int main() {
    std::string studentName;
    int rollNumber;
    double mathScore, csScore;

    std::cout << "[SKILL UP LAB 01] Enter Name: ";
    std::getline(std::cin, studentName);
    std::cout << "Enter Roll Number: ";
    std::cin >> rollNumber;

    std::cout << "Enter Math & CS Scores: ";
    std::cin >> mathScore >> csScore;

    double average = (mathScore + csScore) / 2.0;

    std::cout << "\\n--- STUDENT RECORD GENERATED ---\\n";
    std::cout << "Candidate : " << studentName << "\\n";
    std::cout << "Roll No   : " << rollNumber << "\\n";
    std::cout << "Average   : " << std::fixed << std::setprecision(2) << average << " %\\n";

    return 0;
}`,
    consoleOutput: `[SKILL UP LAB 01] Enter Name: Jasuj
Enter Roll Number: 42
Enter Math & CS Scores: 94.5 98.0

--- STUDENT RECORD GENERATED ---
Candidate : Jasuj
Roll No   : 42
Average   : 96.25 %

[EXIT CODE 0 - OK (0.02s)]`,
  },
  {
    day: "Day 2",
    dayNumber: 2,
    date: "13 Oct",
    mainTopic: "Conditional Statements",
    practicalFocus: "if/else, switch and decision-making problems",
    summary:
      "Master control flow, boolean algebra, cascading decisions, multi-way branch selection via switch statements, and edge case validation.",
    coreConcepts: [
      "Boolean logic evaluation, truth tables & short-circuit evaluation",
      "if, if-else, and cascading else-if ladders",
      "Nested conditional structures and boundary condition checking",
      "switch-case constructs, jump tables & fallthrough prevention",
      "Ternary operator for concise conditional assignment",
    ],
    practicalExercises: [
      "Student grading system with tiered performance honors",
      "Leap year validator with quadruple-century boundary rules",
      "Menu-driven arithmetic operation selector with switch-case",
      "Vowel or consonant detector & character classification",
    ],
    keyDeliverable: "Menu-driven decision evaluator & robust grade calculator",
    sampleCode: `#include <iostream>

int main() {
    int score;
    std::cout << "[SKILL UP LAB 02] Enter Exam Score (0-100): ";
    std::cin >> score;

    if (score < 0 || score > 100) {
        std::cerr << "ERROR: Invalid score input!\\n";
        return 1;
    }

    char grade;
    if (score >= 90)      grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else                  grade = 'F';

    std::cout << "Calculated Grade: [" << grade << "]\\n";

    switch(grade) {
        case 'A': std::cout << "Honor: SUPER 60 CANDIDATE TIER 1\\n"; break;
        case 'B': std::cout << "Honor: STRONG QUALIFICATION\\n"; break;
        default : std::cout << "Honor: NEEDS REMEDIAL SPRINT\\n"; break;
    }
    return 0;
}`,
    consoleOutput: `[SKILL UP LAB 02] Enter Exam Score (0-100): 93
Calculated Grade: [A]
Honor: SUPER 60 CANDIDATE TIER 1

[EXIT CODE 0 - OK (0.01s)]`,
  },
  {
    day: "Day 3",
    dayNumber: 3,
    date: "14 Oct",
    mainTopic: "Loops",
    practicalFocus: "for, while, do-while, break, continue and logic problems",
    summary:
      "Understand repetitive execution, iteration invariants, counter versus condition controlled loops, loop termination, and series convergence.",
    coreConcepts: [
      "for loops: initialization, condition, step update semantics",
      "while loops: pre-test iterative condition evaluation",
      "do-while loops: guaranteed post-test execution patterns",
      "jump statements: break (early termination) & continue (skip cycle)",
      "Infinite loop prevention and loop variant verification",
    ],
    practicalExercises: [
      "Prime number verification with square root optimization",
      "Fibonacci sequence generation up to N terms",
      "Factorial computation & digit sum accumulator",
      "Reverse an integer and check for palindrome symmetry",
    ],
    keyDeliverable: "Algorithmic logic suite (Prime, Fibonacci, Palindrome)",
    sampleCode: `#include <iostream>

int main() {
    int n;
    std::cout << "[SKILL UP LAB 03] Enter positive integer N: ";
    std::cin >> n;

    std::cout << "Fibonacci Series (" << n << " terms): ";
    long long a = 0, b = 1;
    for (int i = 0; i < n; ++i) {
        std::cout << a << (i + 1 == n ? "" : ", ");
        long long next = a + b;
        a = b;
        b = next;
    }
    std::cout << "\\n\\nPrime check up to N:\\n";
    bool isPrime = (n > 1);
    for (int i = 2; i * i <= n; ++i) {
        if (n % i == 0) { isPrime = false; break; }
    }
    std::cout << n << (isPrime ? " is a PRIME number" : " is NOT prime") << "\\n";

    return 0;
}`,
    consoleOutput: `[SKILL UP LAB 03] Enter positive integer N: 10
Fibonacci Series (10 terms): 0, 1, 1, 2, 3, 5, 8, 13, 21, 34

Prime check up to N:
10 is NOT prime

[EXIT CODE 0 - OK (0.01s)]`,
  },
  {
    day: "Day 4",
    dayNumber: 4,
    date: "15 Oct",
    mainTopic: "Patterns & Basic CLI",
    practicalFocus: "Nested loops, pattern printing and menu-driven programs",
    summary:
      "Harness nested 2D loop iterations for geometric coordinate printing, matrix manipulation, and building interactive, resilient menu loops in the console.",
    coreConcepts: [
      "Nested for loops: outer row iteration and inner column iteration",
      "Space-and-star coordinate calculations for symmetrical patterns",
      "Pyramids, inverted triangles, hollow diamonds & Pascal triangles",
      "Building continuous CLI loops (do-while / while(true) with exit option)",
      "Console screen management and clean user prompt interfaces",
    ],
    practicalExercises: [
      "Right-angled & inverted star triangles",
      "Centered equilateral pyramid & hollow diamond printing",
      "Floyd's triangle & continuous numbered coordinate matrices",
      "Interactive multi-pattern selector menu with ANSI headers",
    ],
    keyDeliverable: "Interactive Console Pattern Studio & CLI Menu Shell",
    sampleCode: `#include <iostream>

void printPyramid(int rows) {
    for (int i = 1; i <= rows; ++i) {
        for (int space = 1; space <= rows - i; ++space) std::cout << " ";
        for (int star = 1; star <= (2 * i - 1); ++star) std::cout << "*";
        std::cout << "\\n";
    }
}

int main() {
    int choice = 0;
    do {
        std::cout << "\\n===============================\\n";
        std::cout << "     PATTERN CLI STUDIO        \\n";
        std::cout << "===============================\\n";
        std::cout << "1. Print Centered Pyramid\\n";
        std::cout << "2. Exit CLI Studio\\n";
        std::cout << "Choice: ";
        std::cin >> choice;

        if (choice == 1) {
            int r;
            std::cout << "Enter row height: ";
            std::cin >> r;
            printPyramid(r);
        }
    } while (choice != 2);

    std::cout << "Session terminated.\\n";
    return 0;
}`,
    consoleOutput: `===============================
     PATTERN CLI STUDIO        
===============================
1. Print Centered Pyramid
2. Exit CLI Studio
Choice: 1
Enter row height: 5
    *
   ***
  *****
 *******
*********

===============================
     PATTERN CLI STUDIO        
===============================
Choice: 2
Session terminated.`,
  },
  {
    day: "Day 5",
    dayNumber: 5,
    date: "16 Oct",
    mainTopic: "Advanced CLI & Project",
    practicalFocus: "Calculator, ATM, quiz, converter or pattern generator",
    summary:
      "The flagship capstone milestone: synthesize all syntax, conditionals, loops, and modular functions into an enterprise-style standalone console application.",
    coreConcepts: [
      "Application architecture: separation of state, display, and operations",
      "Input validation, buffer clearing (std::cin.ignore), and error handling",
      "Persistent state simulation: account balances, user sessions, score counters",
      "Multi-level menu navigation and transaction logging",
      "Modular functional decomposition and procedural clarity",
    ],
    practicalExercises: [
      "Capstone 1: ATM Banking System (PIN, balance, deposit, withdraw)",
      "Capstone 2: Scientific Multi-Operation CLI Calculator",
      "Capstone 3: Timed Interactive Trivia & Quiz Engine",
      "Capstone 4: Multi-Unit Metric & Currency Converter",
      "Capstone 5: Dynamic ASCII & Numerical Pattern Generator",
    ],
    keyDeliverable: "Full-fledged standalone C++ CLI Capstone Application",
    sampleCode: `#include <iostream>

class ATMSystem {
private:
    int pin = 1234;
    double balance = 50000.0;
public:
    bool verifyPin(int inputPin) { return inputPin == pin; }
    void checkBalance() { std::cout << "Current Balance: ₹" << balance << "\\n"; }
    void deposit(double amt) { balance += amt; std::cout << "Deposited ₹" << amt << "\\n"; }
    bool withdraw(double amt) {
        if (amt > balance) { std::cout << "ERROR: Insufficient funds!\\n"; return false; }
        balance -= amt;
        std::cout << "Dispensed ₹" << amt << ". New Balance: ₹" << balance << "\\n";
        return true;
    }
};

int main() {
    ATMSystem atm;
    int enteredPin;
    std::cout << "[SKILL UP ATM CLI] Enter PIN: ";
    std::cin >> enteredPin;

    if (!atm.verifyPin(enteredPin)) {
        std::cerr << "ACCESS DENIED: Invalid PIN.\\n";
        return 1;
    }

    std::cout << "AUTHENTICATED SUCCESSFULLY.\\n";
    atm.checkBalance();
    atm.deposit(15000.0);
    atm.withdraw(20000.0);
    return 0;
}`,
    consoleOutput: `[SKILL UP ATM CLI] Enter PIN: 1234
AUTHENTICATED SUCCESSFULLY.
Current Balance: ₹50000
Deposited ₹15000
Dispensed ₹20000. New Balance: ₹45000

[EXIT CODE 0 - OK (0.02s)]`,
  },
  {
    day: "Day 6",
    dayNumber: 6,
    date: "Optional",
    isOptional: true,
    mainTopic: "Doubt Solving & Real-World Practice",
    practicalFocus: "Revision, debugging, project practice and project guidance",
    summary:
      "A dedicated intensive sprint for thorough revision, live debugging of compiler warnings & logic bugs, 1-on-1 mentor guidance, and Super 60 induction readiness.",
    coreConcepts: [
      "Comprehensive revision of Days 1 through 5 fundamentals",
      "Compiler diagnostics: deciphering GCC/Clang errors, warnings (-Wall -Wextra)",
      "Runtime debugging: segmentation faults, off-by-one errors, buffer overruns",
      "Code refactoring & clean architecture: DRY principle and naming conventions",
      "Individual project review with lead mentors (Ayush, Ranjeet, Ramanand, Shontu, Kamal)",
    ],
    practicalExercises: [
      "Bug-hunting tournament: fix 5 deliberately broken C++ programs",
      "Refactoring project code for modularity and memory safety",
      "1-on-1 code review and guidance with lab mentor",
      "Mock technical assessment for Super 60 Incubator qualification",
    ],
    keyDeliverable: "Audited production code, bug fixes & verified certification",
    sampleCode: `// DAY 6 DEBUG CLINIC: RESOLVING COMPILER & LOGIC WARNINGS
#include <iostream>
#include <cassert>

// Clean, refactored, robust modular function
int safeFactorial(int n) {
    if (n < 0) return -1; // Error code for negative input
    int result = 1;
    for (int i = 2; i <= n; ++i) {
        result *= i;
    }
    return result;
}

int main() {
    std::cout << "[SKILL UP DAY 6 CLINIC] Running Assert Testbench...\\n";
    assert(safeFactorial(0) == 1);
    assert(safeFactorial(5) == 120);
    assert(safeFactorial(-3) == -1);
    std::cout << "All 3 Assertion Testbenches PASSED without fault!\\n";
    std::cout << "Project audited by Lab Mentors. READY FOR INDUCTION.\\n";
    return 0;
}`,
    consoleOutput: `[SKILL UP DAY 6 CLINIC] Running Assert Testbench...
All 3 Assertion Testbenches PASSED without fault!
Project audited by Lab Mentors. READY FOR INDUCTION.

[AUDIT COMPLETE: 0 MEMORY LEAKS, 0 COMPILER WARNINGS]`,
  },
];

const PEDAGOGY_PILLARS = [
  {
    step: "01",
    title: "Core Foundations",
    subtitle: "SYNTAX & MEMORY MODEL",
    desc: "Understand program execution, variables, memory allocation, standard I/O streams, and operators from bare metal.",
    badge: "STAGE 1",
  },
  {
    step: "02",
    title: "Revision & Practice",
    subtitle: "DECISION & LOOP DRILLS",
    desc: "Daily problem-solving sprints, control flow branching, loop invariants, series mathematics, and logic challenges.",
    badge: "STAGE 2",
  },
  {
    step: "03",
    title: "Real-World Project Practice",
    subtitle: "FLAGSHIP CLI CAPSTONES",
    desc: "Engineer complete interactive console applications: ATM machines, scientific calculators, quiz engines, and converters.",
    badge: "STAGE 3",
  },
  {
    step: "04",
    title: "Project Review & Guidance",
    subtitle: "1-ON-1 MENTOR AUDITS",
    desc: "Line-by-line mentor code reviews across 5 labs, compiler debugging clinic, and personalized guidance for Super 60 induction.",
    badge: "STAGE 4",
  },
];

const CAPSTONE_PROJECTS = [
  {
    id: "atm",
    name: "ATM Banking Simulator",
    tag: "FINANCIAL CLI",
    desc: "PIN verification, real-time balance inquiries, cash deposit and withdrawal limits, mini-statements, and session logout.",
    features: ["4-digit PIN authentication", "Account balance tracker", "Transaction ledger", "Exit menu loop"],
    icon: ShieldCheck,
  },
  {
    id: "calc",
    name: "Scientific CLI Calculator",
    tag: "MATH ENGINE",
    desc: "Arithmetic operations (+, -, *, /, %), power functions, square roots, memory storage (M+, MR), and continuous calculation loops.",
    features: ["Precedence handling", "Division by zero safeguard", "Accumulator memory", "History buffer"],
    icon: Cpu,
  },
  {
    id: "quiz",
    name: "Interactive Quiz Engine",
    tag: "TRIVIA SYSTEM",
    desc: "Timed multiple-choice questions, live scoring algorithms, answer review screens, percentage accuracy, and high score ranks.",
    features: ["Randomized question sets", "Instant answer validation", "Percentage grader", "Leaderboard rank"],
    icon: Trophy,
  },
  {
    id: "converter",
    name: "Multi-Unit & Currency Converter",
    tag: "CONVERSION SUITE",
    desc: "Converts temperature (C/F/K), metric lengths (m/km/miles), weight (kg/lbs), and currency rates with bidirectional calculations.",
    features: ["Multi-category selection", "High-precision double math", "Reverse conversions", "Clean formatted tables"],
    icon: Zap,
  },
  {
    id: "patterns",
    name: "Dynamic Pattern & ASCII Generator",
    tag: "GRAPHICS CLI",
    desc: "User-defined dimensions for geometric star patterns: hollow diamonds, Pascal triangles, Floyd numbers, and pyramid matrices.",
    features: ["2D coordinate nested loops", "Dynamic height inputs", "Symmetric space calculations", "ASCII art studio"],
    icon: Code2,
  },
];

export default function CurriculumPage() {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"code" | "console">("code");
  const selectedDay = SCHEDULE_DAYS[selectedDayIdx];

  return (
    <div className="relative min-h-screen bg-[#F9F9F9] text-[#111111] overflow-x-hidden">
      {/* Top Continuous Technical Ticker Marquee */}
      <div className="bg-[#111111] text-white py-2 px-4 border-b-[2px] border-[#111111] overflow-hidden whitespace-nowrap text-[11px] font-mono font-bold tracking-widest uppercase flex items-center select-none">
        <div className="inline-flex animate-marquee-smooth items-center gap-8">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F07C27]" />
            [ WORKSHOP OVERVIEW // 6-DAY INTENSIVE C++ ROADMAP ]
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400" />
            12 OCT – 16 OCT (+ OPTIONAL DAY 6 DOUBT SOLVING)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F07C27]" />
            CLI CAPSTONES: ATM • CALCULATOR • QUIZ • CONVERTER • PATTERNS
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400" />
            5 LEAD MENTORS // 4 OFFLINE LABS + 1 ONLINE TRACK
          </span>
        </div>
      </div>

      {/* Technical Header */}
      <header className="sticky top-0 z-40 bg-white border-b-[3px] border-[#111111] shadow-[0px_4px_0px_#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#111111] text-white font-display font-black text-xl px-3 py-1.5 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-wider">
              SUPER 60
            </div>
            <div className="bg-[#F07C27] text-white font-mono text-xs font-black px-2 py-1.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
              SKILL UP
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-display font-bold text-xs uppercase tracking-wider">
            <Link href="/" className="text-slate-600 hover:text-[#111111] hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/curriculum" className="text-[#F07C27] underline underline-offset-8 decoration-[3px]">
              Curriculum
            </Link>
            <Link href="/workshops" className="text-slate-600 hover:text-[#111111] hover:underline underline-offset-4">
              Workshops
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-[#111111] hover:underline underline-offset-4">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="neo-btn-sm bg-white text-[#111111] px-4 py-2 text-xs font-bold uppercase"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="neo-btn-sm bg-[#F07C27] text-white px-5 py-2 text-xs font-bold uppercase flex items-center gap-1.5"
            >
              <span>Join 2026</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-10">
        <div className="flex flex-col items-start gap-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#111111] text-white font-mono text-xs font-bold px-3 py-1.5 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest">
            <Terminal className="w-3.5 h-3.5 text-[#F07C27]" />
            [ WORKSHOP OVERVIEW // OFFICIAL EXECUTION SCHEDULE ]
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#111111] tracking-tight uppercase leading-[1.05]">
            WORKSHOP <span className="bg-[#FFF0E5] px-2 py-0.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111]">OVERVIEW</span> &{" "}
            <span className="bg-[#F07C27] text-white px-3 py-0.5 border-[3px] border-[#111111] shadow-[5px_5px_0px_#111111] inline-block -rotate-1">
              CURRICULUM
            </span>
          </h1>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-3xl font-medium mt-1">
            The official 6-day practical roadmap for Skill Up — from first variables and standard I/O streams to
            complex control flow, pattern generation, and real-world CLI capstone applications (ATM, Calculator, Quiz, Converters)
            with personalized doubt solving and mentor reviews.
          </p>

          {/* Quick Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full mt-4">
            {[
              { label: "WORKSHOP TIMELINE", val: "12 OCT – 16 OCT" },
              { label: "SCHEDULE DURATION", val: "6 DAYS (DAY 6 OPT.)" },
              { label: "CAPSTONE PROJECTS", val: "5 CLI SYSTEMS" },
              { label: "MENTOR LABS", val: "4 OFFLINE + 1 ONLINE" },
            ].map((t) => (
              <div
                key={t.label}
                className="bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] p-3 text-left"
              >
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">{t.label}</div>
                <div className="font-display font-black text-sm sm:text-base text-[#111111] mt-0.5">{t.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 CORE PEDAGOGICAL PILLARS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-14">
        <div className="border-b-[3px] border-[#111111] pb-3 mb-6 flex items-center justify-between">
          <div className="font-mono font-bold text-xs uppercase tracking-widest text-[#111111] flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#F07C27] border-[1px] border-[#111111]" />
            [ CORE PEDAGOGY // 4 KEY WORKSHOP PILLARS ]
          </div>
          <span className="font-mono text-[11px] font-bold text-slate-500 uppercase hidden sm:block">
            STRUCTURED REVISION & PRACTICE ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PEDAGOGY_PILLARS.map((pillar) => (
            <div
              key={pillar.step}
              className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_#111111] p-5 flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_#111111] transition-all"
            >
              <div>
                <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2.5 mb-3">
                  <span className="bg-[#111111] text-[#F07C27] font-mono font-black text-xs px-2 py-0.5 border border-[#111111]">
                    {pillar.step}
                  </span>
                  <span className="font-mono text-[10px] font-bold bg-[#FFF0E5] text-[#C2410C] px-2 py-0.5 border border-[#111111]">
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="font-display font-black text-base text-[#111111] uppercase tracking-tight mb-1">
                  {pillar.title}
                </h3>
                <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {pillar.subtitle}
                </div>
                <p className="text-xs font-mono text-slate-700 leading-relaxed font-semibold">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OFFICIAL WORKSHOP OVERVIEW TABLE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="border-b-[3px] border-[#111111] pb-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="font-mono font-bold text-xs uppercase tracking-widest text-[#111111] flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#F07C27] border-[1px] border-[#111111]" />
              [ WORKSHOP OVERVIEW MATRIX // SCHEDULE SPECIFICATION ]
            </div>
            <h2 className="font-display font-black text-2xl text-[#111111] uppercase tracking-tight mt-1">
              DAY-BY-DAY EXECUTION MATRIX
            </h2>
          </div>
          <span className="font-mono text-xs font-bold bg-white border-[2px] border-[#111111] px-3 py-1 shadow-[2px_2px_0px_#111111] self-start sm:self-auto">
            SCHEDULE: 12 OCT – 16 OCT + OPTIONAL
          </span>
        </div>

        {/* Neo-Brutalist Table Container */}
        <div className="overflow-x-auto border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111111] text-white font-mono text-xs font-bold uppercase tracking-wider border-b-[3px] border-[#111111]">
                <th className="p-4 border-r-[2px] border-white/20 w-24">Day</th>
                <th className="p-4 border-r-[2px] border-white/20 w-28">Date</th>
                <th className="p-4 border-r-[2px] border-white/20 w-64">Main Topic</th>
                <th className="p-4 border-r-[2px] border-white/20">Practical Focus</th>
                <th className="p-4 w-52 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-[#111111] font-mono text-xs">
              {SCHEDULE_DAYS.map((row, idx) => {
                const isSelected = selectedDayIdx === idx;
                return (
                  <tr
                    key={row.day}
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#FFF0E5] font-bold"
                        : "hover:bg-slate-50 bg-white"
                    }`}
                  >
                    <td className="p-4 border-r-[2px] border-[#111111] font-display font-black text-sm">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#111111] text-white px-2 py-0.5 text-xs">
                          {row.day}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 border-r-[2px] border-[#111111]">
                      <span
                        className={`px-2 py-1 border-[1.5px] border-[#111111] font-black ${
                          row.isOptional
                            ? "bg-amber-200 text-amber-900"
                            : "bg-white text-[#C2410C]"
                        }`}
                      >
                        {row.date}
                      </span>
                    </td>
                    <td className="p-4 border-r-[2px] border-[#111111] font-display font-black text-sm uppercase text-[#111111]">
                      {row.mainTopic}
                    </td>
                    <td className="p-4 border-r-[2px] border-[#111111] text-slate-800 font-semibold leading-relaxed">
                      {row.practicalFocus}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayIdx(idx);
                        }}
                        className={`px-3 py-1 text-[11px] font-black uppercase border-[2px] border-[#111111] transition-all ${
                          isSelected
                            ? "bg-[#F07C27] text-white shadow-[2px_2px_0px_#111111]"
                            : "bg-white text-[#111111] hover:bg-[#F07C27] hover:text-white"
                        }`}
                      >
                        {isSelected ? "VIEWING" : "INSPECT"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── INTERACTIVE DAY DEEP DIVE (EXPANDED INSPECTION VIEW) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="bg-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111]">
          {/* Day Selector Ribbon */}
          <div className="bg-slate-100 border-b-[3px] border-[#111111] p-2 sm:p-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-black uppercase px-2 text-slate-600 mr-2 hidden sm:inline-block">
              SELECT SPRINT:
            </span>
            {SCHEDULE_DAYS.map((d, i) => (
              <button
                key={d.day}
                onClick={() => setSelectedDayIdx(i)}
                className={`px-3 py-1.5 font-mono text-xs font-black uppercase border-[2px] border-[#111111] transition-all cursor-pointer ${
                  selectedDayIdx === i
                    ? "bg-[#F07C27] text-white shadow-[3px_3px_0px_#111111] -translate-y-0.5"
                    : "bg-white text-[#111111] hover:bg-[#FFF0E5]"
                }`}
              >
                {d.day} ({d.date})
              </button>
            ))}
          </div>

          {/* Detailed Inspector Header */}
          <div className="p-6 sm:p-8 border-b-[3px] border-[#111111] bg-[#FFF0E5] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#111111] text-white font-mono text-xs font-black px-2.5 py-1 border border-[#111111]">
                  {selectedDay.day.toUpperCase()} SPECIFICATION
                </span>
                <span
                  className={`font-mono text-xs font-black px-2.5 py-1 border-[2px] border-[#111111] ${
                    selectedDay.isOptional
                      ? "bg-amber-200 text-amber-950"
                      : "bg-[#F07C27] text-white"
                  }`}
                >
                  DATE: {selectedDay.date.toUpperCase()}
                </span>
                {selectedDay.isOptional && (
                  <span className="font-mono text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 border border-[#111111]">
                    ATTENDANCE OPTIONAL
                  </span>
                )}
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-[#111111] uppercase tracking-tight">
                {selectedDay.mainTopic}
              </h3>
              <p className="font-mono text-xs sm:text-sm font-bold text-slate-700 mt-1 max-w-2xl">
                {selectedDay.practicalFocus}
              </p>
            </div>

            <div className="bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] p-3 max-w-xs self-start md:self-auto">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                KEY DELIVERABLE
              </div>
              <div className="font-display font-black text-xs sm:text-sm text-[#111111] mt-0.5">
                {selectedDay.keyDeliverable}
              </div>
            </div>
          </div>

          {/* Inspector Content Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Core Concepts & Practical Exercises */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h4 className="font-display font-black text-sm uppercase text-[#111111] tracking-wider flex items-center gap-2 border-b-[2px] border-[#111111] pb-2 mb-3">
                  <BookOpen className="w-4 h-4 text-[#F07C27]" />
                  <span>CORE THEORETICAL CONCEPTS</span>
                </h4>
                <ul className="space-y-2">
                  {selectedDay.coreConcepts.map((concept) => (
                    <li
                      key={concept}
                      className="text-xs font-mono font-semibold text-slate-800 flex items-start gap-2 bg-slate-50 p-2 border border-[#111111]/30"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5 stroke-[3]" />
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-display font-black text-sm uppercase text-[#111111] tracking-wider flex items-center gap-2 border-b-[2px] border-[#111111] pb-2 mb-3">
                  <Cpu className="w-4 h-4 text-[#F07C27]" />
                  <span>HANDS-ON LAB EXERCISES</span>
                </h4>
                <ul className="space-y-2">
                  {selectedDay.practicalExercises.map((exercise) => (
                    <li
                      key={exercise}
                      className="text-xs font-mono font-semibold text-slate-800 flex items-start gap-2 bg-[#FFFDF9] p-2 border border-[#111111]"
                    >
                      <span className="w-2 h-2 bg-[#F07C27] flex-shrink-0 mt-1" />
                      <span>{exercise}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Code & Terminal Preview */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                {/* Tabs for Code vs Console Output */}
                <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("code")}
                      className={`px-3 py-1 font-mono text-xs font-black uppercase border-[2px] border-[#111111] transition-all cursor-pointer ${
                        activeTab === "code"
                          ? "bg-[#111111] text-white"
                          : "bg-white text-[#111111] hover:bg-slate-100"
                      }`}
                    >
                      <FileCode2 className="w-3.5 h-3.5 inline mr-1" />
                      C++ SOURCE
                    </button>
                    <button
                      onClick={() => setActiveTab("console")}
                      className={`px-3 py-1 font-mono text-xs font-black uppercase border-[2px] border-[#111111] transition-all cursor-pointer ${
                        activeTab === "console"
                          ? "bg-[#F07C27] text-white"
                          : "bg-white text-[#111111] hover:bg-slate-100"
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5 inline mr-1" />
                      TERMINAL OUTPUT
                    </button>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase hidden sm:inline">
                    COMPILER: G++ -STD=C++20
                  </span>
                </div>

                {/* Code or Terminal Display */}
                {activeTab === "code" ? (
                  <div className="bg-[#111111] text-slate-200 border-[2px] border-[#111111] p-4 font-mono text-xs overflow-x-auto shadow-inner rounded-none max-h-[380px] leading-relaxed">
                    <pre>
                      <code>{selectedDay.sampleCode}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="bg-[#0A0A0A] text-emerald-400 border-[2px] border-[#111111] p-4 font-mono text-xs overflow-x-auto shadow-inner rounded-none max-h-[380px] leading-relaxed">
                    <div className="text-slate-500 mb-2 border-b border-white/10 pb-1 text-[10px]">
                      // STDOUT STREAM SIMULATION
                    </div>
                    <pre>
                      <code>{selectedDay.consoleOutput}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Day Summary Footer */}
              <div className="mt-4 p-3 bg-slate-50 border-[2px] border-[#111111] flex items-center justify-between font-mono text-xs">
                <span className="text-slate-700 font-semibold truncate max-w-md">
                  {selectedDay.summary}
                </span>
                <span className="font-black text-[#F07C27] flex items-center gap-1 uppercase ml-2 flex-shrink-0">
                  VERIFIED LAB <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DAY 5 CAPSTONE PROJECTS SHOWCASE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="bg-[#111111] text-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#F07C27] p-6 sm:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-[3px] border-white/20 pb-6 mb-8">
            <div>
              <div className="bg-[#F07C27] text-white font-mono text-xs font-black px-2.5 py-1 uppercase tracking-wider inline-block mb-2">
                ★ DAY 5 FLAGSHIP MILESTONE
              </div>
              <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight">
                REAL-WORLD CLI CAPSTONE PROJECTS
              </h2>
            </div>
            <p className="font-mono text-xs text-slate-300 max-w-md lg:text-right font-medium">
              On Day 5, each student engineers and demonstrates one complete interactive console application
              incorporating conditionals, loops, functions, and state management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPSTONE_PROJECTS.map((proj) => {
              const Icon = proj.icon;
              return (
                <div
                  key={proj.id}
                  className="bg-white/5 border-[2px] border-white/20 hover:border-[#F07C27] p-5 flex flex-col justify-between hover:bg-white/10 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
                      <span className="text-[10px] font-mono font-bold text-[#F07C27] bg-[#F07C27]/10 px-2 py-0.5 border border-[#F07C27]/30">
                        {proj.tag}
                      </span>
                      <Icon className="w-4 h-4 text-[#F07C27]" />
                    </div>
                    <h4 className="font-display font-black text-lg text-white uppercase tracking-tight mb-2 group-hover:text-[#F07C27] transition-colors">
                      {proj.name}
                    </h4>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed font-medium mb-4">
                      {proj.desc}
                    </p>

                    <div className="border-t border-white/10 pt-3">
                      <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                        Core Architecture Features:
                      </div>
                      <ul className="space-y-1">
                        {proj.features.map((f) => (
                          <li
                            key={f}
                            className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 bg-[#F07C27] flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>SELECTION WEIGHT: 25%</span>
                    <span className="font-bold text-[#F07C27] flex items-center gap-1">
                      CAPSTONE <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DAY 6 DOUBT SOLVING & REAL-WORLD PRACTICE CLINIC ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
        <div className="bg-[#FFF0E5] border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[3px] border-[#111111] pb-6 mb-8">
            <div>
              <div className="bg-[#111111] text-[#F07C27] font-mono text-xs font-black px-2.5 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] inline-block uppercase tracking-wider mb-2">
                [ DAY 6 // OPTIONAL CLINIC ]
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#111111] uppercase tracking-tight">
                DOUBT SOLVING & REAL-WORLD PRACTICE
              </h2>
            </div>
            <div className="font-mono text-xs font-bold text-slate-800 bg-white px-3 py-1.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] self-start sm:self-auto">
              5 LEAD MENTORS ONSITE
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "1. Comprehensive Revision",
                desc: "Revisit all foundational C++ syntax, edge cases in conditionals, and complex nested loop algorithms.",
                tag: "SYNTAX RECAP",
              },
              {
                title: "2. Live Debugging Clinic",
                desc: "Bring your compiler errors, warnings, segmentation faults, and logical bugs for live mentor-assisted resolution.",
                tag: "BUG SPRINT",
              },
              {
                title: "3. Real-World Practice",
                desc: "Polish and enhance your Day 5 capstone project with modular functions, validation checks, and clean CLI UX.",
                tag: "PROJECT POLISH",
              },
              {
                title: "4. Project Guidance & Audit",
                desc: "Direct 1-on-1 code audit by lead mentors (Ayush, Ranjeet, Ramanand, Shontu, Kamal) for Super 60 induction.",
                tag: "MENTOR AUDIT",
              },
            ].map((clinic) => (
              <div
                key={clinic.title}
                className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] p-5 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-[10px] font-black text-[#C2410C] bg-[#FFF0E5] px-2 py-0.5 border border-[#111111] inline-block mb-3">
                    {clinic.tag}
                  </span>
                  <h4 className="font-display font-black text-base text-[#111111] uppercase mb-2">
                    {clinic.title}
                  </h4>
                  <p className="text-xs font-mono text-slate-700 font-semibold leading-relaxed">
                    {clinic.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mentors on Deck Badge */}
          <div className="mt-8 pt-6 border-t-[3px] border-[#111111] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-[#F07C27] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-bold text-white">
                ★
              </span>
              <span className="font-mono text-xs font-bold text-[#111111] uppercase tracking-wider">
                Mentors on Deck: Ayush Mitra (Lab 1) • Ranjeet (Lab 2) • Ramanand (Lab 3) • Shontu (Lab 4) • Kamal (Online)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="neo-btn bg-[#F07C27] text-white px-6 py-2.5 text-xs font-black uppercase"
              >
                Enroll in Workshop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] text-white border-t-[4px] border-[#111111] py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-[#F07C27] text-white px-2 py-0.5 border-[2px] border-white font-bold">
              S60
            </span>
            <span>© 2026 Skill Up · 6-Day Intensive C++ Workshop (12–16 Oct)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/curriculum" className="text-[#F07C27]">Curriculum</Link>
            <Link href="/workshops" className="hover:text-white">Workshops</Link>
            <Link href="/about" className="hover:text-white">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
