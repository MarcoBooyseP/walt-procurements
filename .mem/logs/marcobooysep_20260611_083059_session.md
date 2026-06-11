---
created_at: '2026-06-11T08:30:59.431920'
username: marcobooysep
---
# Work Log - Added Supplier Filter to Admin Dashboard

## Overarching Goals

Implemented a quick out-of-spec feature request to add a Supplier filter to the Purchase Orders table on the Admin Overview page.

## What Was Accomplished

- **Supplier Filter**: Added a new dropdown to the Purchase Order table filters that allows users to filter requests by a specific supplier.
- **Dynamic Supplier List**: The dropdown options are dynamically populated based on the unique suppliers present in the active or completed requests.
- **Filter Integration**: Integrated the new supplier filter with the existing `clearFilters` functionality and active filter checks.

## Key Files Affected

- `src/app/admin/purchase-order-table.tsx`: Added `supplierFilter` state, updated filter checks, and added the dropdown UI.

## What Comes Next

Wait for further out-of-spec requests or the next spec to be assigned.
