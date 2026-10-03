# SKILL UP WORKSHOP PLATFORM
## Complete Website Feature & Functional Requirements

Build a complete web-based **Skill Up / C++ Workshop Management, Learning, Assessment, Mentoring and Student Evaluation Platform**.

The platform is designed for yearly Skill Up workshops where students learn programming, attend labs, complete exercises and assignments, take tests directly through the website, interact with mentors, receive evaluation, provide mentor feedback, and eventually participate in the candidate selection/evaluation process.

The platform must support multiple yearly editions such as:

- Skill Up 2026
- Skill Up 2027
- Skill Up 2028
- Future Skill Up editions

Each workshop edition must maintain its own students, mentors, labs, assignments, tests, attendance, results, feedback and other records.

---

# 1. PUBLIC WEBSITE

The website should have a public-facing section that does not require login.

## 1.1 Home / Landing Page

The homepage should explain:

- What Skill Up is
- Purpose of the workshop
- What students learn
- How the workshop works
- Benefits of participating
- Workshop history
- Previous Skill Up editions
- Current workshop information
- Registration information
- Important announcements
- Mentors/instructors
- Workshop statistics
- Contact information
- Login/Register buttons

The landing page should have clear navigation to:

- Home
- About
- Workshop
- Courses/Learning
- Mentors
- Previous Editions
- Announcements
- Contact
- Login
- Registration

---

# 2. ABOUT SKILL UP

Provide an informational section explaining:

- Skill Up's purpose
- Workshop objectives
- Learning methodology
- Programming focus
- C++ learning path
- Lab-based learning
- Assessment methodology
- Mentoring system
- Student evaluation
- Candidate selection process
- History/legacy of previous Skill Up editions

---

# 3. WORKSHOP HISTORY

Display previous workshop editions.

Example:

Skill Up 2024
Skill Up 2025
Skill Up 2026
Skill Up 2027

Each edition can contain:

- Number of students
- Number of mentors
- Number of labs
- Workshop duration
- Activities
- Results
- Achievements
- Selected candidates
- Photos/resources where applicable

Historical information should remain separate from the current workshop.

---

# 4. WORKSHOP MANAGEMENT

Every workshop is a separate edition.

A workshop contains:

- Workshop name
- Year
- Description
- Start date
- End date
- Registration period
- Status
- Rules
- Learning curriculum
- Labs
- Mentors
- Students
- Sessions
- Assignments
- Assessments
- Attendance
- Results
- Feedback
- Selection/evaluation data

Possible workshop status:

- Upcoming
- Registration Open
- Registration Closed
- Active
- Completed
- Archived

Administrators should be able to create, edit, publish, archive and manage workshop editions.

---

# 5. STUDENT REGISTRATION

Students should be able to register for a workshop through the website.

Registration can collect:

- Name
- Email
- Phone
- College/institution
- Course/degree
- Branch
- Semester/year
- Student ID/roll number
- Programming experience
- Relevant information required by organizers

After registration:

```
Registration
↓
Application/Enrollment
↓
Admin Review
↓
Approved/Rejected
↓
Student Account
↓
Workshop Enrollment
```

Students should be able to see their registration/application status.

---

# 6. AUTHENTICATION

Provide a complete authentication system.

Features:

- Student registration
- Login
- Logout
- Password hashing
- Forgot password
- Reset password
- Change password
- Email verification if required
- Session/token management
- Protected routes
- Account activation/deactivation

Use role-based authentication.

Roles:

```
STUDENT
MENTOR
ADMIN
```

The backend must determine the authenticated user's identity from the authentication token/session.

The frontend must not be trusted to decide what a user is allowed to access.

---

# 7. STUDENT DASHBOARD

After login, students should have a dedicated dashboard.

Dashboard should display:

- Welcome message
- Current workshop
- Assigned lab
- Assigned mentor
- Attendance percentage
- Assignment progress
- Pending assignments
- Upcoming tests
- Recent marks
- Overall performance
- Open doubts
- Recent notes/resources
- Announcements
- Feedback status
- Important deadlines

---

# 8. STUDENT PROFILE

Students should have a profile page.

Profile includes:

- Name
- Profile photo
- Email
- Phone
- College
- Course
- Branch
- Semester/year
- Student ID
- Workshop
- Lab
- Mentor

Students should be able to edit permitted profile information.

---

# 9. LAB MANAGEMENT

Students are grouped into labs.

Each lab should contain:

- Lab name
- Workshop
- Mentor
- Students
- Schedule
- Sessions
- Attendance
- Assignments
- Assessments
- Performance

---

# 10. MENTOR MANAGEMENT

Mentors should have their own accounts and dashboards.

Mentor profile:

- Name
- Profile photo
- Email
- Expertise
- Experience
- Assigned workshop
- Assigned lab
- Assigned students

---

# 11. MENTOR DASHBOARD

Mentor dashboard should show:

- Assigned workshop
- Assigned lab
- Number of students
- Attendance summary
- Assignment completion
- Test performance
- Pending submissions
- Open doubts
- Recent student activity
- Student performance
- Feedback received

