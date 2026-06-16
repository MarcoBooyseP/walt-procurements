"use client";

import { useState, useTransition } from "react";
import { editRequest } from "@/actions/request";

type Location = { id: string; name: string };
type Category = { id: string; name: string };
type Supplier = { id: string; name: string };

export function EditOrderModal({
  request,
  locations,
  categories,
  suppliers,
  onClose,
}: {
  request: any;
  locations: Location[];
  categories: Category[];
  suppliers: Supplier[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function action(formData: FormData) {
    const newErrors: Record<string, string> = {};
    const farmLocation = (formData.get("farmLocation") as string) || request.farmLocation;
    const category = (formData.get("category") as string) || request.category;
    const itemDetails = formData.get("itemDetails") as string;
    const urgency = (formData.get("urgency") as string) || request.urgency;
    const quantity = (formData.get("quantity") as string) || request.quantity;
    const supplier = formData.get("supplier") as string;

    if (!farmLocation) newErrors.farmLocation = "Please select a location";
    if (!category) newErrors.category = "Please select a category";
    if (!itemDetails || itemDetails.trim().length < 5) newErrors.itemDetails = "Please provide more details (min 5 chars)";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startTransition(async () => {
      try {
        await editRequest(request.id, {
          farmLocation,
          category,
          itemDetails,
          urgency,
          quantity,
          supplier,
        });
        onClose();
      } catch (error) {
        console.error("Failed to edit request", error);
        alert("Failed to edit request. Please try again.");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col my-4">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Purchase Order</h3>
            <p className="text-sm text-gray-500 mt-1">Update details for request {request.id.slice(0, 8)}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <form action={action} className="flex flex-col gap-4 w-full">
            {/* Farm Location */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="farmLocation" className="font-semibold text-brand-gray text-sm flex items-center gap-1">
                Farm Location <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <select
                  name="farmLocation"
                  id="farmLocation"
                  defaultValue={request.farmLocation}
                  disabled
                  className={`w-full px-3 py-2.5 bg-gray-50 border ${errors.farmLocation ? 'border-brand-red ring-1 ring-brand-red' : 'border-gray-200'} rounded-lg text-sm text-brand-gray shadow-sm appearance-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all cursor-not-allowed`}
                >
                  <option value="" disabled></option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-gray">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {errors.farmLocation && <span className="text-brand-red text-xs font-medium">{errors.farmLocation}</span>}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category" className="font-semibold text-brand-gray text-sm flex items-center gap-1">
                Category <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <select
                  name="category"
                  id="category"
                  defaultValue={request.category}
                  disabled
                  className={`w-full px-3 py-2.5 bg-gray-50 border ${errors.category ? 'border-brand-red ring-1 ring-brand-red' : 'border-gray-200'} rounded-lg text-sm text-brand-gray shadow-sm appearance-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all cursor-not-allowed`}
                >
                  <option value="" disabled></option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-gray">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {errors.category && <span className="text-brand-red text-xs font-medium">{errors.category}</span>}
            </div>

            {/* Supplier */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="supplier" className="font-semibold text-brand-gray text-sm flex items-center gap-1">
                Supplier
              </label>
              <div className="relative">
                <select
                  name="supplier"
                  id="supplier"
                  defaultValue={request.supplier || ""}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-brand-gray shadow-sm appearance-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all"
                >
                  <option value="">No preference</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.name}>{sup.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-gray">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="itemDetails" className="font-semibold text-brand-gray text-sm flex items-center gap-1">
                Item details and reason <span className="text-brand-red">*</span>
              </label>
              <textarea
                name="itemDetails"
                id="itemDetails"
                rows={3}
                defaultValue={request.itemDetails}
                className={`w-full px-3 py-2.5 bg-white border ${errors.itemDetails ? 'border-brand-red ring-1 ring-brand-red' : 'border-gray-200'} rounded-lg text-sm text-brand-gray shadow-sm focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all resize-none`}
              ></textarea>
              {errors.itemDetails && <span className="text-brand-red text-xs font-medium">{errors.itemDetails}</span>}
            </div>

            {/* Quantity and Urgency */}
            <div className="flex flex-row gap-4">
              {/* Quantity */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label htmlFor="quantity" className="font-semibold text-brand-gray text-sm flex items-center gap-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  defaultValue={request.quantity || "1"}
                  min="1"
                  disabled
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-brand-gray shadow-sm focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all cursor-not-allowed"
                />
              </div>

              {/* Urgency */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label htmlFor="urgency" className="font-semibold text-brand-gray text-sm flex items-center gap-1">
                  Urgency
                </label>
                <div className="relative">
                  <select
                    name="urgency"
                    id="urgency"
                    defaultValue={request.urgency || "Low"}
                    disabled
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-brand-gray shadow-sm appearance-none focus:ring-2 focus:ring-brand-red focus:border-brand-red transition-all cursor-not-allowed"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-gray">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3 justify-end border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg bg-brand-red text-white text-sm font-semibold shadow-md hover:bg-brand-red/90 disabled:opacity-70 transition-colors flex items-center"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
