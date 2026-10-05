---
created_at: '2026-10-05T15:06:53.143060'
username: marcobooysep
---
Work Log - Admin pickup actions and own-order delete

## Overarching Goals

Give admins the same ready-for-pickup actions employees already have, and let an admin delete only the orders they logged themselves. Then ship that work to production without a pull request.

## What Was Accomplished

- **Ready for pickup actions:** On the admin purchase-order table, orders with status `READY_FOR_PICKUP` now show Mark as Picked Up and Send back in the actions menu. Picked up uses the existing `markPickedUp` action. Send back opens the same reason dialog employees use and calls `sendBackOrder`.
- **Delete own orders:** Admins see Delete Order only when `request.submittedByUserId` matches the signed-in admin. `deleteOwnRequest` checks that the session user is an admin and deletes only a row whose `submittedByUserId` is that user. A confirmation dialog asks before the delete.
- **Promotion:** The feature commit was pushed to `dev`. Direct promotion fast-forwarded `test`. `main` could not fast-forward because it had unique non-merge commits (mobile admin sidebar, client-side sign-out redirect, and older merge commits). Those were merged into `dev` so production kept them, then `test` and `main` were fast-forwarded to `cb4f61a`. No pull request was opened.

## Key Files Affected

- `src/app/admin/purchase-order-table.tsx`: Pickup and send-back menu items, send-back dialog, delete menu item, and delete confirmation dialog.
- `src/app/admin/admin-client.tsx`: Passes the signed-in admin id into the purchase-order table. The reunify merge also kept the mobile sidebar that already existed on `main`.
- `src/actions/request.tsx`: Added `deleteOwnRequest`, which requires an admin session and matches `submittedByUserId`.
- `src/components/sign-out-button.tsx`: Brought back onto `dev` from `main` during reunify. Sign-out redirects in the browser instead of a server form action.
- `.gitignore`: Moved the Agent Core `.DS_Store` ignore rule above the force-track rules.
