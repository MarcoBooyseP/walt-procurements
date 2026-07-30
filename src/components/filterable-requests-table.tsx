"use client";

import { useState } from "react";
import Link from "next/link";
import { markPickedUp, sendBackOrder } from "@/actions/request";
import { usePathname } from "next/navigation";

export function FilterableRequestsTable({
  requests,
  title,
  subtitle,
  type, // "MY_REQUESTS", "TEAM_REQUESTS", "INBOX"
  userRole,
}: {
  requests: any[];
  title?: string;
  subtitle?: string;
  type: "MY_REQUESTS" | "TEAM_REQUESTS" | "INBOX";
  userRole?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isPendingAction, setIsPendingAction] = useState(false);
  const [sendBackId, setSendBackId] = useState<string | null>(null);
  const [sendBackReason, setSendBackReason] = useState("");
  const pathname = usePathname();
  
  // Use userRole if provided, otherwise fallback to pathname check
  const isDirector = userRole === "DIRECTOR" || pathname?.includes("director");
  const rolePath = isDirector ? "director" : "manager";

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "ALL" || urgencyFilter !== "ALL" || locationFilter !== "ALL" || dateFilter !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setUrgencyFilter("ALL");
    setLocationFilter("ALL");
    setDateFilter("");
  };

  const uniqueLocations = Array.from(new Set(requests.map((r) => r.farmLocation))).filter(Boolean).sort();

  const filteredRequests = requests.filter((req) => {
    const searchString = `${req.requestedBy || ""} ${req.farmLocation || ""} ${req.category || ""} ${req.itemDetails || ""} ${new Date(req.createdAt).toLocaleDateString()}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesUrgency = urgencyFilter === "ALL" || req.urgency === urgencyFilter;
    const matchesLocation = locationFilter === "ALL" || req.farmLocation === locationFilter;
    
    const reqDate = new Date(req.createdAt).toISOString().split("T")[0];
    const matchesDateFilter = !dateFilter || reqDate === dateFilter;

    const matchesTab = activeTab === "ACTIVE" ? req.status !== "COMPLETED" : req.status === "COMPLETED";

    // For INBOX, we might only have active requests anyway, but let's keep the filter
    return matchesSearch && matchesStatus && matchesUrgency && matchesLocation && matchesDateFilter && matchesTab;
  });

  const stageCounts = {
    PENDING: 0,
    PENDING_DIRECTOR: 0,
    AWAITING_PLACEMENT: 0,
    ORDER_PLACED: 0,
    READY_FOR_PICKUP: 0,
  };
  requests.forEach(r => {
    if (stageCounts[r.status as keyof typeof stageCounts] !== undefined) {
      stageCounts[r.status as keyof typeof stageCounts]++;
    }
  });

  const activeStages = [
    { key: "PENDING", label: "Pending Manager", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { key: "PENDING_DIRECTOR", label: "Pending Director", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "AWAITING_PLACEMENT", label: "Awaiting Placement", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { key: "ORDER_PLACED", label: "Order Placed", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { key: "READY_FOR_PICKUP", label: "Ready for Pickup", color: "bg-teal-50 text-teal-700 border-teal-200" },
  ];

  return (
    <div className="w-full flex flex-col">
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-lg font-bold text-gray-900">No requests</h3>
          <p className="text-gray-500 mt-1">There are no requests to show here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4 border-b border-gray-100 mb-2">
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === "ACTIVE" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Active
              {activeTab === "ACTIVE" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full"></span>}
            </button>
            <button
              onClick={() => setActiveTab("COMPLETED")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === "COMPLETED" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Completed
              {activeTab === "COMPLETED" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full"></span>}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 flex-grow max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <input
              type="date"
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <select
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="ALL">All Locations</option>
              {uniqueLocations.map((loc: any) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            {activeTab === "ACTIVE" && (
              <select
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Awaiting manager approval</option>
                <option value="PENDING_DIRECTOR">Awaiting director approval</option>
                <option value="AWAITING_PLACEMENT">Order waiting for placement</option>
                <option value="ORDER_PLACED">Order placed</option>
                <option value="READY_FOR_PICKUP">Order received</option>
              </select>
            )}
            <select
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
            >
              <option value="ALL">All Urgencies</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-brand-red hover:bg-red-50 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === "ACTIVE" && requests.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {activeStages.map((stage) => (
            <button 
              key={stage.key} 
              onClick={() => setStatusFilter(stage.key)}
              className={`rounded-2xl border p-4 flex flex-col justify-center items-center text-center shadow-sm cursor-pointer hover:-translate-y-0.5 transition-all focus:outline-none ${stage.color} ${statusFilter === stage.key ? 'ring-2 ring-gray-900 shadow-md scale-[1.02]' : 'hover:shadow-md'}`}
            >
              <span className="text-2xl font-bold mb-1">{stageCounts[stage.key as keyof typeof stageCounts]}</span>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stage.label}</span>
            </button>
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm min-h-[300px]">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Date</th>
                {type !== "MY_REQUESTS" && <th className="px-6 py-4">Requested By</th>}
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Urgency</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Metric</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((req, index) => {
                const dropUp = index >= filteredRequests.length - 2 && index > 1;
                const dateStr = new Date(req.createdAt).toLocaleDateString();
                let statusDisplay = req.status;
                let statusColor = "bg-gray-100 text-gray-700";

                switch (req.status) {
                  case "PENDING":
                    statusDisplay = "Awaiting manager";
                    statusColor = "bg-yellow-100 text-yellow-800";
                    break;
                  case "PENDING_DIRECTOR":
                    statusDisplay = "Awaiting director";
                    statusColor = "bg-blue-100 text-blue-800";
                    break;
                  case "AWAITING_PLACEMENT":
                    statusDisplay = "Waiting placement";
                    statusColor = "bg-purple-100 text-purple-800";
                    break;
                  case "ORDER_PLACED":
                    statusDisplay = "Placed";
                    statusColor = "bg-indigo-100 text-indigo-800";
                    break;
                  case "READY_FOR_PICKUP":
                    statusDisplay = "Received";
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
                  case "SENT_BACK":
                    statusDisplay = "Sent back";
                    statusColor = "bg-orange-100 text-orange-800";
                    break;
                }

                return (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{dateStr}</td>
                    {type !== "MY_REQUESTS" && <td className="px-6 py-4 font-medium text-gray-900">{req.requestedBy}</td>}
                    <td className="px-6 py-4 font-medium text-gray-900">{req.category}</td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <div className="truncate" title={req.itemDetails}>{req.itemDetails}</div>
                      {req.status === "DENIED" && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800 shadow-sm whitespace-normal break-words">
                          <span className="font-semibold block mb-0.5">Reason for decline:</span>
                          {req.directorComment 
                            ? req.directorComment 
                            : (req.managerComment && !req.managerApprovalDate) 
                              ? req.managerComment 
                              : "No additional reason added"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{req.farmLocation}</td>
                    <td className="px-6 py-4">
                      {req.urgency && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                          req.urgency === 'Critical' ? 'bg-red-100 text-red-700' :
                          req.urgency === 'High' ? 'bg-orange-100 text-orange-700' :
                          req.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {req.urgency}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{req.quantity || "1"}</td>
                    <td className="px-6 py-4">{req.metric || "Units"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {statusDisplay}
                      </span>
                    </td>
                    <td className="px-6 py-4">{req.supplier || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      {type === "INBOX" && (
                        <Link 
                          href={`/${rolePath}/review/${req.id}`}
                          className="inline-flex justify-center items-center py-1.5 px-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors whitespace-nowrap"
                        >
                          Review
                        </Link>
                      )}
                      {(type === "TEAM_REQUESTS" || type === "MY_REQUESTS") && (
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === req.id ? null : req.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                          >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {openMenuId === req.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                              <div className={`absolute right-0 ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50`}>
                                {type === "TEAM_REQUESTS" && (
                                  <Link
                                    href={`/${rolePath}/review/${req.id}`}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {req.status === 'PENDING' || req.status === 'PENDING_DIRECTOR' ? "Review Request" : "View Details"}
                                  </Link>
                                )}
                                {type === "MY_REQUESTS" && req.status === "PENDING" && (
                                  <Link
                                    href={`/requests/${req.id}/edit`}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Request
                                  </Link>
                                )}
                                {type === "MY_REQUESTS" && req.status === "READY_FOR_PICKUP" && (
                                  <>
                                    <button
                                      disabled={isPendingAction}
                                      onClick={async () => {
                                        setIsPendingAction(true);
                                        try {
                                          await markPickedUp(req.id);
                                          setOpenMenuId(null);
                                        } catch (e: any) {
                                          alert(e.message || "Failed to mark as picked up");
                                        } finally {
                                          setIsPendingAction(false);
                                        }
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Mark as Picked Up
                                    </button>
                                    <button
                                      disabled={isPendingAction}
                                      onClick={() => {
                                        setSendBackId(req.id);
                                        setSendBackReason("");
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                      </svg>
                                      Send back
                                    </button>
                                  </>
                                )}
                                {type === "MY_REQUESTS" && req.status !== "READY_FOR_PICKUP" && req.status !== "PENDING" && (
                                  <div className="px-4 py-2.5 text-sm text-gray-400 italic">
                                    No actions available
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                disabled={isPendingAction}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!sendBackReason.trim()) return;
                  setIsPendingAction(true);
                  try {
                    await sendBackOrder(sendBackId, sendBackReason);
                    setSendBackId(null);
                  } catch (e: any) {
                    alert(e.message || "Failed to send back order");
                  } finally {
                    setIsPendingAction(false);
                  }
                }}
                disabled={isPendingAction || !sendBackReason.trim()}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-red hover:bg-brand-red/90 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isPendingAction ? "Sending..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
