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

export default async function RequestsTrackingPage() {
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

  const myRequests = await db
    .select()
    .from(requests)
    .where(eq(requests.submittedByUserId, sessionUser.id))
    .orderBy(desc(requests.createdAt));

  let approvedRequests: any[] = [];
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
      .where(
        and(
          eq(users.managerId, sessionUser.id),
          ne(requests.status, "PENDING")
        )
      )
      .orderBy(desc(requests.createdAt));
  } else if (dbUser?.role === "DIRECTOR") {
    // For directors, any request that is past the PENDING and PENDING_DIRECTOR stages
    // (i.e. AWAITING_PLACEMENT, ORDER_PLACED, READY_FOR_PICKUP, COMPLETED, or DENIED)
    approvedRequests = await db
      .select()
      .from(requests)
      .where(
        and(
          ne(requests.status, "PENDING"),
          ne(requests.status, "PENDING_DIRECTOR")
        )
      )
      .orderBy(desc(requests.createdAt));
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

      <div className="w-full max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
            <p className="text-gray-500 mt-1">Track the status of your supply requests.</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            Back to Home
          </Link>
        </div>

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
          <div className="space-y-4">
            {myRequests.map((req) => {
              const dateObj = new Date(req.createdAt);
              const dateStr = dateObj.toLocaleDateString();
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              let statusDisplay = req.status;
              let statusColor = "bg-gray-100 text-gray-700";

              switch (req.status) {
                case "PENDING":
                  statusDisplay = "Awaiting manager approval";
                  statusColor = "bg-yellow-100 text-yellow-800";
                  break;
                case "PENDING_DIRECTOR":
                  statusDisplay = "Awaiting director approval";
                  statusColor = "bg-blue-100 text-blue-800";
                  break;
                case "AWAITING_PLACEMENT":
                  statusDisplay = "Order waiting for placement";
                  statusColor = "bg-purple-100 text-purple-800";
                  break;
                case "ORDER_PLACED":
                  statusDisplay = "Order placed";
                  statusColor = "bg-indigo-100 text-indigo-800";
                  break;
                case "READY_FOR_PICKUP":
                  statusDisplay = "Order received";
                  statusColor = "bg-teal-100 text-teal-800 border border-teal-200";
                  break;
                case "COMPLETED":
                  statusDisplay = "Picked up";
                  statusColor = "bg-green-100 text-green-800";
                  break;
                case "APPROVED":
                  statusDisplay = "Approved";
                  statusColor = "bg-emerald-100 text-emerald-800";
                  break;
                case "DENIED":
                  statusDisplay = "Denied";
                  statusColor = "bg-red-100 text-red-800";
                  break;
              }

              return (
                <div key={req.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{req.category}</h3>
                      <p className="text-sm text-gray-500 mt-1">Submitted on {dateStr} at {timeStr}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}`}>
                      {statusDisplay}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Farm Location</span>
                      <p className="text-gray-900 font-medium">{req.farmLocation}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Quantity</span>
                      <p className="text-gray-900 font-medium">{req.quantity || "1"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Details</span>
                      <p className="text-gray-700 mt-1">{req.itemDetails}</p>
                    </div>
                  </div>

                  {/* TIMELINE */}
                  {(req.managerApprovalDate || req.directorApprovalDate || req.orderPlacedDate || req.orderReceivedDate || req.orderPickedUpDate) && (
                    <div className="mt-6 border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Timeline</h4>
                      <div className="flex flex-col gap-2">
                        {req.managerApprovalDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Manager Approved:</span>
                            <span className="font-medium text-gray-900">{new Date(req.managerApprovalDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {req.directorApprovalDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Director Approved:</span>
                            <span className="font-medium text-gray-900">{new Date(req.directorApprovalDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {req.orderPlacedDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Order Placed:</span>
                            <span className="font-medium text-gray-900">{new Date(req.orderPlacedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {req.orderReceivedDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Order Received:</span>
                            <span className="font-medium text-gray-900">{new Date(req.orderReceivedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {req.orderPickedUpDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Picked Up:</span>
                            <span className="font-medium text-gray-900">{new Date(req.orderPickedUpDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {req.status === "READY_FOR_PICKUP" && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <form action={async () => {
                        "use server";
                        await markPickedUp(req.id);
                        revalidatePath("/requests");
                      }}>
                        <button 
                          type="submit"
                          className="w-full md:w-auto px-6 py-3 bg-[#aa272f] text-white font-bold rounded-xl shadow-md hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Mark as Picked Up
                        </button>
                        <p className="mt-2 text-xs text-gray-500">Only click this once you have physically received your items.</p>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
              <div className="space-y-4">
                {approvedRequests.map((req) => {
                  const dateObj = new Date(req.createdAt);
                  const dateStr = dateObj.toLocaleDateString();
                  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  let statusDisplay = req.status;
                  let statusColor = "bg-gray-100 text-gray-700";

                  switch (req.status) {
                    case "PENDING_DIRECTOR":
                      statusDisplay = "Awaiting director approval";
                      statusColor = "bg-blue-100 text-blue-800";
                      break;
                    case "AWAITING_PLACEMENT":
                      statusDisplay = "Order waiting for placement";
                      statusColor = "bg-purple-100 text-purple-800";
                      break;
                    case "ORDER_PLACED":
                      statusDisplay = "Order placed";
                      statusColor = "bg-indigo-100 text-indigo-800";
                      break;
                    case "READY_FOR_PICKUP":
                      statusDisplay = "Order received";
                      statusColor = "bg-teal-100 text-teal-800 border border-teal-200";
                      break;
                    case "COMPLETED":
                      statusDisplay = "Picked up";
                      statusColor = "bg-green-100 text-green-800";
                      break;
                    case "DENIED":
                      statusDisplay = "Denied";
                      statusColor = "bg-red-100 text-red-800";
                      break;
                  }

                  return (
                    <div key={req.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                              {req.requestedBy}
                            </span>
                            <span className="text-sm text-gray-500">Submitted on {dateStr} at {timeStr}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{req.category}</h3>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}`}>
                          {statusDisplay}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase">Farm Location</span>
                          <p className="text-gray-900 font-medium">{req.farmLocation}</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase">Quantity</span>
                          <p className="text-gray-900 font-medium">{req.quantity || "1"}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">Details</span>
                          <p className="text-gray-700 mt-1">{req.itemDetails}</p>
                        </div>
                      </div>

                      {/* TIMELINE */}
                      {(req.managerApprovalDate || req.directorApprovalDate || req.orderPlacedDate || req.orderReceivedDate || req.orderPickedUpDate) && (
                        <div className="mt-6 border-t border-gray-100 pt-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">Timeline</h4>
                          <div className="flex flex-col gap-2">
                            {req.managerApprovalDate && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Manager Approved:</span>
                                <span className="font-medium text-gray-900">{new Date(req.managerApprovalDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {req.directorApprovalDate && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Director Approved:</span>
                                <span className="font-medium text-gray-900">{new Date(req.directorApprovalDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {req.orderPlacedDate && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Order Placed:</span>
                                <span className="font-medium text-gray-900">{new Date(req.orderPlacedDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {req.orderReceivedDate && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Order Received:</span>
                                <span className="font-medium text-gray-900">{new Date(req.orderReceivedDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {req.orderPickedUpDate && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Picked Up:</span>
                                <span className="font-medium text-gray-900">{new Date(req.orderPickedUpDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
