# Project Context: Walt Landgoed Supply Workflow (PoC)

## 1. Project Overview
We are building a lightweight Proof of Concept (PoC) web application for **Walt Landgoed**, a large-scale pig farming operation. The goal is to digitize their supply and consumable procurement workflow. 

The system must handle three distinct user roles seamlessly within a single Next.js application using server-side rendering, Server Actions, and email-based routing.

## 2. Tech Stack & Infrastructure
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS + standard UI components (e.g., Shadcn UI styling for clean, accessible interfaces)
* **Color Scheme:** 
  * Primary: `#aa272f` (Brand Red)
  * Secondary: `#505050` (Brand Gray)
  * Background: White
* **Database Layer:** Drizzle ORM (SQLite or PostgreSQL depending on environment setup)
* **Email Automation:** Resend + React Email (for rendering transactional review/notification emails)
* **Deployment Target:** Self-hosted Dokploy instance

## 3. Core User Flows & Architecture

### Stage 1: Field Worker Submission (`/request`)
* **Target Device:** Mobile-first (optimized for field usage in pig pens with dirty hands).
* **Interface Requirements:** Big touch targets, clean full-width buttons, standard HTML dropdowns/selects where possible.
* **Inputs:**
  * `requestedBy` (Select/Dropdown: Employee name)
  * `farmLocation` (Select/Dropdown: e.g., "Roodekuil")
  * `category` (Select/Dropdown: Supplies, Tools, Consumables, Feed, Vet)
  * `itemDetails` (Textarea: Item requested details and reason)
  * `urgency` (Select/Radio: Low, Medium, Critical)
  * `photoAttachment` (File input optimized for native camera capture: `<input type="file" accept="image/*" capture="environment" />`)
* **Behavior:** On submit, upload the image to a storage bucket, write a new record to the database with `status: 'PENDING'`, and dispatch a notification email to the Manager.

### Stage 2: Manager Review (`/manager/review/[id]`)
* **Target Device:** Mobile-responsive web view.
* **Interface Requirements:** Minimal interface displaying the submitted parameters, the photo, and two primary action buttons: **[ Approve Request ]** (Green) and **[ Deny Request ]** (Red).
* **Behavior:** Clicking "Approve" triggers a Server Action updating the DB record to `status: 'APPROVED'` and automatically dispatches a fulfillment notification email to the Accounts department.

### Stage 3: Accounts Fulfillment (`/accounts`)
* **Target Device:** Desktop-optimized dashboard.
* **Interface Requirements:** A clean data table or Kanban board layout listing all requests where `status === 'APPROVED'`. Columns must include Date, Location, Category, Item Details, Urgency, Photo Link, and Actions.
* **Behavior:** Includes a primary action button **[ Mark as Ordered ]** for each row. Triggering this updates the record to `status: 'ORDERED'`, filtering it out of the active fulfillment queue.

## 4. Database Schema Blueprint (Drizzle ORM)
Create a single table named `requests` with the following structure:
* `id`: UUID (Primary Key, default random)
* `requestedBy`: Text (Not null)
* `farmLocation`: Text (Not null)
* `category`: Text (Not null)
* `itemDetails`: Text (Not null)
* `urgency`: Text (Default 'Low')
* `photoUrl`: Text (Nullable storage bucket URL)
* `status`: Text/Enum ('PENDING', 'APPROVED', 'DENIED', 'ORDERED') - Default 'PENDING'
* `createdAt`: Timestamp (Default now)

## 5. Development & Agent Rules
* **Server Actions:** Rely strictly on Next.js Server Actions inside an `actions/` directory for database mutations and triggering email dispatches. Avoid setting up standard API routes (`/api`) unless absolutely necessary for external webhooks.
* **Component Design:** Prioritize simplicity and scannability. Keep the styling clean, modern, and highly functional.
* **Mocking Assets:** For the initial skeleton build, abstract the file upload utility so it can temporarily return a mock image URL if cloud storage credentials are not immediately provided in `.env`.
