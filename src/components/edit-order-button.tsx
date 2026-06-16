"use client";

import { useState } from "react";
import { EditOrderModal } from "./edit-order-modal";

export function EditOrderButton({
  request,
  locations,
  categories,
  suppliers,
}: {
  request: any;
  locations: any[];
  categories: any[];
  suppliers: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const isTerminal = request.status === "COMPLETED" || request.status === "DENIED";
  if (isTerminal) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
      >
        <svg className="w-4 h-4 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Details
      </button>

      {isOpen && (
        <EditOrderModal
          request={request}
          locations={locations}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setIsOpen(false)}
          allowQuantityEdit={true}
        />
      )}
    </>
  );
}
