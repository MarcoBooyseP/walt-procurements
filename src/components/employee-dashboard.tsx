"use client";

import { useState } from "react";
import Link from "next/link";
import { RequestForm } from "./request-form";
import { markPickedUp, sendBackOrder } from "@/actions/request";

type Location = { id: string; name: string };
type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

type Tab = "inbox" | "new_request";

export function EmployeeDashboard({
  requests,
  userName,
  userId,
  userRole,
  userLocationName,
  locations,
  categories,
  suppliers,
}: {
  requests: any[];
  userName: string;
  userId: string;
  userRole: string;
  userLocationName: string;
  locations: Location[];
  categories: Category[];
  suppliers: Supplier[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [sendBackId, setSendBackId] = useState<string | null>(null);
  const [sendBackReason, setSendBackReason] = useState("");

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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ready for Pickup</h2>
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-gray-900 font-semibold">No items</h3>
              <p className="text-gray-500 text-sm mt-1">You have no items waiting to be picked up.</p>
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
                  <div className="flex flex-col gap-2 shrink-0">
                    <button 
                      disabled={loadingId === req.id || sendBackId === req.id}
                      onClick={() => handleMarkPickedUp(req.id)}
                      className="w-full px-4 py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red/90 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
                    <button 
                      disabled={loadingId === req.id || sendBackId === req.id}
                      onClick={() => { setSendBackId(req.id); setSendBackReason(""); }}
                      className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Send back
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link 
            href="/requests"
            className="mt-2 w-full py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 text-[17px] font-bold rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all flex items-center justify-center"
          >
            Track My Requests
          </Link>
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

      {/* Send Back Dialog */}
      {sendBackId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Send Order Back</h3>
              <p className="text-sm text-gray-500 mb-4">Please provide a reason for sending this order back (e.g. wrong quantity, incorrect color, damaged).</p>
              
              <textarea
                value={sendBackReason}
                onChange={(e) => setSendBackReason(e.target.value)}
                placeholder="Type your reason here..."
                rows={4}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 shadow-sm focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all resize-none"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button
                onClick={() => setSendBackId(null)}
                disabled={loadingId === sendBackId}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!sendBackReason.trim()) return;
                  setLoadingId(sendBackId);
                  try {
                    await sendBackOrder(sendBackId, sendBackReason);
                    setSendBackId(null);
                  } catch (e: any) {
                    alert(e.message || "Failed to send back order");
                  } finally {
                    setLoadingId(null);
                  }
                }}
                disabled={loadingId === sendBackId || !sendBackReason.trim()}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-red hover:bg-brand-red/90 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loadingId === sendBackId ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
