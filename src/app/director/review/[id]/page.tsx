import { db } from "@/db";
import { requests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { directorApproveRequest, directorDenyRequest } from "@/actions/request";
import Link from "next/link";

export default async function DirectorReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const request = await db.query.requests.findFirst({
    where: eq(requests.id, id),
  });

  if (!request) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Brand Header */}
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

      <div className="w-full max-w-md px-6 py-8">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-brand-gray/60 hover:text-brand-red transition-colors">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-6 border-b border-gray-50 bg-gray-50/50">
            <h1 className="text-xl font-bold text-brand-gray">Director Final Review</h1>
            <p className="text-sm text-brand-gray/60">ID: {request.id.slice(0, 8)}...</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-brand-gray uppercase tracking-wider">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                request.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                request.status === "PENDING_DIRECTOR" ? "bg-blue-100 text-blue-700" :
                request.status === "APPROVED" ? "bg-green-100 text-green-700" :
                "bg-red-100 text-red-700"
              }`}>
                {request.status === "PENDING_DIRECTOR" ? "PENDING FINAL APPROVAL" : request.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-bold text-brand-gray/50 uppercase">Requested By</label>
                <p className="text-lg font-semibold text-brand-gray">{request.requestedBy}</p>
              </div>
              
              <div>
                <label className="text-xs font-bold text-brand-gray/50 uppercase">Farm Location</label>
                <p className="text-lg font-semibold text-brand-gray">{request.farmLocation}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-gray/50 uppercase">Category</label>
                <p className="text-lg font-semibold text-brand-gray">{request.category}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-gray/50 uppercase">Urgency</label>
                <p className={`text-lg font-bold ${
                  request.urgency === "Critical" ? "text-brand-red" :
                  request.urgency === "Medium" ? "text-yellow-600" :
                  "text-brand-gray"
                }`}>{request.urgency}</p>
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-brand-gray/50 uppercase">Details & Reason</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-xl text-brand-gray border border-gray-100 leading-relaxed">
                  {request.itemDetails}
                </div>
              </div>

              {request.managerComment && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-brand-gray/50 uppercase">Manager Comment</label>
                  <div className="mt-1 p-4 bg-blue-50 rounded-xl text-blue-900 border border-blue-100 leading-relaxed italic">
                    "{request.managerComment}"
                  </div>
                </div>
              )}

              {/* Attachments */}
              {request.fileUrls && request.fileUrls.length > 0 && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-brand-gray/50 uppercase mb-2 block">Attachments ({request.fileUrls.length})</label>
                  <div className="space-y-3">
                    {request.fileUrls.map((url, index) => {
                      const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)/i);
                      return (
                        <div key={index} className="rounded-xl overflow-hidden border border-gray-200">
                          {isImage ? (
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-auto object-cover max-h-64" />
                            </a>
                          ) : (
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-brand-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-brand-gray underline">View Document {index + 1}</span>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {request.status === "PENDING_DIRECTOR" && (
              <div className="pt-4 space-y-6">
                <form action={async (formData: FormData) => {
                  "use server";
                  const comment = formData.get("directorComment") as string;
                  const action = formData.get("action") as string;
                  
                  if (action === "approve") {
                    await directorApproveRequest(request.id, comment);
                  } else {
                    await directorDenyRequest(request.id, comment);
                  }
                }} className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="directorComment" className="text-sm font-bold text-brand-gray uppercase tracking-wider">
                      Director Comment <span className="font-normal text-brand-gray/40">(Optional)</span>
                    </label>
                    <textarea
                      id="directorComment"
                      name="directorComment"
                      rows={3}
                      placeholder="Add any final instructions or reasons for denial here..."
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-brand-gray shadow-sm focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all resize-none"
                    ></textarea>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      type="submit" 
                      name="action" 
                      value="approve"
                      className="w-full py-5 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve Request
                    </button>
                    
                    <button 
                      type="submit" 
                      name="action" 
                      value="deny"
                      className="w-full py-5 bg-brand-red text-white font-bold rounded-xl shadow-md hover:bg-red-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Deny Request
                    </button>
                  </div>
                </form>
              </div>
            )}

            {request.status !== "PENDING_DIRECTOR" && (
              <div className="pt-6 space-y-6">
                {request.directorComment && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-brand-gray/50 uppercase block mb-1">Director Comment</label>
                    <p className="text-brand-gray italic">"{request.directorComment}"</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-brand-gray/50 font-medium italic">
                    {request.status === "PENDING"
                      ? "This request is pending manager review. You cannot review it yet."
                      : `This request has been ${request.status.toLowerCase()}.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-brand-gray/40 font-medium">
          Walt Landgoed Supply Workflow &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
