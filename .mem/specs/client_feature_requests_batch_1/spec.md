---
title: Client Feature Requests Batch 1
status: todo
assigned_to: null
issue_id: 1
issue_url: https://github.com/MarcoBooyseP/walt-procurements/issues/1
branch: null
pr_url: null
created_at: '2026-06-03T08:16:27.617162'
updated_at: '2026-06-03T08:18:22.109514'
completed_at: null
last_synced_at: '2026-06-03T08:18:22.108516'
local_content_hash: 6cc0e564a2144a8449a203e5a829a2f17f1bc0c3d168d7de415c7944b4b80bc5
remote_content_hash: 6cc0e564a2144a8449a203e5a829a2f17f1bc0c3d168d7de415c7944b4b80bc5
---
## Overview

Implement a series of feature requests and changes requested by the client after initial platform usage. These changes touch upon order routing, order editing capabilities for different roles, advanced analytics, supplier selection, role-specific dashboards, and visibility of completed requests.

## Goals

- Allow dynamic routing of orders to Kobus by specific roles (Andre/Kobie) via a button.
- Grant Manager and Admin roles the ability to edit existing orders.
- Provide insights into farm ordering patterns via an Analytics Dashboard.
- Allow Farm Managers to add or select a supplier directly on the request form.
- Provide dedicated dashboards for Farm Managers and Managers, featuring their own requests and (for Managers) requests they need to approve.
- Retain visibility of "picked up" requests for Carien (presumably Admin/Director) to maintain a paper trail.

## Technical Approach

- **Order Routing (Kobus):** Add a "Refer to Kobus" action/button on the order review UI for users Andre and Kobie (or their specific roles, e.g. Director). Update the PO schema/status to handle this new workflow state.
- **Order Editing:** Implement an edit modal or page for POs, accessible based on user role (Manager, Admin). Add server actions to safely update PO details.
- **Analytics Dashboard:** Extend the existing analytics dashboard (using Recharts) to include a breakdown of orders by Farm (location), highlighting highest volume and potentially excess items.
- **Supplier Selection:** Update the `RequestForm` to include a Combobox for Suppliers, similar to Locations/Categories. Allow adding new suppliers on the fly if permitted.
- **Role-Specific Dashboards:** Abstract the `AdminDashboard` components into reusable lists/tables. Create `FarmManagerDashboard` and `ManagerDashboard` components and route users to them upon login based on their role.
- **Visibility of Picked-Up Orders:** Adjust the filtering logic on the admin/Carien's PO table to ensure that requests marked as "Picked Up" or completed remain visible (e.g., perhaps in a "Completed" tab or by default in the main list with a clear status badge).

## Success Criteria

- Andre/Kobie can successfully route an order to Kobus.
- Managers and Admins can edit an order and the changes reflect in the database.
- The Analytics Dashboard displays order volume by farm.
- Farm managers can select or add a supplier during the request process.
- Farm managers and Managers have their own personalized dashboards showing relevant requests.
- Requests marked as "picked up" remain visible in Carien's dashboard/table.

## Notes

- Need to verify if "Kobus", "Andre", and "Kobie" refer to specific roles (e.g., Director, Admin) or specific users, to make the permission checks robust.
- "Carien" likely refers to an Admin or the main procurement officer.
