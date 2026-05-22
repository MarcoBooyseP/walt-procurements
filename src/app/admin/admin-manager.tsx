"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { addUser, deleteUser, editUser } from "./actions";

const PROTECTED_ADMIN_EMAIL = "hello@betterisk.co.za";

type AdminUser = {
  id: string;
  name: string;
  surname: string;
  email: string;
  cell: string | null;
  locationId?: string | null;
};

export function AdminManager({ 
  admins, 
  locations,
}: { 
  admins: AdminUser[];
  locations?: { id: string, name: string }[];
}) {
  // Main modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Combobox state for Location
  const [locationQuery, setLocationQuery] = useState("");
  const [isLocationComboboxOpen, setIsLocationComboboxOpen] = useState(false);
  const filteredLocations = locations?.filter(l => l.name.toLowerCase().includes(locationQuery.toLowerCase())) || [];

  useEffect(() => {
    if (editingAdmin) {
      const loc = locations?.find(l => l.id === editingAdmin.locationId);
      if (loc) {
        setLocationQuery(loc.name);
      }
    }
  }, [editingAdmin, locations]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    formData.set("role", "ADMIN");

    if (editingAdmin) {
      formData.set("id", editingAdmin.id);
      startTransition(async () => {
        const result = await editUser(formData);
        if (result.error) {
          setError(result.error);
        } else {
          setIsModalOpen(false);
          setEditingAdmin(null);
          formRef.current?.reset();
        }
      });
    } else {
      startTransition(async () => {
        const result = await addUser(formData);
        if (result.error) {
          setError(result.error);
        } else {
          setIsModalOpen(false);
          formRef.current?.reset();
        }
      });
    }
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
    setEditingAdmin(null);
    setLocationQuery("");
    setIsLocationComboboxOpen(false);
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
          <table className="w-full text-sm text-left text-gray-500 table-fixed">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold w-[20%]">Name</th>
                <th className="px-6 py-4 font-semibold w-[25%]">Email</th>
                <th className="px-6 py-4 font-semibold w-[15%]">Cell</th>
                <th className="px-6 py-4 font-semibold w-[15%]">Location</th>
                <th className="px-6 py-4 font-semibold w-[15%]"></th>
                <th className="px-6 py-4 font-semibold w-[10%] min-w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const isProtected = admin.email === PROTECTED_ADMIN_EMAIL;
                return (
                  <tr key={admin.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 truncate" title={`${admin.name} ${admin.surname}`}>
                      <div className="flex items-center gap-2 truncate">
                        <span className="truncate">{admin.name} {admin.surname}</span>
                        {isProtected && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                            </svg>
                            Protected
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate" title={admin.email}>{admin.email}</td>
                    <td className="px-6 py-4 truncate" title={admin.cell || ""}>{admin.cell || "—"}</td>
                    <td className="px-6 py-4 truncate" title={locations?.find(l => l.id === admin.locationId)?.name || ""}>
                      {locations?.find(l => l.id === admin.locationId)?.name || "—"}
                    </td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4">
                      {!isProtected && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingAdmin(admin);
                              setError(null);
                              setIsModalOpen(true);
                            }}
                            disabled={deletingId === admin.id || isPending}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                            title="Edit admin"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                          </button>
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

      {/* LEVEL 1: Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-visible relative animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-[32px]">
              <h3 className="text-lg font-bold text-gray-900">{editingAdmin ? "Edit" : "Add New"} Admin</h3>
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
                  <input name="name" defaultValue={editingAdmin?.name || ""} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="John" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Surname</label>
                  <input name="surname" defaultValue={editingAdmin?.surname || ""} required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
                <input name="email" defaultValue={editingAdmin?.email || ""} type="email" required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="admin@waltlandgoed.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Cell Number</label>
                <input name="cell" defaultValue={editingAdmin?.cell || ""} type="tel" required className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="082 123 4567" />
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-gray-700 ml-1">Location</label>
                <div className="relative">
                  <input
                    name="locationName"
                    type="text"
                    required
                    autoComplete="off"
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      setIsLocationComboboxOpen(true);
                    }}
                    onFocus={() => setIsLocationComboboxOpen(true)}
                    onBlur={() => setTimeout(() => setIsLocationComboboxOpen(false), 200)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                    placeholder="Search or type a new location..."
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  {isLocationComboboxOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      <ul className="py-1">
                        {filteredLocations.map(loc => (
                          <li
                            key={loc.id}
                            onClick={() => {
                              setLocationQuery(loc.name);
                              setIsLocationComboboxOpen(false);
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            {loc.name}
                          </li>
                        ))}
                        {locationQuery.trim().length > 0 && !filteredLocations.find(l => l.name.toLowerCase() === locationQuery.toLowerCase()) && (
                          <li className="px-4 py-2 text-sm text-brand-red font-medium border-t border-gray-100 flex items-center gap-2 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Create new location "{locationQuery}"
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">{editingAdmin ? "New Password (optional)" : "Temporary Password"}</label>
                <input name="password" type="text" required={!editingAdmin} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900" placeholder="Password123" />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="flex-1 px-4 py-3 bg-brand-red hover:bg-[#8c1e24] text-white font-medium rounded-xl shadow-lg shadow-brand-red/20 hover:shadow-brand-red/30 transition-all disabled:opacity-70 flex justify-center items-center">
                  {isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : editingAdmin ? "Save Changes" : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
