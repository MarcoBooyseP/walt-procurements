---
created_at: '2026-06-03T12:29:35.659488'
username: marcobooysep
spec_slug: client_feature_requests_batch_1
---
# Work Log - Client Feature Requests Batch 1

## Overarching Goals

Implement a series of client-requested UI, logical, and communication improvements. This included adding supplier management to the admin dashboard, interactive analytics, inbox updates for various roles, strict editing boundaries based on request statuses, and an overhaul of the automated email notification system.

## What Was Accomplished

- **Supplier Management**: Added the ability to update a supplier for an order from the admin table if it was previously marked as "Unsure". Also added a dedicated Supplier Management page to create, edit, and delete suppliers.
- **Order Editing Restrictions**: Prevented any user (including admins) from editing an order's details if its status is "ORDER PLACED", "COMPLETED", "READY_FOR_PICKUP", or "DENIED".
- **Inbox Extensions**: 
  - Added a "Track My Requests" button to the Employee inbox view.
  - Added a "My Orders Ready to Collect" section to the Manager and Director dashboards so they can see their own orders that are ready for pickup and mark them as received.
- **Analytics Overhaul**: Added a new pie chart for Supplier Distribution and made all KPI cards and charts fully interactive, popping up a modal that lists the underlying purchase orders contributing to the selected metric.
- **Email Notification Refactor**: Scrapped 5 old email templates and replaced them with 2 unified ones (`ApprovalNeededEmail` and `ReadyForPickupEmail`). Rewrote the server triggers to drastically reduce email noise, ensuring emails are ONLY sent to Managers/Directors for pending approvals and to any user when their order is ready for pickup.

## Key Files Affected

- `src/actions/request.tsx`: Overhauled email sending logic and updated status handlers.
- `src/app/admin/purchase-order-table.tsx`: Added supplier selection on "Mark Placed" and restricted the "Edit Details" action based on status.
- `src/app/admin/analytics-dashboard.tsx`: Added Supplier Distribution chart and modal interactivity.
- `src/app/home/page.tsx`: Updated to fetch personal ready-for-pickup orders for Managers and Directors.
- `src/components/manager-dashboard.tsx` & `src/components/director-dashboard.tsx`: Added personal order pickup sections.
- `src/components/employee-dashboard.tsx`: Added tracking link.
- `src/emails/*`: Replaced old templates with `approval-needed-email.tsx` and `ready-for-pickup-email.tsx`.

## What Comes Next

All requests in the batch have been completed. The spec is ready to be closed and merged.
