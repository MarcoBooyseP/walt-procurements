"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addCategory(formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();

    if (!name) {
      return { error: "Category name is required." };
    }

    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);

    if (existing.length > 0) {
      return { error: "A category with this name already exists." };
    }

    await db.insert(categories).values({ name });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[addCategory] Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[deleteCategory] Error:", error);
    return { error: "Failed to delete category. It may be in use." };
  }
}