---

# 12. LEARNING MATERIAL / NOTES

Resources can include:

- Notes
- PDFs
- Documents
- Code examples
- C++ reference material
- Practice material
- Workshop resources
- Links
- Other educational files

---

# 13. C++ LEARNING CONTENT

Structured C++ learning path topics:

- C++ Basics
- Variables, Data Types, Operators
- Conditional Statements, Loops
- Functions, Arrays, Strings
- Pointers, References
- Structures, Classes, OOP
- Inheritance, Polymorphism
- STL, Algorithms
- Problem Solving
- Advanced C++ topics

---

# 14. EXERCISES

Each exercise may contain:

- Title, Description, Problem statement
- Difficulty, Topic
- Examples, Input/Output format
- Constraints, Expected solution
- Deadline, Status

Student statuses: Not Started / In Progress / Submitted / Completed

---

# 15. ASSIGNMENTS

Features:

- Title, Description, Instructions
- Topic, Attachments
- Start date, Deadline, Maximum marks
- Assigned workshop/lab/students
- Submission requirements

Submission statuses: NOT_STARTED / IN_PROGRESS / SUBMITTED / LATE / EVALUATED

---

# 16. ONLINE TEST / ASSESSMENT SYSTEM

Test types:

- MCQ
- Multiple-answer questions
- True/False
- Short-answer questions
- Programming/coding questions
- Mixed assessments

Test configuration:

- Test title, Description, Workshop, Lab
- Questions, Duration, Start/End date/time
- Maximum marks, Passing marks
- Number of attempts, Negative marking
- Question order, Randomized questions/options
- Auto-submit, Result visibility, Instructions

---

# 17. ONLINE TEST EXPERIENCE

During the test:

- Timer
- Question navigation (Next/Previous)
- Mark for review
- Answer selection
- Progress indicator
- Question status
- Save answers / Auto-save
- Submit button

---

# 18. TEST TIMER & AUTO SUBMISSION

- Countdown timer
- Automatic submission when time expires
- Start/end time restrictions
- Attempt restrictions
- Test availability window
- Auto-save

---

# 19. TEST RESULT

Results contain:

- Total marks, Marks obtained
- Percentage, Correct/Incorrect/Unanswered
- Time taken, Attempt number
- Rank/position, Pass/fail status

---

# 20. QUESTION BANK

Organized by: Topic / Difficulty / Question type / Marks / Workshop / Assessment

---

# 21. CODING ASSESSMENTS

Coding question features:

- Problem statement, Input/Output
- Constraints, Sample input/output
- Time limit, Memory limit, Language
- In-browser code editor
- Code submission and evaluation

---

# 22. ATTENDANCE

Mentors record attendance per session.

Students view:

- Total sessions, Present, Absent
- Attendance percentage, History

---

# 23. SESSION MANAGEMENT

Session fields:

- Title, Date, Start/End time
- Mentor, Lab, Topic, Description
- Attendance, Learning resources

---

# 24. DOUBT-SOLVING SYSTEM

Doubt fields:

- Title, Description, Student, Mentor
- Workshop, Lab, Topic, Status
- Messages, Attachments, Created/Updated date

Statuses: OPEN / IN_PROGRESS / RESOLVED

---

# 25. STUDENT → MENTOR FEEDBACK

Feedback fields:

- Rating, Comment, Category
- Workshop, Lab, Mentor
- Optional anonymity, Date

---

# 26. STUDENT PERFORMANCE TRACKING

Performance includes:

- Assignment marks, Test marks
- Coding assessment scores
- Exercise completion, Attendance
- Participation, Overall score

---

# 27. STUDENT PROGRESS

Progress displays:

- Topics completed, Exercises completed
- Assignments completed, Tests completed
- Average marks, Attendance
- Pending/Upcoming work, Performance trend

---

# 28. PERFORMANCE REPORTS

Reports filterable by:

- Workshop, Lab, Mentor, Student
- Date, Assessment, Topic

---

# 29. CANDIDATE EVALUATION / SELECTION

Configurable evaluation criteria:

- Assignments, Tests, Coding assessments
- Attendance, Exercises
- Other workshop-specific criteria

---

# 30. ANNOUNCEMENTS

Announcements can target:

- General / Workshop-specific / Lab-specific / Student-specific

---

# 31. NOTIFICATIONS

Internal notification system for:

- New assignment, deadline approaching
- Assignment evaluated, New test
- Test result available, New note
- Doubt reply, Attendance update
- Workshop announcement, Feedback request

---

# 32. DEADLINES & REMINDERS

Dashboard displays upcoming:

- Assignments with due dates
- Tests with start times
- Sessions with dates

---

# 33. ADMIN DASHBOARD

Overview shows:

- Active workshop stats
- Total students/mentors/labs
- Average attendance/performance
- Pending evaluations, Open doubts
- Feedback statistics, Recent activity

---

# 34. USER MANAGEMENT

