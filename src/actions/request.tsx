"use server";
import * as React from 'react';

import { db } from "@/db";
import { requests } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { resend } from "@/lib/resend";
import { ApprovalNeededEmail } from "@/emails/approval-needed-email";
import { ReadyForPickupEmail } from "@/emails/ready-for-pickup-email";

import { render } from '@react-email/render';

import { uploadToS3 } from "@/lib/s3";

const ENABLE_EMAILS = true;

export async function submitRequest(formData: FormData) {
  const requestedBy = formData.get("requestedBy") as string;
  const submittedByUserId = formData.get("submittedByUserId") as string;
  const submittedByRole = formData.get("submittedByRole") as string;
  const farmLocation = formData.get("farmLocation") as string;
  const category = formData.get("category") as string;
  const itemDetails = formData.get("itemDetails") as string;
  const urgency = formData.get("urgency") as string;
  const quantity = formData.get("quantity") as string;
  const supplier = formData.get("supplier") as string;
  const photoFiles = formData.getAll("photoAttachment") as File[];

  if (!requestedBy || !farmLocation || !category || !itemDetails || !urgency) {
    throw new Error("Missing required fields");
  }

  const fileUrls: string[] = [];
  for (const file of photoFiles) {
    if (file.size > 0) {
      const url = await uploadToS3(file);
      if (url) fileUrls.push(url);
    }
  }

  // Managers and Admins skip manager approval — their requests go straight to PENDING_DIRECTOR
  // Directors skip both manager and director approval — their requests go straight to AWAITING_PLACEMENT
  const bypassDirector = formData.get("bypassDirector") === "true";
  const isManager = submittedByRole === "MANAGER";
  const isElevatedRole = isManager || submittedByRole === "ADMIN";
  const isDirector = submittedByRole === "DIRECTOR";
  
  let initialStatus = "PENDING";
  if (isDirector) {
    initialStatus = "AWAITING_PLACEMENT";
  } else if (isManager && bypassDirector) {
    initialStatus = "AWAITING_PLACEMENT";
  } else if (isElevatedRole) {
    initialStatus = "PENDING_DIRECTOR";
  }

  const [newRequest] = await db.insert(requests).values({
    requestedBy,
    submittedByUserId: submittedByUserId || null,
    farmLocation,
    category,
    itemDetails,
    urgency,
    quantity: quantity || "1",
    supplier: supplier || null,
    fileUrls,
    status: initialStatus,
  }).returning();

  if (ENABLE_EMAILS && resend && process.env.RESEND_FROM_EMAIL) {
    try {
      if (isDirector || (isManager && bypassDirector)) {
        console.log(`[RESEND] Request skipped approvals: ${newRequest.id}`);
      } else if (isElevatedRole) {
        // Needs Director Approval
        const emailHtml = await render(
          <ApprovalNeededEmail
            id={newRequest.id}
            requestedBy={requestedBy}
            farmLocation={farmLocation}
            category={category}
            itemDetails={itemDetails}
            urgency={urgency}
            fileUrls={newRequest.fileUrls || []}
            reviewerRole="DIRECTOR"
          />
        );

        await resend.emails.send({
          from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
          to: ["marco@middelman.co.za"],
          subject: `[${urgency}] Director Approval Needed: Supply Request from ${requestedBy}`,
          html: emailHtml,
        });
        console.log(`[RESEND] Dispatched Director approval notification for Request: ${newRequest.id}`);
      } else {
        // Needs Manager Approval
        const emailHtml = await render(
          <ApprovalNeededEmail
            id={newRequest.id}
            requestedBy={requestedBy}
            farmLocation={farmLocation}
            category={category}
            itemDetails={itemDetails}
            urgency={urgency}
            fileUrls={newRequest.fileUrls || []}
            reviewerRole="MANAGER"
          />
        );

        await resend.emails.send({
          from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
          to: ["marco@middelman.co.za"],
          subject: `[${urgency}] Manager Approval Needed: Supply Request from ${requestedBy}`,
          html: emailHtml,
        });
        console.log(`[RESEND] Dispatched Manager approval notification for Request: ${newRequest.id}`);
      }
    } catch (error) {
      console.error("[RESEND] Failed to send email", error);
    }
  } else {
    console.warn("[RESEND] Not configured. Skipping email dispatch.");
  }
  revalidatePath("/");
  return { success: true, requestId: newRequest.id };
}

