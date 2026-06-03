"use server";

import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addSupplier(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();

    if (!name) {
      return { error: "Supplier name is required." };
    }

    // Check if supplier already exists
    const existing = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.name, name))
      .limit(1);

    if (existing.length > 0) {
      return { error: "A supplier with this name already exists." };
    }

    await db.insert(suppliers).values({ name });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[addSupplier] Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function deleteSupplier(id: string) {
  try {
    const existing = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    
    if (existing.length === 0) {
      return { error: "Supplier not found." };
    }

    if (existing[0].name === "Unsure (To be confirmed)") {
      return { error: "This supplier is fixed and cannot be deleted." };
    }

    await db.delete(suppliers).where(eq(suppliers.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[deleteSupplier] Error:", error);
    return { error: "Failed to delete supplier. It may be in use." };
  }
}
