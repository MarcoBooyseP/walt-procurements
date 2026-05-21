"use server";
import * as React from 'react';

import { db } from "@/db";
import { requests } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { resend } from "@/lib/resend";
import { ManagerNotificationEmail } from "@/emails/manager-notification";

import { render } from '@react-email/render';

import { uploadToS3 } from "@/lib/s3";

export async function submitRequest(formData: FormData) {
  const requestedBy = formData.get("requestedBy") as string;
  const submittedByUserId = formData.get("submittedByUserId") as string;
  const submittedByRole = formData.get("submittedByRole") as string;
  const farmLocation = formData.get("farmLocation") as string;
  const category = formData.get("category") as string;
  const itemDetails = formData.get("itemDetails") as string;
  const urgency = formData.get("urgency") as string;
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

  // Managers and Admins skip manager approval — their requests go straight to APPROVED
  const isElevatedRole = submittedByRole === "MANAGER" || submittedByRole === "ADMIN";
  const initialStatus = isElevatedRole ? "APPROVED" : "PENDING";

  const [newRequest] = await db.insert(requests).values({
    requestedBy,
    submittedByUserId: submittedByUserId || null,
    farmLocation,
    category,
    itemDetails,
    urgency,
    fileUrls,
    status: initialStatus,
  }).returning();

  if (resend && process.env.RESEND_FROM_EMAIL) {
    try {
      if (isElevatedRole) {
        // Skip manager approval — notify accountant directly for processing
        // (email logic to be wired up later)
        console.log(`[RESEND] ${submittedByRole} request auto-approved for Request: ${newRequest.id}. Accountant notification pending.`);
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
import { AccountsNotificationEmail } from "@/emails/accounts-notification";

export async function approveRequest(id: string, comment?: string) {
  const [updatedRequest] = await db.update(requests)
    .set({ 
      status: "APPROVED",
      managerComment: comment || null
    })
    .where(sql`id = ${id}`)
    .returning();
  
  if (updatedRequest && resend && process.env.RESEND_FROM_EMAIL) {
    try {
      // 1. Notify Requester
      const requesterEmailHtml = await render(
        <ApprovalNotificationEmail
          requestedBy={updatedRequest.requestedBy}
          category={updatedRequest.category}
          itemDetails={updatedRequest.itemDetails}
          managerComment={updatedRequest.managerComment}
        />
      );

      await resend.emails.send({
        from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
        to: ["marco@middelman.co.za"],
        subject: `Request Approved: ${updatedRequest.category} request`,
        html: requesterEmailHtml,
      });

      // 2. Notify Accounts Department
      const accountsEmailHtml = await render(
        <AccountsNotificationEmail
          id={updatedRequest.id}
          requestedBy={updatedRequest.requestedBy}
          farmLocation={updatedRequest.farmLocation}
          category={updatedRequest.category}
          itemDetails={updatedRequest.itemDetails}
          urgency={updatedRequest.urgency}
          managerComment={updatedRequest.managerComment}
          appUrl={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
        />
      );

      await resend.emails.send({
        from: `Walt Landgoed <${process.env.RESEND_FROM_EMAIL}>`,
        to: ["marco@middelman.co.za"],
        subject: `FOR PROCUREMENT: ${updatedRequest.requestedBy} - ${updatedRequest.category}`,
        html: accountsEmailHtml,
      });

      console.log(`[RESEND] Dispatched approval and accounts emails for Request: ${id}`);
    } catch (error) {
      console.error("[RESEND] Failed to send approval emails", error);
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
  
  if (updatedRequest && resend && process.env.RESEND_FROM_EMAIL) {
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
