"use client";

import { useState } from "react";
import Link from "next/link";
import { RequestForm } from "./request-form";

type Location = { id: string; name: string };
type Category = { id: string; name: string };

type Tab = "inbox" | "new_request";

export function DirectorDashboard({
  requests,
  userName,
  userId,
  userRole,
  userLocationName,
  locations,
  categories,
}: {
  requests: any[];
  userName: string;
  userId: string;
  userRole: string;
  userLocationName: string;
  locations: Location[];
  categories: Category[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("inbox");

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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Final Approvals Needed</h2>
          </div>
          
          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">You're all caught up!</h3>
              <p className="text-gray-500 mt-1">There are no pending requests waiting for final approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">{req.category}</h3>
                    </div>
                    <span className={`self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      req.urgency === 'Critical' ? 'bg-red-100 text-red-700' :
                      req.urgency === 'High' ? 'bg-orange-100 text-orange-700' :
                      req.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {req.urgency} Urgency
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Requested By</span>
                      <p className="text-gray-900 font-medium">{req.requestedBy}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Location</span>
                      <p className="text-gray-900 font-medium">{req.farmLocation}</p>
                    </div>
                  </div>

                  <Link 
                    href={`/director/review/${req.id}`}
                    className="w-full flex justify-center items-center py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl shadow-sm transition-colors"
                  >
                    Review Request
                  </Link>
                </div>
              ))}
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
      )}

      {activeTab === "new_request" && (
        <RequestForm 
          userName={userName}
          userId={userId}
          userRole={userRole}
          userLocationName={userLocationName}
          locations={locations}
          categories={categories}
        />
      )}
    </div>
  );
}