export async function approveRequest(id: string, comment?: string) {
  const [updatedRequest] = await db.update(requests)
    .set({ 
      status: "AWAITING_PLACEMENT",
      managerComment: comment || null,
      managerApprovalDate: new Date()
    })
    .where(sql`id = ${id}`)
    .returning();

  revalidatePath(`/manager/review/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function referToDirector(id: string, comment?: string) {
  const [updatedRequest] = await db.update(requests)
    .set({ 
      status: "PENDING_DIRECTOR",
      managerComment: comment || null,
      managerApprovalDate: new Date()
    })
    .where(sql`id = ${id}`)
    .returning();
  
  if (ENABLE_EMAILS && updatedRequest && resend && process.env.RESEND_FROM_EMAIL) {
    try {
      // 1. Notify Director that Manager has referred it
      const emailHtml = await render(
        <ApprovalNeededEmail
          id={updatedRequest.id}
          requestedBy={updatedRequest.requestedBy}
          farmLocation={updatedRequest.farmLocation}
          category={updatedRequest.category}
          itemDetails={updatedRequest.itemDetails}
          urgency={updatedRequest.urgency}
          fileUrls={updatedRequest.fileUrls || []}
          reviewerRole="DIRECTOR"
        />
      );

      await resend.emails.send({
        from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
        to: ["marco@middelman.co.za"],
        subject: `[${updatedRequest.urgency}] Director Approval Needed: Supply Request from ${updatedRequest.requestedBy}`,
        html: emailHtml,
      });

      console.log(`[RESEND] Dispatched Director approval notification for Request: ${id}`);
    } catch (error) {
      console.error("[RESEND] Failed to send director notification", error);
    }
  }

  revalidatePath(`/manager/review/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function denyRequest(id: string, comment?: string) {
  const [updatedRequest] = await db.update(requests)
    .set({ 
      status: "DENIED",
      managerComment: comment || null
    })
    .where(sql`id = ${id}`)
    .returning();
  
  revalidatePath(`/manager/review/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function directorApproveRequest(id: string, comment?: string) {
  const [updatedRequest] = await db.update(requests)
    .set({ 
      status: "AWAITING_PLACEMENT",
      directorComment: comment || null,
      directorApprovalDate: new Date()
    })
    .where(sql`id = ${id}`)
    .returning();

  revalidatePath(`/director/review/${id}`);
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function directorDenyRequest(id: string, comment?: string) {
  const [updatedRequest] = await db.update(requests)
    .set({ 
      status: "DENIED",
      directorComment: comment || null
    })
    .where(sql`id = ${id}`)
    .returning();

  revalidatePath(`/director/review/${id}`);
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function addDocumentsToRequest(requestId: string, formData: FormData) {
  const photoFiles = formData.getAll("document") as File[];
  
  if (!photoFiles || photoFiles.length === 0) {
    throw new Error("No files provided");
  }

  // Fetch the existing request to get current fileUrls
  const [existingRequest] = await db.select().from(requests).where(sql`id = ${requestId}`);
  
  if (!existingRequest) {
    throw new Error("Request not found");
  }

  const newFileUrls: string[] = [];
  for (const file of photoFiles) {
    if (file.size > 0) {
      const url = await uploadToS3(file);
      if (url) newFileUrls.push(url);
    }
  }

  const combinedUrls = [...(existingRequest.fileUrls || []), ...newFileUrls];

  await db.update(requests)
    .set({ fileUrls: combinedUrls })
    .where(sql`id = ${requestId}`);

  revalidatePath("/admin");
  return { success: true, newUrls: newFileUrls };
}



export async function markOrderPlaced(id: string) {
  const [existingRequest] = await db.select().from(requests).where(sql`id = ${id}`).limit(1);
  
  if (!existingRequest) {
    throw new Error("Request not found");
  }

  if (existingRequest.supplier === "Unsure (To be confirmed)") {
    throw new Error("You must select a confirmed supplier before marking the order as placed.");
  }

  await db.update(requests).set({ status: "ORDER_PLACED", orderPlacedDate: new Date() }).where(sql`id = ${id}`);
  revalidatePath("/admin");
  revalidatePath("/requests");
  return { success: true };
}

export async function markReadyForPickup(id: string) {
  const [updatedRequest] = await db.update(requests)
    .set({ status: "READY_FOR_PICKUP", orderReceivedDate: new Date() })
    .where(sql`id = ${id}`)
    .returning();
  
  if (ENABLE_EMAILS && updatedRequest && resend && process.env.RESEND_FROM_EMAIL) {
    try {
      const emailHtml = await render(
        <ReadyForPickupEmail
          requestedBy={updatedRequest.requestedBy}
          farmLocation={updatedRequest.farmLocation}
          category={updatedRequest.category}
          itemDetails={updatedRequest.itemDetails}
        />
      );

      await resend.emails.send({
        from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
        to: ["marco@middelman.co.za"],
        subject: `Ready for Pickup: ${updatedRequest.category} request`,
        html: emailHtml,
      });
      console.log(`[RESEND] Dispatched ready for pickup notification for Request: ${id}`);
    } catch (error) {
      console.error("[RESEND] Failed to send ready for pickup notification", error);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/requests");
  return { success: true };
}

export async function markPickedUp(id: string) {
  await db.update(requests).set({ status: "COMPLETED", orderPickedUpDate: new Date() }).where(sql`id = ${id}`);
  revalidatePath("/admin");
  revalidatePath("/requests");
  return { success: true };
}

export async function editRequest(
  id: string,
  data: {
    farmLocation: string;
    category: string;
    itemDetails: string;
    urgency: string;
    quantity: string;
    supplier?: string;
  }
) {
  const [existingRequest] = await db.select().from(requests).where(sql`id = ${id}`);
  if (!existingRequest) {
    throw new Error("Request not found");
  }
  if (existingRequest.status === "COMPLETED" || existingRequest.status === "DENIED") {
    throw new Error("Cannot edit a request that is already completed or denied.");
  }

  await db.update(requests)
    .set({
      farmLocation: data.farmLocation,
      category: data.category,
      itemDetails: data.itemDetails,
      urgency: data.urgency,
      quantity: data.quantity || "1",
      supplier: data.supplier || null,
    })
    .where(sql`id = ${id}`);

  revalidatePath("/admin");
  revalidatePath("/manager/review/[id]", "page");
  revalidatePath("/director/review/[id]", "page");
  return { success: true };
}

export async function sendToDirectorApproval(id: string) {
  await db.update(requests).set({ status: "PENDING_DIRECTOR" }).where(sql`id = ${id}`);
  revalidatePath("/admin");
  revalidatePath("/requests");
  return { success: true };
}
