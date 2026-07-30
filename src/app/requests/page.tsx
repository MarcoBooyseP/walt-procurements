import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requests } from "@/db/schema";
import { eq, desc, ne, and } from "drizzle-orm";
import { users } from "@/db/schema";
import Link from "next/link";
import Image from "next/image";
import { markPickedUp } from "@/actions/request";
import { revalidatePath } from "next/cache";
import { FilterableRequestsTable } from "@/components/filterable-requests-table";
import { AnalyticsDashboard } from "@/app/admin/analytics-dashboard";

export default async function RequestsTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tab } = await searchParams;
  const isAnalytics = tab === "analytics";

  const session = await auth();
  const sessionUser = session?.user as any;

  if (!sessionUser?.id) {
    redirect("/auth/signin");
  }

  const [dbUser] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .limit(1);

  let myRequests: any[] = [];
  let approvedRequests: any[] = [];
  let allRequests: any[] = [];

  if (isAnalytics && (dbUser?.role === "MANAGER" || dbUser?.role === "DIRECTOR")) {
    allRequests = await db.select().from(requests).orderBy(desc(requests.createdAt));
  } else {
    myRequests = await db
      .select()
      .from(requests)
      .where(eq(requests.submittedByUserId, sessionUser.id))
      .orderBy(desc(requests.createdAt));

    if (dbUser?.role === "MANAGER") {
      approvedRequests = await db
        .select({
          id: requests.id,
          requestedBy: requests.requestedBy,
          farmLocation: requests.farmLocation,
          category: requests.category,
          itemDetails: requests.itemDetails,
          quantity: requests.quantity,
          status: requests.status,
          managerApprovalDate: requests.managerApprovalDate,
          directorApprovalDate: requests.directorApprovalDate,
          orderPlacedDate: requests.orderPlacedDate,
          orderReceivedDate: requests.orderReceivedDate,
          orderPickedUpDate: requests.orderPickedUpDate,
          createdAt: requests.createdAt
        })
        .from(requests)
        .innerJoin(users, eq(requests.submittedByUserId, users.id))
        .where(eq(users.managerId, sessionUser.id))
        .orderBy(desc(requests.createdAt));
    } else if (dbUser?.role === "DIRECTOR") {
      // For directors, any request that is past the PENDING stage
      // (i.e. PENDING_DIRECTOR, AWAITING_PLACEMENT, ORDER_PLACED, READY_FOR_PICKUP, COMPLETED, or DENIED)
      approvedRequests = await db
        .select()
        .from(requests)
        .where(ne(requests.status, "PENDING"))
        .orderBy(desc(requests.createdAt));
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full bg-[#aa272f] py-8 flex justify-center shadow-md">
        <Link href="/">
          <Image 
            src="/images/walt_logo_white.png" 
            alt="Walt Landgoed" 
            width={180} 
            height={60} 
            priority
          />
        </Link>
      </div>

      <div className="w-full max-w-[100rem] px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAnalytics ? "Analytics Dashboard" : "Request Tracking"}
            </h1>
            <p className="text-gray-500 mt-1">
              {isAnalytics ? "View system-wide analytics." : "Track the status of your supply requests."}
            </p>
          </div>
          <div className="flex gap-3">
            {(dbUser?.role === "MANAGER" || dbUser?.role === "DIRECTOR") && (
              <Link 
                href={isAnalytics ? "/requests" : "?tab=analytics"} 
                className="px-4 py-2 bg-brand-red text-white font-medium rounded-lg shadow-sm hover:bg-red-800 transition-colors"
              >
                {isAnalytics ? "Back to Requests" : "Analytics"}
              </Link>
            )}
            <Link href="/" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>

        {isAnalytics ? (
          <AnalyticsDashboard requests={allRequests} />
        ) : (
          <>
            {myRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-700">No requests yet</h2>
                <p className="text-gray-500 mt-2">You haven't submitted any supply requests.</p>
                <Link href="/" className="inline-block mt-6 px-6 py-3 bg-[#aa272f] text-white font-bold rounded-xl shadow-md hover:bg-red-800 transition-colors">
                  Submit a Request
                </Link>
              </div>
            ) : (
              <FilterableRequestsTable 
                requests={myRequests} 
                type="MY_REQUESTS" 
                title="My Requests"
                userRole={dbUser?.role}
              />
            )}

            {(dbUser?.role === "MANAGER" || dbUser?.role === "DIRECTOR") && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {dbUser?.role === "DIRECTOR" ? "All Processed Requests" : "Team Requests"}
                </h2>
                <p className="text-gray-500 mb-6">Track requests from {dbUser?.role === "DIRECTOR" ? "everyone" : "your team"} that you have already processed.</p>
                
                {approvedRequests.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-700">No team requests</h2>
                    <p className="text-gray-500 mt-2">You haven't processed any requests from your team yet.</p>
                  </div>
                ) : (
                  <FilterableRequestsTable 
                    requests={approvedRequests} 
                    type="TEAM_REQUESTS" 
                    userRole={dbUser?.role}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
