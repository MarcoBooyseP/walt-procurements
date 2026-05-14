import { db } from "@/db";
import { requests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function AccountsSummaryPage({
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-6 border-b border-gray-50 bg-gray-50/50">
            <h1 className="text-xl font-bold text-brand-gray">Procurement Summary</h1>
            <p className="text-sm text-brand-gray/60 italic">Status: {request.status}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-green-800 uppercase tracking-tight">Approved by Management</p>
            </div>

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
                <label className="text-xs font-bold text-brand-gray/50 uppercase">Details</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-xl text-brand-gray border border-gray-100 leading-relaxed">
                  {request.itemDetails}
                </div>
              </div>

              {request.managerComment && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-brand-gray/50 uppercase mb-1 block">Manager's Instructions</label>
                  <div className="p-4 bg-blue-50 rounded-xl text-blue-900 border border-blue-100 leading-relaxed italic">
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

            <div className="pt-8">
              <p className="text-center text-[11px] text-brand-gray/40">
                This summary is for internal accounts use only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
