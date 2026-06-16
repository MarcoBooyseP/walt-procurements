"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserManager } from "./user-manager";
import { LocationManager } from "./location-manager";
import { AdminManager } from "./admin-manager";
import { CategoryManager } from "./category-manager";
import { SupplierManager } from "./supplier-manager";
import { PurchaseOrderTable } from "./purchase-order-table";
import { AnalyticsDashboard } from "./analytics-dashboard";

type Tab = "overview" | "analytics" | "settings";

export function AdminClient({
  employeesData,
  managersData,
  directorsData,
  adminsData,
  locationsData,
  categoriesData,
  requestsData,
  suppliersData,
}: {
  employeesData: any[];
  managersData: any[];
  directorsData: any[];
  adminsData: any[];
  locationsData: any[];
  categoriesData: any[];
  requestsData: any[];
  suppliersData: any[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-48 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
              activeTab === "overview"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Overview
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
              activeTab === "analytics"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
              activeTab === "settings"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-brand-red hover:text-red-800 transition-colors gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === "overview" && (
            <PurchaseOrderTable 
              requests={requestsData} 
              locations={locationsData}
              categories={categoriesData}
              suppliers={suppliersData}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsDashboard requests={requestsData} />
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-[32px] shadow-sm p-8 flex flex-col gap-6">
              <div className="border-b border-gray-100 pb-4 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Manage users, locations, and categories.</p>
              </div>

              <UserManager 
                title="Employees" 
                role="EMPLOYEE" 
                users={employeesData} 
                availableManagers={managersData}
                locations={locationsData}
              />
              <UserManager 
                title="Managers" 
                role="MANAGER" 
                users={managersData} 
                locations={locationsData}
              />
              <UserManager 
                title="Directors" 
                role="DIRECTOR" 
                users={directorsData} 
                locations={locationsData}
              />
              <AdminManager 
                admins={adminsData} 
                locations={locationsData}
              />
              <LocationManager locations={locationsData} />
              <CategoryManager categories={categoriesData} />
              <SupplierManager suppliers={suppliersData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
