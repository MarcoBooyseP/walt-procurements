import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, locations, categories, requests, suppliers } from "@/db/schema";
import { inArray, desc, eq } from "drizzle-orm";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const session = await auth();
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/home");
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      cell: users.cell,
      role: users.role,
      locationId: users.locationId,
      managerId: users.managerId,
    })
    .from(users)
    .where(inArray(users.role, ["EMPLOYEE", "MANAGER", "DIRECTOR"]))
    .orderBy(desc(users.createdAt));

  const employeesData = allUsers.filter(u => u.role === "EMPLOYEE");
  const managersData = allUsers.filter(u => u.role === "MANAGER");
  const directorsData = allUsers.filter(u => u.role === "DIRECTOR");

  const adminsData = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      cell: users.cell,
      locationId: users.locationId,
    })
    .from(users)
    .where(eq(users.role, "ADMIN"))
    .orderBy(desc(users.createdAt));

  const locationsData = await db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .orderBy(desc(locations.createdAt));

  const categoriesData = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(desc(categories.createdAt));

  const requestsData = await db
    .select()
    .from(requests)
    .orderBy(desc(requests.createdAt));

  const suppliersData = await db
    .select({ id: suppliers.id, name: suppliers.name })
    .from(suppliers)
    .orderBy(desc(suppliers.createdAt));

  return (
    <AdminClient
      employeesData={employeesData}
      managersData={managersData}
      directorsData={directorsData}
      adminsData={adminsData}
      locationsData={locationsData}
      categoriesData={categoriesData}
      requestsData={requestsData}
      suppliersData={suppliersData}
    />
  );
}
