import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { users, locations, categories } from "@/db/schema";
import { inArray, desc, eq } from "drizzle-orm";
import { UserManager } from "./user-manager";
import { LocationManager } from "./location-manager";
import { AdminManager } from "./admin-manager";
import { CategoryManager } from "./category-manager";

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
    })
    .from(users)
    .where(inArray(users.role, ["EMPLOYEE", "MANAGER", "ACCOUNTANT"]))
    .orderBy(desc(users.createdAt));

  const employeesData = allUsers.filter(u => u.role === "EMPLOYEE");
  const managersData = allUsers.filter(u => u.role === "MANAGER");
  const accountantsData = allUsers.filter(u => u.role === "ACCOUNTANT");

  const adminsData = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      cell: users.cell,
      accountantId: users.accountantId,
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

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-sm p-8 min-h-[60vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <Link href="/home" className="text-sm font-medium text-brand-red hover:text-red-800 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
        
        <UserManager 
          title="Employees" 
          role="EMPLOYEE" 
          users={employeesData} 
          availableManagers={managersData}
          availableAccountants={accountantsData}
        />
        <UserManager 
          title="Managers" 
          role="MANAGER" 
          users={managersData} 
          availableAccountants={accountantsData}
        />
        <UserManager title="Accountants" role="ACCOUNTANT" users={accountantsData} />
        <AdminManager admins={adminsData} availableAccountants={accountantsData} />
        <LocationManager locations={locationsData} />
        <CategoryManager categories={categoriesData} />
      </div>
    </main>
  );
}
