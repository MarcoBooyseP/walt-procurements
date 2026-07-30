"use client";

import { useState, useTransition } from "react";
import { editRequest } from "@/actions/request";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Location = { id: string; name: string };
type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

type RequestData = {
  id: string;
  farmLocation: string;
  category: string;
  itemDetails: string;
  quantity: string | null;
  urgency: string;
  supplier: string | null;
  requestedBy: string;
};

export function EditRequestForm({ 
  requestData,
  locations,
  categories,
  suppliers
}: { 
  requestData: RequestData;
  locations: Location[];
  categories: Category[];
  suppliers: Supplier[];
}) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  async function action(formData: FormData) {
    const newErrors: Record<string, string> = {};
    const farmLocation = formData.get("farmLocation") as string;
    const category = formData.get("category") as string;
    const itemDetails = formData.get("itemDetails") as string;
    const urgency = formData.get("urgency") as string;
    const quantity = formData.get("quantity") as string;
    const supplier = formData.get("supplier") as string;

    if (!farmLocation) newErrors.farmLocation = "Please select a location";
    if (!category) newErrors.category = "Please select a category";
    if (!itemDetails || itemDetails.trim().length < 5) newErrors.itemDetails = "Please provide more details (min 5 chars)";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    startTransition(async () => {
      try {
        await editRequest(requestData.id, {
          farmLocation,
          category,
          itemDetails,
          urgency,
          quantity: quantity || "1",
          supplier: supplier || "Unsure (To be confirmed)"
        });
        router.push("/requests");
      } catch (error) {
        console.error("Submission failed", error);
        alert("Failed to update request. Please try again.");
      }
    });
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-6 w-full pb-4">
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-brand-gray text-[17px]">Requested By</label>
        <p className="text-[17px] font-bold text-brand-gray px-1">{requestData.requestedBy}</p>
      </div>

      {/* Farm Location */}
      <div className="flex flex-col gap-2">
        <label htmlFor="farmLocation" className="font-semibold text-brand-gray text-[17px] flex items-center gap-1">
          Farm Location <span className="text-brand-red">*</span>
        </label>
        <div className="relative">
          <select
            name="farmLocation"
            id="farmLocation"
            defaultValue={requestData.farmLocation}
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

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="font-semibold text-brand-gray text-[17px] flex items-center gap-1">
          Category <span className="text-brand-red">*</span>
        </label>
        <div className="relative">
          <select
            name="category"
            id="category"
            defaultValue={requestData.category}
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
            defaultValue={requestData.supplier || "Unsure (To be confirmed)"}
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
          defaultValue={requestData.itemDetails}
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
          defaultValue={requestData.quantity || "1"}
          min="1"
          className="w-full p-4 bg-white border border-gray-200 rounded-xl text-[17px] text-brand-gray shadow-sm focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all"
        />
      </div>

      {/* Urgency */}
      <div className="flex flex-col gap-3">
        <label className="font-semibold text-brand-gray text-[17px]">Urgency</label>
        <div className="flex flex-col gap-3">
          <label className="relative flex items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-brand-gray has-[:checked]:border-brand-gray has-[:checked]:bg-gray-50">
            <input type="radio" name="urgency" value="Low" defaultChecked={requestData.urgency === "Low"} className="w-5 h-5 text-brand-gray border-gray-300 focus:ring-brand-gray" />
            <span className="ml-3 text-[17px] font-medium text-brand-gray">Low</span>
            <span className="ml-auto text-sm text-brand-gray/70">Regular restock</span>
          </label>

          <label className="relative flex items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-yellow-500 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50/50">
            <input type="radio" name="urgency" value="Medium" defaultChecked={requestData.urgency === "Medium"} className="w-5 h-5 text-yellow-600 border-gray-300 focus:ring-yellow-500" />
            <span className="ml-3 text-[17px] font-medium text-brand-gray">Medium</span>
            <span className="ml-auto text-sm text-yellow-600 font-medium">Need soon</span>
          </label>

          <label className="relative flex items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors focus-within:ring-2 focus-within:ring-brand-red has-[:checked]:border-brand-red has-[:checked]:bg-red-50/50">
            <input type="radio" name="urgency" value="Critical" defaultChecked={requestData.urgency === "Critical"} className="w-5 h-5 text-brand-red border-gray-300 focus:ring-brand-red" />
            <span className="ml-3 text-[17px] font-bold text-brand-red">Critical</span>
            <span className="ml-auto text-sm text-brand-red font-bold">Need ASAP</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Link
          href="/requests"
          className="flex-1 py-5 px-6 bg-white border-2 border-gray-200 text-gray-700 text-[19px] font-bold rounded-xl shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-all flex items-center justify-center"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-5 px-6 bg-brand-red text-white text-[19px] font-bold rounded-xl shadow-lg hover:bg-brand-red/90 active:bg-brand-red/80 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
