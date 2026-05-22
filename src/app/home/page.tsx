import { RequestForm } from "@/components/request-form";
import { ManagerDashboard } from "@/components/manager-dashboard";
import { DirectorDashboard } from "@/components/director-dashboard";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/auth";
import Link from "next/link";
import { db } from "@/db";
import { users, locations, categories, requests } from "@/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  const sessionUser = session?.user as any;
  const isAdmin = sessionUser?.role === "ADMIN";

  // Fetch full user record for name and role
  const [dbUser] = sessionUser?.id
    ? await db.select({ id: users.id, name: users.name, surname: users.surname, role: users.role, locationId: users.locationId })
        .from(users).where(eq(users.id, sessionUser.id)).limit(1)
    : [null];

  if (dbUser?.role === "ADMIN") {
    redirect("/admin");
  }

  const locationsList = await db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .orderBy(asc(locations.name));

  const categoriesList = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.name));

  const userLocationName = locationsList.find(l => l.id === dbUser?.locationId)?.name || "";

  let pendingRequests: any[] = [];
  if (dbUser?.role === "MANAGER") {
    pendingRequests = await db
      .select({
        id: requests.id,
        requestedBy: requests.requestedBy,
        submittedByUserId: requests.submittedByUserId,
        farmLocation: requests.farmLocation,
        category: requests.category,
        itemDetails: requests.itemDetails,
        urgency: requests.urgency,
        quantity: requests.quantity,
        status: requests.status,
        createdAt: requests.createdAt
      })
      .from(requests)
      .innerJoin(users, eq(requests.submittedByUserId, users.id))
      .where(
        and(
          eq(requests.status, "PENDING"),
          eq(users.managerId, dbUser.id)
        )
      )
      .orderBy(desc(requests.createdAt));
  } else if (dbUser?.role === "DIRECTOR") {
    pendingRequests = await db
      .select()
      .from(requests)
      .where(eq(requests.status, "PENDING_DIRECTOR"))
      .orderBy(desc(requests.createdAt));
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center pb-10">
      <div className="w-full max-w-lg mx-auto bg-white min-h-screen shadow-2xl sm:min-h-0 sm:mt-10 sm:rounded-[32px] sm:overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <header className="bg-brand-red text-white px-6 py-8 sm:px-8 text-center rounded-b-3xl sm:rounded-none sm:rounded-t-[32px] shadow-md z-10 relative">
          <img 
            src="/images/walt_logo_white.png" 
            alt="Walt Landgoed Logo" 
            className="h-14 mx-auto object-contain relative z-10 mb-3"
          />
          <p className="text-white/90 font-medium text-[17px] relative z-10">Field Supply Request</p>
        </header>

        {/* Form Container */}
        <div className="flex-1 px-5 py-8 sm:p-8 bg-gray-50/50 flex flex-col">
          {dbUser?.role === "EMPLOYEE" ? (
            <RequestForm 
              userName={dbUser ? `${dbUser.name} ${dbUser.surname}` : ""}
              userId={dbUser?.id ?? ""}
              userRole={dbUser?.role ?? "USER"}
              userLocationName={userLocationName}
              locations={locationsList}
              categories={categoriesList}
            />
          ) : dbUser?.role === "MANAGER" ? (
            <ManagerDashboard 
              requests={pendingRequests}
              userName={dbUser ? `${dbUser.name} ${dbUser.surname}` : ""}
              userId={dbUser?.id ?? ""}
              userRole={dbUser?.role ?? "USER"}
              userLocationName={userLocationName}
              locations={locationsList}
              categories={categoriesList}
            />
          ) : dbUser?.role === "DIRECTOR" ? (
            <DirectorDashboard 
              requests={pendingRequests}
              userName={dbUser ? `${dbUser.name} ${dbUser.surname}` : ""}
              userId={dbUser?.id ?? ""}
              userRole={dbUser?.role ?? "USER"}
              userLocationName={userLocationName}
              locations={locationsList}
              categories={categoriesList}
            />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Welcome, {dbUser?.name}</h2>
              <p className="text-gray-500 mt-2 font-medium">You are logged in as a {dbUser?.role}.</p>
              <p className="text-gray-400 text-sm mt-4 max-w-xs">
                Supply requests are initiated by employees. Please use the links provided in your email notifications to review pending requests.
              </p>
            </div>
          )}
        </div>
        
      </div>

      {/* Dedicated Page Footer */}
      <footer className="mt-8 mb-4 text-center text-sm text-gray-500 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-3">
          <SignOutButton />

          {isAdmin && (
            <Link 
              href="/admin"
              className="font-medium text-brand-red hover:text-red-800 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
              </svg>
              Admin Dashboard
            </Link>
          )}
        </div>
        <p>&copy; {new Date().getFullYear()} Walt Landgoed. All rights reserved.</p>
      </footer>
    </main>
  );
}
