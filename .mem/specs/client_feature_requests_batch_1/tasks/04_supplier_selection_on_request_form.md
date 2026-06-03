---
title: Supplier Selection on Request Form
status: completed
created_at: '2026-06-03T08:17:07.794283'
updated_at: '2026-06-03T09:35:23.668380'
completed_at: '2026-06-03T09:35:23.668372'
---
Add a combobox for Supplier selection on the RequestForm. Allow farm managers to select existing suppliers or add new ones on the fly.

## Completion Notes

Implemented a 'Suppliers' admin settings section to manage a list of suppliers. Created a new 'suppliers' database table. Integrated the supplier dropdown into the RequestForm dynamically populated from the database. Allowed Managers and Directors to view and edit the supplier on the review pages, and displayed the selected supplier in the Admin Purchase Orders table. Separated Supplier into its own column. Made the 'Unsure' supplier undeletable, and added a custom modal to force admins to pick a valid supplier before marking an order as placed.