"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { addUser, deleteUser } from "./actions";

type User = {
  id: string;
  name: string;
  surname: string;
  email: string;
  cell: string | null;
  role: string;
};

export function UserManager({ 
  title, 
  role, 
  users, 
  availableManagers,
  availableAccountants
}: { 
  title: string, 
  role: string, 
  users: User[],
  availableManagers?: User[],
  availableAccountants?: User[]
}) {
  // LEVEL 1: Main Form (Employee, Manager, or Accountant)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Dynamic Supervisor Context for Level 1
  const isEmployeeForm = role === "EMPLOYEE";
  const isManagerForm = role === "MANAGER";
  const hasSupervisorCombobox = isEmployeeForm || isManagerForm;
  
  const supervisorRole = isEmployeeForm ? "MANAGER" : "ACCOUNTANT";
  const supervisorTitle = isEmployeeForm ? "Manager" : "Accountant";
  const supervisorIdField = isEmployeeForm ? "managerId" : "accountantId";
  const availableSupervisors = isEmployeeForm ? availableManagers : availableAccountants;

  // Combobox state for Level 1
  const [supervisorQuery, setSupervisorQuery] = useState("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>("");

  // LEVEL 2: Nested Form (Manager for Employee, or Accountant for Manager)
  const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
  const [nestedError, setNestedError] = useState<string | null>(null);
  const [isNestedPending, startNestedTransition] = useTransition();
  const nestedFormRef = useRef<HTMLFormElement>(null);

  // If Level 1 is Employee, Level 2 is Manager. Does Level 2 need a supervisor (Accountant)? Yes.
  const nestedNeedsSupervisor = isEmployeeForm; // If Level 1 is Employee, Level 2 is Manager, which needs an Accountant
  
  // Combobox state for Level 2 (Assigning Accountant to the nested Manager)
  const [nestedSupervisorQuery, setNestedSupervisorQuery] = useState("");
  const [isNestedComboboxOpen, setIsNestedComboboxOpen] = useState(false);
  const [selectedNestedSupervisorId, setSelectedNestedSupervisorId] = useState<string>("");

  // Filter supervisors for Level 1
  const filteredSupervisors = availableSupervisors?.filter(s => 
    `${s.name} ${s.surname}`.toLowerCase().includes(supervisorQuery.toLowerCase())
  ) || [];

  // Filter supervisors for Level 2 (Accountants)
  const filteredNestedSupervisors = availableAccountants?.filter(s => 
    `${s.name} ${s.surname}`.toLowerCase().includes(nestedSupervisorQuery.toLowerCase())
  ) || [];

  // LEVEL 3: Deep Nested Form (Accountant for the nested Manager)
  const [isDeepNestedModalOpen, setIsDeepNestedModalOpen] = useState(false);
  const [deepNestedError, setDeepNestedError] = useState<string | null>(null);
  const [isDeepNestedPending, startDeepNestedTransition] = useTransition();
  const deepNestedFormRef = useRef<HTMLFormElement>(null);

  // --- SUBMIT HANDLERS ---

  const handleMainSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    
    // Validate assignment
    if (hasSupervisorCombobox && !selectedSupervisorId) {
      setError(`Please assign a${isEmployeeForm ? ' ' : 'n '}${supervisorTitle.toLowerCase()}.`);
      return;
    }
    
    // Add supervisorId if it's selected
    if (hasSupervisorCombobox && selectedSupervisorId) {
      formData.set(supervisorIdField, selectedSupervisorId);
    }

    startTransition(async () => {
      const result = await addUser(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsModalOpen(false);
        setSupervisorQuery("");
        setSelectedSupervisorId("");
        formRef.current?.reset();
      }
    });
  };

  const handleNestedSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNestedError(null);
    
    if (!nestedFormRef.current) return;
    const formData = new FormData(nestedFormRef.current);
    formData.set("role", supervisorRole);

    if (nestedNeedsSupervisor && !selectedNestedSupervisorId) {
      setNestedError("Please assign an accountant for this manager.");
      return;
    }

    if (nestedNeedsSupervisor && selectedNestedSupervisorId) {
      formData.set("accountantId", selectedNestedSupervisorId);
    }

    startNestedTransition(async () => {
      const result = await addUser(formData);
      if (result.error) {
        setNestedError(result.error);
      } else if (result.success && result.userId) {
        // Automatically select the new supervisor and go back to Level 1
        setSelectedSupervisorId(result.userId);
        const newName = formData.get("name") as string;
        const newSurname = formData.get("surname") as string;
        setSupervisorQuery(`${newName} ${newSurname}`);
        
        setIsNestedModalOpen(false);
        setNestedSupervisorQuery("");
        setSelectedNestedSupervisorId("");
        nestedFormRef.current?.reset();
      }
    });
  };

  const handleDeepNestedSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDeepNestedError(null);
    
    if (!deepNestedFormRef.current) return;
    const formData = new FormData(deepNestedFormRef.current);
    formData.set("role", "ACCOUNTANT");

    startDeepNestedTransition(async () => {
      const result = await addUser(formData);
      if (result.error) {
        setDeepNestedError(result.error);
      } else if (result.success && result.userId) {
        // Automatically select the new accountant and go back to Level 2
        setSelectedNestedSupervisorId(result.userId);
        const newName = formData.get("name") as string;
        const newSurname = formData.get("surname") as string;
        setNestedSupervisorQuery(`${newName} ${newSurname}`);
        
        setIsDeepNestedModalOpen(false);
        deepNestedFormRef.current?.reset();
      }
    });
  };

  // Names for display in comboboxes
  const displaySupervisorName = availableSupervisors?.find(s => s.id === selectedSupervisorId) 
    ? `${availableSupervisors.find(s => s.id === selectedSupervisorId)?.name} ${availableSupervisors.find(s => s.id === selectedSupervisorId)?.surname}` 
    : "";

  const displayNestedSupervisorName = availableAccountants?.find(s => s.id === selectedNestedSupervisorId)
    ? `${availableAccountants.find(s => s.id === selectedNestedSupervisorId)?.name} ${availableAccountants.find(s => s.id === selectedNestedSupervisorId)?.surname}`
    : "";

  // Reset state if main modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setSupervisorQuery("");
      setSelectedSupervisorId("");
      setIsComboboxOpen(false);
      setIsNestedModalOpen(false);
      setIsDeepNestedModalOpen(false);
    }
  }, [isModalOpen]);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteUser(id);
      setDeletingId(null);
    });
  };

  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-red hover:bg-[#8c1e24] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add {title.slice(0, -1)}
        </button>
      </div>

      {/* Users List Table */}
      {users.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-500">No {title.toLowerCase()} added yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Cell</th>
                {hasSupervisorCombobox && (
                  <th className="px-6 py-4 font-semibold">{supervisorTitle}</th>
                )}
                <th className="px-6 py-4 font-semibold w-16"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {u.name} {u.surname}
                  </td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.cell || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* LEVEL 1: Main Modal */}
      {isModalOpen && !isNestedModalOpen && !isDeepNestedModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-visible relative animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add New {title.slice(0, -1)}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form ref={formRef} onSubmit={handleMainSubmit} className="p-6 space-y-4">
              <input type="hidden" name="role" value={role} />
              
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 text-center animate-pulse">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Name</label>
                  <input
                    name="name"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Surname</label>
                  <input
                    name="surname"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder={`${title.slice(0, -1).toLowerCase()}@waltlandgoed.com`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Cell Number</label>
                <input
                  name="cell"
                  type="tel"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder="082 123 4567"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Temporary Password</label>
                <input
                  name="password"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder="Password123"
                />
              </div>

              {/* Dynamic Supervisor Combobox */}
              {hasSupervisorCombobox && availableSupervisors && (
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Assign {supervisorTitle}</label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                      placeholder={`Search or add ${supervisorTitle.toLowerCase()}...`}
                      value={isComboboxOpen ? supervisorQuery : (selectedSupervisorId ? displaySupervisorName : supervisorQuery)}
                      onChange={(e) => {
                        setSupervisorQuery(e.target.value);
                        setIsComboboxOpen(true);
                        setSelectedSupervisorId("");
                      }}
                      onFocus={() => setIsComboboxOpen(true)}
                      onBlur={() => setTimeout(() => setIsComboboxOpen(false), 200)}
                    />
                    
                    {isComboboxOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        <ul className="py-1">
                          {filteredSupervisors.map(s => (
                            <li 
                              key={s.id}
                              onClick={() => {
                                setSelectedSupervisorId(s.id);
                                setSupervisorQuery(`${s.name} ${s.surname}`);
                                setIsComboboxOpen(false);
                              }}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              {s.name} {s.surname} <span className="text-gray-400 text-xs ml-1">({s.email})</span>
                            </li>
                          ))}
                          
                          {supervisorQuery.trim().length > 0 && !filteredSupervisors.find(s => `${s.name} ${s.surname}`.toLowerCase() === supervisorQuery.toLowerCase()) && (
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
                              Create new {supervisorTitle.toLowerCase()} "{supervisorQuery}"
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
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
                    `Add ${title.slice(0, -1)}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEVEL 2: Nested Add Supervisor Modal */}
      {isNestedModalOpen && !isDeepNestedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-visible relative animate-in fade-in zoom-in-95 duration-200 border-2 border-brand-red/20">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-red-50/50 rounded-t-[30px]">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New {supervisorTitle}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Creating {supervisorTitle.toLowerCase()} for new {title.slice(0, -1).toLowerCase()}</p>
              </div>
              <button
                onClick={() => setIsNestedModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
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
                  <input
                    name="name"
                    defaultValue={supervisorQuery.split(' ')[0] || ''}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Surname</label>
                  <input
                    name="surname"
                    defaultValue={supervisorQuery.split(' ').slice(1).join(' ') || ''}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder={`${supervisorTitle.toLowerCase()}@waltlandgoed.com`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Cell Number</label>
                <input
                  name="cell"
                  type="tel"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder="082 123 4567"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Temporary Password</label>
                <input
                  name="password"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder="Password123"
                />
              </div>

              {/* Combobox for Assigning Accountant to this nested Manager */}
              {nestedNeedsSupervisor && availableAccountants && (
                <div className="space-y-1.5 relative">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Assign Accountant</label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                      placeholder="Search or add accountant..."
                      value={isNestedComboboxOpen ? nestedSupervisorQuery : (selectedNestedSupervisorId ? displayNestedSupervisorName : nestedSupervisorQuery)}
                      onChange={(e) => {
                        setNestedSupervisorQuery(e.target.value);
                        setIsNestedComboboxOpen(true);
                        setSelectedNestedSupervisorId("");
                      }}
                      onFocus={() => setIsNestedComboboxOpen(true)}
                      onBlur={() => setTimeout(() => setIsNestedComboboxOpen(false), 200)}
                    />
                    
                    {isNestedComboboxOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        <ul className="py-1">
                          {filteredNestedSupervisors.map(s => (
                            <li 
                              key={s.id}
                              onClick={() => {
                                setSelectedNestedSupervisorId(s.id);
                                setNestedSupervisorQuery(`${s.name} ${s.surname}`);
                                setIsNestedComboboxOpen(false);
                              }}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              {s.name} {s.surname} <span className="text-gray-400 text-xs ml-1">({s.email})</span>
                            </li>
                          ))}
                          
                          {nestedSupervisorQuery.trim().length > 0 && !filteredNestedSupervisors.find(s => `${s.name} ${s.surname}`.toLowerCase() === nestedSupervisorQuery.toLowerCase()) && (
                            <li 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsNestedComboboxOpen(false);
                                setIsDeepNestedModalOpen(true);
                              }}
                              className="px-4 py-2 text-sm text-brand-red font-medium hover:bg-red-50 cursor-pointer border-t border-gray-100 flex items-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                              Create new accountant "{nestedSupervisorQuery}"
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNestedModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isNestedPending}
                  className="flex-1 px-4 py-3 bg-gray-900 hover:bg-black text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  {isNestedPending ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    `Create ${supervisorTitle}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEVEL 3: Deep Nested Add Accountant Modal */}
      {isDeepNestedModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 border-4 border-gray-900">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Accountant</h3>
                <p className="text-xs text-gray-500 mt-0.5">Creating accountant for new manager</p>
              </div>
              <button
                onClick={() => setIsDeepNestedModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>
            </div>

            <form ref={deepNestedFormRef} onSubmit={handleDeepNestedSubmit} className="p-6 space-y-4">
              {deepNestedError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 text-center animate-pulse">
                  {deepNestedError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Name</label>
                  <input
                    name="name"
                    defaultValue={nestedSupervisorQuery.split(' ')[0] || ''}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Surname</label>
                  <input
                    name="surname"
                    defaultValue={nestedSupervisorQuery.split(' ').slice(1).join(' ') || ''}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder={`accountant@waltlandgoed.com`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Cell Number</label>
                <input
                  name="cell"
                  type="tel"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder="082 123 4567"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Temporary Password</label>
                <input
                  name="password"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900"
                  placeholder="Password123"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeepNestedModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isDeepNestedPending}
                  className="flex-1 px-4 py-3 bg-gray-900 hover:bg-black text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  {isDeepNestedPending ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "Create Accountant"
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
