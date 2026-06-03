"use client";

import { useState, useRef, useTransition } from "react";
import { addSupplier, deleteSupplier } from "./supplier-actions";

type Supplier = {
  id: string;
  name: string;
};

export function SupplierManager({ suppliers }: { suppliers: Supplier[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);

    startTransition(async () => {
      const result = await addSupplier(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsModalOpen(false);
        formRef.current?.reset();
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteSupplier(id);
      setDeletingId(null);
    });
  };

  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Suppliers</h2>
        <button
          onClick={() => { setIsModalOpen(true); setError(null); }}
          className="bg-brand-red hover:bg-[#8c1e24] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Supplier
        </button>
      </div>

      {/* Suppliers List */}
      {suppliers.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500">No suppliers added yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Supplier Name</th>
                <th className="px-6 py-4 font-semibold w-16"></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((sup) => (
                <tr key={sup.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{sup.name}</td>
                  <td className="px-6 py-4">
                    {sup.name !== "Unsure (To be confirmed)" && (
                      <button
                        onClick={() => handleDelete(sup.id)}
                        disabled={deletingId === sup.id || isPending}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Remove supplier"
                      >
                        {deletingId === sup.id ? (
                          <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin inline-block"></span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-[32px]">
              <h3 className="text-lg font-bold text-gray-900">Add New Supplier</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 text-center animate-pulse">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Supplier Name</label>
                <input
                  name="name"
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder="e.g. AgriCorp"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-3 bg-brand-red hover:bg-[#8c1e24] text-white font-medium rounded-xl shadow-lg shadow-brand-red/20 hover:shadow-brand-red/30 transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  {isPending ? (
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "Add Supplier"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
