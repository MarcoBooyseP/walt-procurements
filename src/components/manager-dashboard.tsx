"use client";

import { useState } from "react";
import Link from "next/link";
import { RequestForm } from "./request-form";
import { FilterableRequestsTable } from "./filterable-requests-table";
import { markPickedUp } from "@/actions/request";

type Location = { id: string; name: string };
type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

type Tab = "inbox" | "new_request";

export function ManagerDashboard({
  requests,
  userName,
  userId,
  userRole,
  userLocationName,
  locations,
  categories,
  suppliers,
  myReadyRequests = [],
}: {
  requests: any[];
  userName: string;
  userId: string;
  userRole: string;
  userLocationName: string;
  locations: Location[];
  categories: Category[];
  suppliers: Supplier[];
  myReadyRequests?: any[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleMarkPickedUp = async (id: string) => {
    setLoadingId(id);
    try {
      await markPickedUp(id);
    } catch (e: any) {
      alert(e.message || "Failed to mark as picked up");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pt-4">
      <div className="flex bg-gray-100 p-1 rounded-2xl w-full">
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
            activeTab === "inbox"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Inbox ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab("new_request")}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
            activeTab === "new_request"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          New Request
        </button>
      </div>

      {activeTab === "inbox" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pending Approvals</h2>
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-gray-900 font-semibold">No requests</h3>
              <p className="text-gray-500 text-sm mt-1">There are no requests waiting for your approval.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map(req => (
                <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col truncate pr-4">
                    <span className="font-semibold text-gray-900 truncate">{req.category}</span>
                    <span className="text-sm text-gray-600 truncate">{req.itemDetails}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {req.requestedBy} • {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link 
                    href={`/manager/review/${req.id}`}
                    className="px-4 py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red/90 transition-colors whitespace-nowrap shadow-sm"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* My Orders Ready for Pickup */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">My Orders Ready to Collect</h2>
            {myReadyRequests.length === 0 ? (
              <div className="text-center py-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-gray-900 font-semibold text-sm">No items</h3>
                <p className="text-gray-500 text-xs mt-1">You have no personal orders waiting to be picked up.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myReadyRequests.map(req => (
                  <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col truncate pr-4">
                      <span className="font-semibold text-gray-900 truncate">{req.category}</span>
                      <span className="text-sm text-gray-600 truncate">{req.itemDetails}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {req.requestedBy} • {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button 
                      disabled={loadingId === req.id}
                      onClick={() => handleMarkPickedUp(req.id)}
                      className="px-4 py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red/90 transition-colors whitespace-nowrap shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {loadingId === req.id ? "Saving..." : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Received
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "new_request" && (
        <div className="max-w-lg mx-auto w-full">
          <RequestForm 
            userName={userName}
            userId={userId}
            userRole={userRole}
            userLocationName={userLocationName}
            locations={locations}
            categories={categories}
            suppliers={suppliers}
          />
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <Link 
          href="/requests" 
          className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Track requests and approvals
        </Link>
      </div>
    </div>
  );
}
