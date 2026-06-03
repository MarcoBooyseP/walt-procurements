"use client";

import { useState, useTransition, useRef } from "react";
import { submitRequest } from "@/actions/request";
import Link from "next/link";

type Location = { id: string; name: string };
type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

export function RequestForm({ 
  userName, 
  userId, 
  userRole,
  userLocationName,
  locations,
  categories,
  suppliers
}: { 
  userName: string; 
  userId: string; 
  userRole: string;
  userLocationName: string;
  locations: Location[];
  categories: Category[];
  suppliers: Supplier[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Limit to 3 files total
      setSelectedFiles((prev) => {
        const updated = [...prev, ...newFiles].slice(0, 3);
        return updated;
      });
      // Reset input value to allow re-selecting same files if removed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function action(formData: FormData) {
    // Basic validation
    const newErrors: Record<string, string> = {};
    const farmLocation = formData.get("farmLocation") as string;
    const category = formData.get("category") as string;
    const itemDetails = formData.get("itemDetails") as string;

    if (!farmLocation) newErrors.farmLocation = "Please select a location";
    if (!category) newErrors.category = "Please select a category";
    if (!itemDetails || itemDetails.trim().length < 5) newErrors.itemDetails = "Please provide more details (min 5 chars)";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementById(firstError);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setErrors({});

    // Append all selected files to formData
    formData.delete("photoAttachment");
    selectedFiles.forEach((file) => {
      formData.append("photoAttachment", file);
    });

    startTransition(async () => {
      try {
        await submitRequest(formData);
        setIsSuccess(true);
        setSelectedFiles([]);
      } catch (error) {
        console.error("Submission failed", error);
        alert("Failed to submit request. Please try again.");
      }
    });
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-brand-gray mb-2">Request Submitted!</h2>
        <p className="text-brand-gray/80 mb-8 max-w-xs">Your supply request has been successfully sent to the manager for review.</p>
        <button
          onClick={() => setIsSuccess(false)}
          className="px-6 py-4 bg-brand-red text-white font-semibold text-lg rounded-xl shadow-md hover:bg-brand-red/90 active:bg-brand-red/80 w-full transition-all"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-6 w-full pb-4">
      {/* Requested By - auto-populated, read-only */}
      <input type="hidden" name="requestedBy" value={userName} />
      <input type="hidden" name="submittedByUserId" value={userId} />
      <input type="hidden" name="submittedByRole" value={userRole} />
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-brand-gray text-[17px]">Requested By</label>
        <p className="text-[17px] font-bold text-brand-gray px-1">{userName || "—"}</p>
      </div>

      {/* Farm Location */}
      {userRole === "EMPLOYEE" ? (
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-brand-gray text-[17px]">Farm Location</label>
          <input type="hidden" name="farmLocation" value={userLocationName} />
          <p className="text-[17px] font-bold text-brand-gray px-1">{userLocationName || "—"}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor="farmLocation" className="font-semibold text-brand-gray text-[17px] flex items-center gap-1">
            Farm Location <span className="text-brand-red">*</span>
          </label>
          <div className="relative">
            <select
              name="farmLocation"
              id="farmLocation"
              defaultValue=""
              className={`w-full p-4 bg-white border ${errors.farmLocation ? 'border-brand-red ring-1 ring-brand-red' : 'border-gray-200'} rounded-xl text-[17px] text-brand-gray shadow-sm appearance-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all`}
            >
              <option value="" disabled></option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-gray">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          {errors.farmLocation && <span className="text-brand-red text-sm font-medium animate-in fade-in slide-in-from-top-1">{errors.farmLocation}</span>}
        </div>
      )}

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="font-semibold text-brand-gray text-[17px] flex items-center gap-1">
          Category <span className="text-brand-red">*</span>
        </label>
        <div className="relative">
          <select
            name="category"
            id="category"
            defaultValue=""
            className={`w-full p-4 bg-white border ${errors.category ? 'border-brand-red ring-1 ring-brand-red' : 'border-gray-200'} rounded-xl text-[17px] text-brand-gray shadow-sm appearance-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all`}
          >
            <option value="" disabled></option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-gray">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        {errors.category && <span className="text-brand-red text-sm font-medium animate-in fade-in slide-in-from-top-1">{errors.category}</span>}
      </div>

      {/* Supplier */}
      <div className="flex flex-col gap-2">
        <label htmlFor="supplier" className="font-semibold text-brand-gray text-[17px] flex items-center gap-1">
          Supplier <span className="text-brand-red">*</span>
        </label>
        <div className="relative">
          <select
            name="supplier"
            id="supplier"
            defaultValue="Unsure (To be confirmed)"
            className="w-full p-4 bg-white border border-gray-200 rounded-xl text-[17px] text-brand-gray shadow-sm appearance-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all"
          >
            <option value="Unsure (To be confirmed)">Unsure (To be confirmed)</option>
            {suppliers?.filter(sup => sup.name !== "Unsure (To be confirmed)").map((sup) => (
              <option key={sup.id} value={sup.name}>
                {sup.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-gray">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Item Details */}
      <div className="flex flex-col gap-2">
        <label htmlFor="itemDetails" className="font-semibold text-brand-gray text-[17px] flex items-center gap-1">
          Item requested details and reason <span className="text-brand-red">*</span>
        </label>
        <textarea
          name="itemDetails"
          id="itemDetails"
          rows={3}
          placeholder="E.g. bags of starter feed because the silo is almost empty"
          className={`w-full p-4 bg-white border ${errors.itemDetails ? 'border-brand-red ring-1 ring-brand-red' : 'border-gray-200'} rounded-xl text-[17px] text-brand-gray shadow-sm focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all resize-none`}
        ></textarea>
        {errors.itemDetails && <span className="text-brand-red text-sm font-medium animate-in fade-in slide-in-from-top-1">{errors.itemDetails}</span>}
      </div>

      {/* Quantity */}
      <div className="flex flex-col gap-2">
        <label htmlFor="quantity" className="font-semibold text-brand-gray text-[17px] flex items-center gap-1">
          Quantity <span className="font-normal text-brand-gray/60">(Optional)</span>
        </label>
        <input
          type="number"
          name="quantity"
          id="quantity"
          defaultValue="1"
          min="1"
          className="w-full p-4 bg-white border border-gray-200 rounded-xl text-[17px] text-brand-gray shadow-sm focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all"
        />
      </div>

      {/* Urgency */}
      <div className="flex flex-col gap-3">
        <label className="font-semibold text-brand-gray text-[17px]">Urgency</label>
        <div className="flex flex-col gap-3">
          <label className="relative flex items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-brand-gray has-[:checked]:border-brand-gray has-[:checked]:bg-gray-50">
            <input type="radio" name="urgency" value="Low" defaultChecked className="w-5 h-5 text-brand-gray border-gray-300 focus:ring-brand-gray" />
            <span className="ml-3 text-[17px] font-medium text-brand-gray">Low</span>
            <span className="ml-auto text-sm text-brand-gray/70">Regular restock</span>
          </label>

          <label className="relative flex items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-yellow-500 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50/50">
            <input type="radio" name="urgency" value="Medium" className="w-5 h-5 text-yellow-600 border-gray-300 focus:ring-yellow-500" />
            <span className="ml-3 text-[17px] font-medium text-brand-gray">Medium</span>
            <span className="ml-auto text-sm text-yellow-600 font-medium">Need soon</span>
          </label>

          <label className="relative flex items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-brand-red has-[:checked]:border-brand-red has-[:checked]:bg-red-50/50">
            <input type="radio" name="urgency" value="Critical" className="w-5 h-5 text-brand-red border-gray-300 focus:ring-brand-red" />
            <span className="ml-3 text-[17px] font-bold text-brand-red">Critical</span>
            <span className="ml-auto text-sm text-brand-red font-bold">Need ASAP</span>
          </label>
        </div>
      </div>

      {/* File Attachment */}
      <div className="flex flex-col gap-2 mt-2">
        <label htmlFor="photoAttachment" className="font-semibold text-brand-gray text-[17px]">
          Attach photo or file <span className="font-normal text-brand-gray/60">(Up to 3)</span>
        </label>

        {selectedFiles.length < 3 && (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-brand-red">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-3 text-brand-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="mb-1 text-[15px] text-brand-gray/80 font-medium text-center px-4">
                {selectedFiles.length === 0 ? "Tap to upload a photo or file" : "Tap to add another file"}
              </p>
            </div>
            <input
              type="file"
              name="photoAttachment"
              id="photoAttachment"
              className="sr-only"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </label>
        )}

        {/* File List / Visual Confirmation */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-3 overflow-hidden">
                  <svg className="w-5 h-5 text-brand-gray/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-[14px] text-brand-gray font-medium truncate">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded-full text-brand-red transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      {userRole === "MANAGER" ? (
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="submit"
            name="bypassDirector"
            value="false"
            disabled={isPending}
            className="w-full py-5 px-6 bg-brand-red text-white text-[19px] font-bold rounded-xl shadow-lg hover:bg-brand-red/90 active:bg-brand-red/80 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isPending ? "Submitting..." : "Submit for Director Approval"}
          </button>
          <button
            type="submit"
            name="bypassDirector"
            value="true"
            disabled={isPending}
            className="w-full py-4 px-6 bg-white border-2 border-brand-red text-brand-red text-[17px] font-bold rounded-xl hover:bg-red-50 active:bg-red-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isPending ? "Submitting..." : "Submit and Bypass Director"}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full py-5 px-6 bg-brand-red text-white text-[19px] font-bold rounded-xl shadow-lg hover:bg-brand-red/90 active:bg-brand-red/80 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isPending ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting Request...
            </span>
          ) : "Submit Request"}
        </button>
      )}

      {userRole !== "MANAGER" && userRole !== "DIRECTOR" && (
        <Link 
          href="/requests"
          className="mt-2 w-full py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 text-[17px] font-bold rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all flex items-center justify-center"
        >
          Track My Requests
        </Link>
      )}
    </form>
  );
}