Admin can manage Students, Mentors, and Admins with full CRUD operations.

---

# 35. ROLE & PERMISSION MANAGEMENT

```
Student → Own data only
Mentor  → Assigned students/lab only
Admin   → Full platform management
```

---

# 36. FILE UPLOADS

Support file uploads for:

- Assignment submissions, Notes, PDFs
- Doubt attachments, Profile images
- With size limits, allowed types, access control

---

# 37. SEARCH & FILTERING

Platform-wide search for:

- Students, Mentors, Assignments
- Tests, Labs, Workshops, Doubts, Feedback

---

# 38. ACTIVITY / AUDIT LOG

Log important administrative events for accountability.

---

# 39. DATA SEPARATION BY WORKSHOP

Every entity scoped to its workshop edition to prevent data mixing.

---

# 40-41. DATABASE & API STRUCTURE

Feature-based modular backend with consistent REST API at `/api/*`

---

# 42. SECURITY

- Password hashing, JWT security
- Role-based authorization, Input validation
- Secure file uploads, Rate limiting
- Protected routes, Secure cookies

---

# 43. ERROR HANDLING

Consistent API response envelope:

```json
{ "success": false, "message": "..." }
{ "success": true, "data": {} }
```

---

# 44. RESPONSIVE DESIGN

Works on: Desktop / Laptop / Tablet / Mobile

---

# 45-51. COMPLETE PLATFORM WORKFLOWS

Complete lifecycle: Student Registration → Learning → Mentoring → Assignments → Online Tests → Attendance → Performance → Feedback → Final Evaluation → Candidate Selection → Historical Archive

---

## FEATURE STATUS TRACKING

| # | Feature | Status |
|---|---------|--------|
| 1 | Landing Page | ✅ Implemented |
| 2 | About Skill Up section | ⚠️ Partial (landing page only) |
| 3 | Workshop History page | ❌ Missing |
| 4 | Workshop Management (Admin) | ✅ Implemented |
| 5 | Student Registration with application flow | ⚠️ Partial (no admin review step) |
| 6 | Authentication (login/logout/JWT) | ✅ Implemented |
| 6a | Forgot/Reset password | ❌ Missing |
| 6b | Change password | ❌ Missing |
| 7 | Student Dashboard | ✅ Implemented |
| 7a | Announcements on dashboard | ❌ Missing |
| 7b | Deadlines/reminders widget | ❌ Missing |
| 8 | Student Profile page | ❌ Missing |
| 9 | Lab Management | ✅ Implemented |
| 10 | Mentor Management | ✅ Implemented |
| 11 | Mentor Dashboard | ✅ Implemented |
| 12 | Learning Material / Notes | ✅ Implemented |
| 13 | C++ Learning content topics | ❌ Missing (no topic structure) |
| 14 | Exercises system | ❌ Missing |
| 15 | Assignments | ✅ Implemented |
| 16 | Online Test/Assessment system | ⚠️ Partial (no timer/auto-submit) |
| 17 | Full online test experience (nav/timer) | ❌ Missing |
| 18 | Test timer & auto-submission | ❌ Missing |
| 19 | Test results with full detail | ⚠️ Partial |
| 20 | Question Bank | ❌ Missing |
| 21 | Coding assessments (in-browser editor) | ❌ Missing |
| 22 | Attendance tracking | ✅ Implemented |
| 23 | Session management | ✅ Implemented |
| 24 | Doubt-solving system | ✅ Implemented |
| 25 | Student→Mentor feedback | ✅ Implemented |
| 26 | Performance tracking | ✅ Implemented |
| 27 | Student progress view | ⚠️ Partial |
| 28 | Performance reports | ⚠️ Partial (admin only) |
| 29 | Candidate evaluation/selection | ✅ Implemented |
| 30 | Announcements system | ❌ Missing (API + UI) |
| 31 | Notifications system | ❌ Missing |
| 32 | Deadlines & reminders widget | ❌ Missing |
| 33 | Admin dashboard overview | ✅ Implemented |
| 34 | User management (CRUD) | ✅ Implemented |
| 35 | Role & permission enforcement | ✅ Implemented |
| 36 | File uploads | ❌ Missing |
| 37 | Search & filtering | ⚠️ Partial (users only) |
| 38 | Activity/Audit log | ⚠️ Partial (admin selection only) |
| 39 | Workshop data separation | ✅ Implemented |
| 42 | Security (JWT, bcrypt, validation) | ✅ Implemented |
| 43 | Error handling (consistent envelope) | ✅ Implemented |
| 44 | Responsive design | ✅ Implemented |
| Public: /about page | About Skill Up page | ❌ Missing |
| Public: /workshops page | Workshop history page | ❌ Missing |
| Public: /register page | Student registration portal | ⚠️ Partial |
| Student: Profile edit page | /student/profile | ❌ Missing |
| Student: Exercises tab | Exercises in student dashboard | ❌ Missing |
| Admin: Announcements CRUD | Announcements management | ❌ Missing |
| Admin: Question bank | Question management | ❌ Missing |
