"use client";

import { useState, useRef, useTransition } from "react";
import { addUser, deleteUser } from "./actions";

const PROTECTED_ADMIN_EMAIL = "hello@betterisk.co.za";

type AdminUser = {
  id: string;
  name: string;
  surname: string;
  email: string;
  cell: string | null;
  accountantId: string | null;
};

type Accountant = {
  id: string;
  name: string;
  surname: string;
  email: string;
  cell: string | null;
};

export function AdminManager({ 
  admins, 
  availableAccountants 
}: { 
  admins: AdminUser[];
  availableAccountants: Accountant[];
}) {
  // Main modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Accountant combobox state
  const [accountantQuery, setAccountantQuery] = useState("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [selectedAccountantId, setSelectedAccountantId] = useState("");

  // Nested Add Accountant modal state
  const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
  const [nestedError, setNestedError] = useState<string | null>(null);
  const [isNestedPending, startNestedTransition] = useTransition();
  const nestedFormRef = useRef<HTMLFormElement>(null);

  // Filter accountants
  const filteredAccountants = availableAccountants.filter(a =>
    `${a.name} ${a.surname}`.toLowerCase().includes(accountantQuery.toLowerCase())
  );

  const selectedAccountantObj = availableAccountants.find(a => a.id === selectedAccountantId);
  const displayAccountantName = selectedAccountantObj
    ? `${selectedAccountantObj.name} ${selectedAccountantObj.surname}`
    : "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!formRef.current) return;

    if (!selectedAccountantId) {
      setError("Please assign an accountant.");
      return;
    }

    const formData = new FormData(formRef.current);
    formData.set("role", "ADMIN");
    formData.set("accountantId", selectedAccountantId);

    startTransition(async () => {
      const result = await addUser(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsModalOpen(false);
        setAccountantQuery("");
        setSelectedAccountantId("");
        formRef.current?.reset();
      }
    });
  };

  const handleNestedSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNestedError(null);
    if (!nestedFormRef.current) return;

    const formData = new FormData(nestedFormRef.current);
    formData.set("role", "ACCOUNTANT");

    startNestedTransition(async () => {
      const result = await addUser(formData);
      if (result.error) {
        setNestedError(result.error);
      } else if (result.success && result.userId) {
        setSelectedAccountantId(result.userId);
        const newName = formData.get("name") as string;
        const newSurname = formData.get("surname") as string;
        setAccountantQuery(`${newName} ${newSurname}`);
        setIsNestedModalOpen(false);
        nestedFormRef.current?.reset();
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteUser(id);
      setDeletingId(null);
    });
  };

  const openModal = () => {
    setError(null);
    setAccountantQuery("");
    setSelectedAccountantId("");
    setIsModalOpen(true);
  };

  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Admins</h2>
        <button
          onClick={openModal}
          className="bg-brand-red hover:bg-[#8c1e24] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Admin
        </button>
      </div>

      {admins.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500">No admins found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Cell</th>
                <th className="px-6 py-4 font-semibold">Accountant</th>
                <th className="px-6 py-4 font-semibold w-16"></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const isProtected = admin.email === PROTECTED_ADMIN_EMAIL;
                const assignedAccountant = availableAccountants.find(a => a.id === admin.accountantId);
                return (
                  <tr key={admin.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {admin.name} {admin.surname}
                        {isProtected && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                            </svg>
                            Protected
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{admin.email}</td>
                    <td className="px-6 py-4">{admin.cell || "—"}</td>
                    <td className="px-6 py-4">
                      {isProtected ? (
                        <span className="text-xs text-gray-400 italic">N/A</span>
                      ) : assignedAccountant ? (
                        <span className="text-gray-700">{assignedAccountant.name} {assignedAccountant.surname}</span>
                      ) : (
                        <span className="text-xs text-amber-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {!isProtected && (
                        <button
                          onClick={() => handleDelete(admin.id)}
                          disabled={deletingId === admin.id || isPending}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Remove admin"
                        >
                          {deletingId === admin.id ? (
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* LEVEL 1: Add Admin Modal */}
      {isModalOpen && !isNestedModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-visible relative animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-[32px]">
              <h3 className="text-lg font-bold text-gray-900">Add New Admin</h3>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Name</label>
                  <input name="name" required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="John" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Surname</label>
                  <input name="surname" required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
                <input name="email" type="email" required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="admin@waltlandgoed.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Cell Number</label>
                <input name="cell" type="tel" required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="082 123 4567" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Temporary Password</label>
                <input name="password" type="text" required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="Password123" />
              </div>

              {/* Assign Accountant combobox */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-gray-700 ml-1">Assign Accountant</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                    placeholder="Search or add accountant..."
                    value={isComboboxOpen ? accountantQuery : (selectedAccountantId ? displayAccountantName : accountantQuery)}
                    onChange={(e) => {
                      setAccountantQuery(e.target.value);
                      setIsComboboxOpen(true);
                      setSelectedAccountantId("");
                    }}
                    onFocus={() => setIsComboboxOpen(true)}
                    onBlur={() => setTimeout(() => setIsComboboxOpen(false), 200)}
                  />
                  {isComboboxOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      <ul className="py-1">
                        {filteredAccountants.map(a => (
                          <li
                            key={a.id}
                            onClick={() => {
                              setSelectedAccountantId(a.id);
                              setAccountantQuery(`${a.name} ${a.surname}`);
                              setIsComboboxOpen(false);
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            {a.name} {a.surname} <span className="text-gray-400 text-xs ml-1">({a.email})</span>
                          </li>
                        ))}
                        {accountantQuery.trim().length > 0 && !filteredAccountants.find(a => `${a.name} ${a.surname}`.toLowerCase() === accountantQuery.toLowerCase()) && (
                          <li
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsComboboxOpen(false);
                              setIsNestedModalOpen(true);
                            }}
                            className="px-4 py-2 text-sm text-brand-red font-medium hover:bg-red-50 cursor-pointer border-t border-gray-100 flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create new accountant "{accountantQuery}"
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-3 bg-brand-red hover:bg-[#8c1e24] text-white font-medium rounded-xl shadow-lg shadow-brand-red/20 hover:shadow-brand-red/30 transition-all disabled:opacity-70 flex justify-center items-center">
                  {isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEVEL 2: Create New Accountant Modal */}
      {isNestedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 border-2 border-brand-red/20">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-red-50/50 rounded-t-[30px]">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Accountant</h3>
                <p className="text-xs text-gray-500 mt-0.5">Creating accountant for new admin</p>
              </div>
              <button onClick={() => setIsNestedModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>
            </div>

            <form ref={nestedFormRef} onSubmit={handleNestedSubmit} className="p-6 space-y-4">
              {nestedError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 text-center animate-pulse">
                  {nestedError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Name</label>
                  <input name="name" defaultValue={accountantQuery.split(' ')[0] || ''} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="John" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Surname</label>
                  <input name="surname" defaultValue={accountantQuery.split(' ').slice(1).join(' ') || ''} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
                <input name="email" type="email" required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="accountant@waltlandgoed.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Cell Number</label>
                <input name="cell" type="tel" required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="082 123 4567" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Temporary Password</label>
                <input name="password" type="text" required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="Password123" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsNestedModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Back
                </button>
                <button type="submit" disabled={isNestedPending} className="flex-1 px-4 py-3 bg-gray-900 hover:bg-black text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-70 flex justify-center items-center">
                  {isNestedPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Create Accountant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
