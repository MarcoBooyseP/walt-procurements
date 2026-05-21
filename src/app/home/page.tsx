import { RequestForm } from "@/components/request-form";
import { signOut, auth } from "@/auth";
import Link from "next/link";
import { db } from "@/db";
import { users, locations, categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export default async function HomePage() {
  const session = await auth();
  const sessionUser = session?.user as any;
  const isAdmin = sessionUser?.role === "ADMIN";

  // Fetch full user record for name and role
  const [dbUser] = sessionUser?.id
    ? await db.select({ id: users.id, name: users.name, surname: users.surname, role: users.role })
        .from(users).where(eq(users.id, sessionUser.id)).limit(1)
    : [null];

  const locationsList = await db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .orderBy(asc(locations.name));

  const categoriesList = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.name));

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
          <RequestForm 
            userName={dbUser ? `${dbUser.name} ${dbUser.surname}` : ""}
            userId={dbUser?.id ?? ""}
            userRole={dbUser?.role ?? "USER"}
            locations={locationsList}
            categories={categoriesList}
          />
        </div>
        
      </div>

      {/* Dedicated Page Footer */}
      <footer className="mt-8 mb-4 text-center text-sm text-gray-500 flex flex-col items-center gap-4">
        <div className="flex flex-col gap-3">
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}>
            <button 
              type="submit"
              className="font-medium hover:text-brand-red transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sign Out
            </button>
          </form>

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
