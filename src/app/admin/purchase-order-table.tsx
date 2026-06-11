"use client";

import { useState, useRef, useTransition } from "react";
import { addDocumentsToRequest, markOrderPlaced, markReadyForPickup, editRequest, sendToDirectorApproval } from "@/actions/request";
import { EditOrderModal } from "@/components/edit-order-modal";
import { addSupplier } from "@/app/admin/supplier-actions";

export function PurchaseOrderTable({
  requests,
  locations,
  categories,
  suppliers,
}: { 
  requests: any[];
  locations: any[];
  categories: any[];
  suppliers: any[];
}) {
  const [viewingDocsRequest, setViewingDocsRequest] = useState<any | null>(null);
  const [viewingTimelineRequest, setViewingTimelineRequest] = useState<any | null>(null);
  const [editingRequest, setEditingRequest] = useState<any | null>(null);
  const [selectingSupplierForRequest, setSelectingSupplierForRequest] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [requesterFilter, setRequesterFilter] = useState("ALL");
  const [supplierFilter, setSupplierFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isPendingAction, startTransition] = useTransition();

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "ALL" || urgencyFilter !== "ALL" || locationFilter !== "ALL" || requesterFilter !== "ALL" || supplierFilter !== "ALL" || dateFilter !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setUrgencyFilter("ALL");
    setLocationFilter("ALL");
    setRequesterFilter("ALL");
    setSupplierFilter("ALL");
    setDateFilter("");
  };

  const handleAdvanceStatus = (req: any, customAction?: string) => {
    setOpenMenuId(null);
    if (req.status === "AWAITING_PLACEMENT" && req.supplier === "Unsure (To be confirmed)" && !customAction) {
      setSelectingSupplierForRequest(req);
      return;
    }

    startTransition(async () => {
      try {
        if (customAction === "send_to_director") {
          await sendToDirectorApproval(req.id);
        } else if (req.status === "AWAITING_PLACEMENT") {
          await markOrderPlaced(req.id);
        } else if (req.status === "ORDER_PLACED") {
          await markReadyForPickup(req.id);
        }
      } catch (error: any) {
        alert(error.message || "Failed to update status.");
      }
    });
  };

  const uniqueLocations = Array.from(new Set(requests.map(r => r.farmLocation))).filter(Boolean).sort();
  const uniqueRequesters = Array.from(new Set(requests.map(r => r.requestedBy))).filter(Boolean).sort();
  const uniqueSuppliers = Array.from(new Set(requests.map(r => r.supplier))).filter(Boolean).sort();

  const filteredRequests = requests.filter((req) => {
    // Search by requestedBy, farmLocation, or Date (but NOT itemDetails)
    const matchesSearch =
      req.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.farmLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(req.createdAt).toLocaleDateString().includes(searchQuery);
    
    // Filter by status
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    
    // Filter by urgency
    const matchesUrgency = urgencyFilter === "ALL" || req.urgency === urgencyFilter;

    // Filter by location
    const matchesLocation = locationFilter === "ALL" || req.farmLocation === locationFilter;

    // Filter by requester
    const matchesRequester = requesterFilter === "ALL" || req.requestedBy === requesterFilter;

    // Filter by date
    const reqDate = new Date(req.createdAt).toISOString().split('T')[0];
    const matchesDateFilter = !dateFilter || reqDate === dateFilter;

    // Filter by tab
    const matchesTab = activeTab === "ACTIVE" ? req.status !== "COMPLETED" : req.status === "COMPLETED";

    // Filter by supplier
    const matchesSupplier = supplierFilter === "ALL" || req.supplier === supplierFilter;

    return matchesSearch && matchesStatus && matchesUrgency && matchesLocation && matchesRequester && matchesDateFilter && matchesTab && matchesSupplier;
  });

  // Calculate counts for active stages
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
    <div className="bg-white rounded-[32px] shadow-sm p-8 min-h-[60vh] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
          <p className="text-sm text-gray-500 mt-1">Track and manage all requested supplies.</p>
          <div className="flex items-center gap-4 mt-6 border-b border-gray-100">
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === "ACTIVE" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Active
              {activeTab === "ACTIVE" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("COMPLETED")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === "COMPLETED" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Completed
              {activeTab === "COMPLETED" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-t-full"></span>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0 items-center w-full md:w-auto">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 flex-grow md:flex-grow-0"
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
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white max-w-[150px]"
            value={requesterFilter}
            onChange={(e) => setRequesterFilter(e.target.value)}
          >
            <option value="ALL">All Requesters</option>
            {uniqueRequesters.map((reqName: any) => (
              <option key={reqName} value={reqName}>{reqName}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white max-w-[150px]"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="ALL">All Locations</option>
            {uniqueLocations.map((loc: any) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white max-w-[150px]"
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
          >
            <option value="ALL">All Suppliers</option>
            {uniqueSuppliers.map((supp: any) => (
              <option key={supp} value={supp}>{supp}</option>
            ))}
          </select>
          {activeTab === "ACTIVE" && (
            <select
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white max-w-[160px]"
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

      {activeTab === "ACTIVE" && (
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

      <div className="overflow-x-auto rounded-2xl border border-gray-100 min-h-[300px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Requested By</th>
              <th className="px-6 py-4">Item Details</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Urgency</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req, index) => {
                // Open upwards if it's one of the last two rows and not the very first rows
                const dropUp = index >= filteredRequests.length - 2 && index > 1;
                
                return (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {req.requestedBy}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {req.itemDetails}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {req.farmLocation}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      req.urgency === 'Critical' ? 'bg-red-100 text-red-700' :
                      req.urgency === 'High' ? 'bg-orange-100 text-orange-700' :
                      req.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'DENIED' ? 'bg-red-100 text-red-700' :
                      req.status === 'PENDING_DIRECTOR' ? 'bg-blue-100 text-blue-700' :
                      req.status === 'AWAITING_PLACEMENT' ? 'bg-purple-100 text-purple-700' :
                      req.status === 'ORDER_PLACED' ? 'bg-indigo-100 text-indigo-700' :
                      req.status === 'READY_FOR_PICKUP' ? 'bg-teal-100 text-teal-700' :
                      req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status === 'PENDING' ? 'Awaiting manager approval' :
                       req.status === 'PENDING_DIRECTOR' ? 'Awaiting director approval' : 
                       req.status === 'AWAITING_PLACEMENT' ? 'Order waiting for placement' :
                       req.status === 'ORDER_PLACED' ? 'Order placed' :
                       req.status === 'READY_FOR_PICKUP' ? 'Order received' :
                       req.status === 'COMPLETED' ? 'Picked up' :
                       req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[150px]">
                    {req.supplier || "—"}
                  </td>
                  <td className="px-6 py-4 relative">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === req.id ? null : req.id)}
                        className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                    {openMenuId === req.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                        <div className={`absolute right-6 ${dropUp ? 'bottom-10 mb-1' : 'top-10 mt-1'} w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50`}>
                        {req.status === "AWAITING_PLACEMENT" && (
                          <>
                            <button 
                              disabled={isPendingAction}
                              onClick={() => handleAdvanceStatus(req)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                            >
                              <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              Mark Order Placed
                            </button>
                            {!req.directorApprovalDate && (
                              <button 
                                disabled={isPendingAction}
                                onClick={() => handleAdvanceStatus(req, "send_to_director")}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                              >
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                Send to Director for Approval
                              </button>
                            )}
                          </>
                        )}
                        {req.status === "ORDER_PLACED" && (
                          <button 
                            disabled={isPendingAction}
                            onClick={() => handleAdvanceStatus(req)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center disabled:opacity-50"
                          >
                            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                            Mark Order Received
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setOpenMenuId(null);
                            setViewingTimelineRequest(req);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          View Timeline
                        </button>
                        {req.status !== "COMPLETED" && req.status !== "DENIED" && req.status !== "ORDER_PLACED" && req.status !== "READY_FOR_PICKUP" && (
                          <button 
                            onClick={() => {
                              setOpenMenuId(null);
                              setEditingRequest(req);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit Details
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setOpenMenuId(null);
                            setViewingDocsRequest(req);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          View Documents
                        </button>
                      </div>
                      </>
                    )}
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No purchase orders found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {viewingDocsRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Documents</h3>
                <p className="text-sm text-gray-500 mt-1">{viewingDocsRequest.category} Request by {viewingDocsRequest.requestedBy}</p>
              </div>
              <button 
                onClick={() => setViewingDocsRequest(null)}
                className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Attached Documents</h4>
              {viewingDocsRequest.fileUrls && viewingDocsRequest.fileUrls.length > 0 ? (
                <ul className="space-y-2 mb-6">
                  {viewingDocsRequest.fileUrls.map((url: string, index: number) => (
                    <li key={index}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm text-brand-red font-medium">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        Document {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">No documents attached to this request yet.</p>
              )}

              <h4 className="text-sm font-semibold text-gray-900 mb-3">Upload New Document</h4>
              <form action={async (formData) => {
                try {
                  setIsUploading(true);
                  const res = await addDocumentsToRequest(viewingDocsRequest.id, formData);
                  if (res.success) {
                    // Update local state so it shows immediately
                    setViewingDocsRequest({ 
                      ...viewingDocsRequest, 
                      fileUrls: [...(viewingDocsRequest.fileUrls || []), ...res.newUrls] 
                    });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }
                } catch (err) {
                  console.error(err);
                  alert("Failed to upload documents");
                } finally {
                  setIsUploading(false);
                }
              }}>
                <div className="flex flex-col gap-3">
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    name="document" 
                    multiple
                    required
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploading ? "Uploading..." : "Upload Documents"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {viewingTimelineRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Timeline</h3>
                <p className="text-sm text-gray-500 mt-1">{viewingTimelineRequest.category} Request by {viewingTimelineRequest.requestedBy}</p>
              </div>
              <button 
                onClick={() => setViewingTimelineRequest(null)}
                className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Request Created</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-500">{new Date(viewingTimelineRequest.createdAt).toLocaleDateString()}</span>
                </div>
                
                {viewingTimelineRequest.managerApprovalDate && (
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-900">Manager Approved</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-yellow-700">{new Date(viewingTimelineRequest.managerApprovalDate).toLocaleDateString()}</span>
                  </div>
                )}

                {viewingTimelineRequest.directorApprovalDate && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">Director Approved</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-700">{new Date(viewingTimelineRequest.directorApprovalDate).toLocaleDateString()}</span>
                  </div>
                )}

                {viewingTimelineRequest.orderPlacedDate && (
                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-indigo-900">Order Placed</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-indigo-700">{new Date(viewingTimelineRequest.orderPlacedDate).toLocaleDateString()}</span>
                  </div>
                )}

                {viewingTimelineRequest.orderReceivedDate && (
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-purple-900">Order Received</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-purple-700">{new Date(viewingTimelineRequest.orderReceivedDate).toLocaleDateString()}</span>
                  </div>
                )}

                {viewingTimelineRequest.orderPickedUpDate && (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Order Picked Up</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-700">{new Date(viewingTimelineRequest.orderPickedUpDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {selectingSupplierForRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-[32px]">
              <h3 className="text-lg font-bold text-gray-900">Select Supplier</h3>
              <button
                onClick={() => setSelectingSupplierForRequest(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form action={async (formData) => {
              const selectedSupplier = formData.get("supplier") as string;
              const newSupplierName = formData.get("name") as string;
              
              let finalSupplier = selectedSupplier;
              
              try {
                if (selectedSupplier === "NEW" && newSupplierName) {
                  // create new supplier
                  const res = await addSupplier(formData);
                  if (res.error) {
                    alert(res.error);
                    return;
                  }
                  finalSupplier = newSupplierName;
                } else if (!finalSupplier || finalSupplier === "Unsure (To be confirmed)" || finalSupplier === "NEW") {
                  alert("Please select or enter a valid supplier.");
                  return;
                }

                // update request with finalSupplier
                await editRequest(selectingSupplierForRequest.id, {
                  farmLocation: selectingSupplierForRequest.farmLocation,
                  category: selectingSupplierForRequest.category,
                  itemDetails: selectingSupplierForRequest.itemDetails,
                  urgency: selectingSupplierForRequest.urgency,
                  quantity: selectingSupplierForRequest.quantity,
                  supplier: finalSupplier
                });

                // mark as placed
                await markOrderPlaced(selectingSupplierForRequest.id);
                setSelectingSupplierForRequest(null);
              } catch (err: any) {
                alert(err.message || "Something went wrong.");
              }
            }} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Supplier</label>
                <select 
                  name="supplier" 
                  defaultValue=""
                  required
                  onChange={(e) => {
                    const newSupplierDiv = document.getElementById("new-supplier-div");
                    const nameInput = document.getElementById("new-supplier-name-input");
                    if (newSupplierDiv && nameInput) {
                      newSupplierDiv.style.display = e.target.value === "NEW" ? "block" : "none";
                      if (e.target.value === "NEW") {
                        (nameInput as HTMLInputElement).required = true;
                        nameInput.focus();
                      } else {
                        (nameInput as HTMLInputElement).required = false;
                      }
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                >
                  <option value="" disabled>Select a supplier</option>
                  {suppliers.filter(s => s.name !== "Unsure (To be confirmed)").map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                  <option value="NEW">+ Add New Supplier</option>
                </select>
              </div>

              <div id="new-supplier-div" className="space-y-1.5 hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-semibold text-gray-700 ml-1">New Supplier Name</label>
                <input
                  name="name"
                  id="new-supplier-name-input"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder="e.g. AgriCorp"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isPendingAction}
                  className="w-full px-4 py-3 bg-brand-red hover:bg-[#8c1e24] text-white font-medium rounded-xl shadow-lg shadow-brand-red/20 hover:shadow-brand-red/30 transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  Confirm & Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
