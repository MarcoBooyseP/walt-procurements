---
created_at: '2026-06-12T12:53:04.277939'
username: marcobooysep
---
# Work Log - Email Routing & Dynamic Lookups

## Overarching Goals

Implement a quick out-of-spec feature to route system notification emails directly to the users involved rather than a hardcoded testing email. The goal was to dynamically fetch manager, director, and employee email addresses from the database to ensure relevant users are notified, while setting up a fallback email with a clarifying notice, and BCC'ing Marco.

## What Was Accomplished

- **Dynamic Email Lookups:** 
  - Updated the request submission flow to fetch the submitter's `managerId` and email the manager directly.
  - When a request requires Director approval or is referred to a director, the system dynamically queries the database for all users with the `DIRECTOR` role and emails them.
  - When an order is marked ready for pickup, the system emails the submitting employee's registered email address.
- **Fallback Logic:**
  - Added `hannes@waltlandgoed.com` as the default fallback email if an expected email address is not found.
  - Added a `fallbackNotice` prop to the email templates (`ApprovalNeededEmail` and `ReadyForPickupEmail`) to explicitly render a styled notice banner explaining why the email was sent to the fallback address.
- **BCC Integration:**
  - Added `marco@middelman.co.za` as a BCC on every single dispatched email to maintain systemic visibility.

## Key Files Affected

- `src/actions/request.tsx`: Refactored `submitRequest`, `referToDirector`, and `markReadyForPickup` to query dynamic user emails, track fallback usage, and apply BCCs.
- `src/emails/approval-needed-email.tsx`: Added `fallbackNotice` prop and styled yellow alert banner rendering.
- `src/emails/ready-for-pickup-email.tsx`: Added `fallbackNotice` prop and styled yellow alert banner rendering.

## What Comes Next

Wait for further user requests or a new active spec.
