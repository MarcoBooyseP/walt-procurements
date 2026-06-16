---
title: PO Workflow Refactor Context
created_at: '2026-05-22T08:44:17.101136'
updated_at: '2026-05-22T08:44:17.101136'
---
Workflow Context:
1. Admin Dashboard is the main screen and UI, restricted to admins.
2. Home page has the supply request form for employees to initiate POs.
3. Workflow: Employee submits -> Manager approves (current step remains) -> Final approval by Kobus Raath (no longer goes to assigned accountant).
4. Admin Dashboard will be used by admin users to track and interact with POs throughout the whole process.
5. Admin Dashboard needs a table listing all POs, their status, and workflow position. Admins can also approve/deny POs.
6. We will focus on making changes to the admin dashboard first before other work.