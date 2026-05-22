"use server";
import * as React from 'react';

import { db } from "@/db";
import { requests } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { resend } from "@/lib/resend";
import { ManagerNotificationEmail } from "@/emails/manager-notification";
import { DirectorNotificationEmail } from "@/emails/director-notification";

import { render } from '@react-email/render';

import { uploadToS3 } from "@/lib/s3";

const ENABLE_EMAILS = false;

export async function submitRequest(formData: FormData) {
  const requestedBy = formData.get("requestedBy") as string;
  const submittedByUserId = formData.get("submittedByUserId") as string;
  const submittedByRole = formData.get("submittedByRole") as string;
  const farmLocation = formData.get("farmLocation") as string;
  const category = formData.get("category") as string;
  const itemDetails = formData.get("itemDetails") as string;
  const urgency = formData.get("urgency") as string;
  const quantity = formData.get("quantity") as string;
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
  const isElevatedRole = submittedByRole === "MANAGER" || submittedByRole === "ADMIN";
  const isDirector = submittedByRole === "DIRECTOR";
  const initialStatus = isDirector ? "AWAITING_PLACEMENT" : isElevatedRole ? "PENDING_DIRECTOR" : "PENDING";

  const [newRequest] = await db.insert(requests).values({
    requestedBy,
    submittedByUserId: submittedByUserId || null,
    farmLocation,
    category,
    itemDetails,
    urgency,
    quantity: quantity || "1",
    fileUrls,
    status: initialStatus,
  }).returning();

  if (ENABLE_EMAILS && resend && process.env.RESEND_FROM_EMAIL) {
    try {
      if (isDirector) {
        // Skip all approvals, it's ready for placement
        // You could send a notification to the admin that a director submitted an order
        console.log(`[RESEND] Director auto-approved their own Request: ${newRequest.id}`);
      } else if (isElevatedRole) {
        // Skip manager approval, send straight to director
        const emailHtml = await render(
          <DirectorNotificationEmail
            id={newRequest.id}
            requestedBy={requestedBy}
            farmLocation={farmLocation}
            category={category}
            itemDetails={itemDetails}
            urgency={urgency}
            fileUrls={newRequest.fileUrls || []}
          />
        );

        await resend.emails.send({
          from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
          to: ["marco@middelman.co.za"],
          subject: `[${urgency}] Final Approval Needed: Supply Request from ${requestedBy}`,
          html: emailHtml,
        });
        console.log(`[RESEND] Dispatched director notification for auto-advanced Request: ${newRequest.id}`);
      } else {
        // EMPLOYEE: notify manager for approval
        const emailHtml = await render(
          <ManagerNotificationEmail
            id={newRequest.id}
            requestedBy={requestedBy}
            farmLocation={farmLocation}
            category={category}
            itemDetails={itemDetails}
            urgency={urgency}
            fileUrls={newRequest.fileUrls || []}
          />
        );

        await resend.emails.send({
          from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
          to: ["marco@middelman.co.za"],
          subject: `[${urgency}] New Supply Request from ${requestedBy}`,
          html: emailHtml,
        });
        console.log(`[RESEND] Dispatched manager notification for Request: ${newRequest.id}`);
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

import { DenialNotificationEmail } from "@/emails/denial-notification";
import { ApprovalNotificationEmail } from "@/emails/approval-notification";

export async function approveRequest(id: string, comment?: string) {
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
      // 1. Notify Director that Manager has approved
      const emailHtml = await render(
        <DirectorNotificationEmail
          id={updatedRequest.id}
          requestedBy={updatedRequest.requestedBy}
          farmLocation={updatedRequest.farmLocation}
          category={updatedRequest.category}
          itemDetails={updatedRequest.itemDetails}
          urgency={updatedRequest.urgency}
          fileUrls={updatedRequest.fileUrls || []}
          managerComment={updatedRequest.managerComment}
        />
      );

      await resend.emails.send({
        from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
        to: ["marco@middelman.co.za"],
        subject: `[${updatedRequest.urgency}] Final Approval Needed: Supply Request from ${updatedRequest.requestedBy}`,
        html: emailHtml,
      });

      console.log(`[RESEND] Dispatched director notification for Request: ${id}`);
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
  
  if (ENABLE_EMAILS && updatedRequest && resend && process.env.RESEND_FROM_EMAIL) {
    try {
      const emailHtml = await render(
        <DenialNotificationEmail
          requestedBy={updatedRequest.requestedBy}
          category={updatedRequest.category}
          itemDetails={updatedRequest.itemDetails}
          managerComment={updatedRequest.managerComment}
        />
      );

      await resend.emails.send({
        from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
        to: ["marco@middelman.co.za"],
        subject: `Request Denied: ${updatedRequest.category} request`,
        html: emailHtml,
      });
    } catch (error) {
      console.error("[RESEND] Failed to send denial email", error);
    }
  }

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
  
  if (ENABLE_EMAILS && updatedRequest && resend && process.env.RESEND_FROM_EMAIL) {
    try {
      // 1. Notify Requester
      const requesterEmailHtml = await render(
        <ApprovalNotificationEmail
          requestedBy={updatedRequest.requestedBy}
          category={updatedRequest.category}
          itemDetails={updatedRequest.itemDetails}
          managerComment={updatedRequest.directorComment} // using director's comment in approval email
        />
      );

      await resend.emails.send({
        from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
        to: ["marco@middelman.co.za"],
        subject: `Request Approved: ${updatedRequest.category} request`,
        html: requesterEmailHtml,
      });

      console.log(`[RESEND] Dispatched final approval email for Request: ${id}`);
    } catch (error) {
      console.error("[RESEND] Failed to send approval emails", error);
    }
  }

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
  
  if (ENABLE_EMAILS && updatedRequest && resend && process.env.RESEND_FROM_EMAIL) {
    try {
      const emailHtml = await render(
        <DenialNotificationEmail
          requestedBy={updatedRequest.requestedBy}
          category={updatedRequest.category}
          itemDetails={updatedRequest.itemDetails}
          managerComment={updatedRequest.directorComment} // using director's comment
        />
      );

      await resend.emails.send({
        from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
        to: ["marco@middelman.co.za"],
        subject: `Request Denied: ${updatedRequest.category} request`,
        html: emailHtml,
      });
    } catch (error) {
      console.error("[RESEND] Failed to send denial email", error);
    }
  }

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

import { ReadyForPickupNotificationEmail } from "@/emails/ready-for-pickup-notification";

export async function markOrderPlaced(id: string) {
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
        <ReadyForPickupNotificationEmail
          requestedBy={updatedRequest.requestedBy}
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
