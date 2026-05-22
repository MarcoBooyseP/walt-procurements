"use client";

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts';

export function AnalyticsDashboard({ requests }: { requests: any[] }) {
  const data = useMemo(() => {
    // 1. Metric Cards
    const activeRequests = requests.filter(r => r.status !== "COMPLETED" && r.status !== "DENIED");
    const completedRequests = requests.filter(r => r.status === "COMPLETED");
    
    // Calculate average fulfillment time (in days)
    let totalFulfillmentTime = 0;
    let completedCountWithTimes = 0;
    completedRequests.forEach(r => {
      if (r.createdAt && r.orderPickedUpDate) {
        const ms = new Date(r.orderPickedUpDate).getTime() - new Date(r.createdAt).getTime();
        // Skip zero ms to avoid skewing from legacy data backfills
        if (ms > 0) {
          totalFulfillmentTime += ms;
          completedCountWithTimes++;
        }
      }
    });
    const avgFulfillmentDays = completedCountWithTimes > 0 
      ? (totalFulfillmentTime / completedCountWithTimes) / (1000 * 60 * 60 * 24) 
      : 0;

    // 2. Funnel (Status Distribution)
    const funnelMap = {
      "PENDING": 0,
      "PENDING_DIRECTOR": 0,
      "AWAITING_PLACEMENT": 0,
      "ORDER_PLACED": 0,
      "READY_FOR_PICKUP": 0,
    };
    activeRequests.forEach(r => {
      if (funnelMap[r.status as keyof typeof funnelMap] !== undefined) {
        funnelMap[r.status as keyof typeof funnelMap]++;
      }
    });
    const funnelData = [
      { name: 'Pending Manager', count: funnelMap["PENDING"] },
      { name: 'Pending Director', count: funnelMap["PENDING_DIRECTOR"] },
      { name: 'Awaiting Placement', count: funnelMap["AWAITING_PLACEMENT"] },
      { name: 'Order Placed', count: funnelMap["ORDER_PLACED"] },
      { name: 'Ready For Pickup', count: funnelMap["READY_FOR_PICKUP"] },
    ];

    // 3. Stage Durations (Averages in hours)
    const stageSums = {
      managerApproval: { sum: 0, count: 0 },
      directorApproval: { sum: 0, count: 0 },
      adminPlacement: { sum: 0, count: 0 },
      supplierDelivery: { sum: 0, count: 0 },
      pickupTime: { sum: 0, count: 0 },
    };

    requests.forEach(r => {
      const dates = {
        created: r.createdAt ? new Date(r.createdAt).getTime() : 0,
        manager: r.managerApprovalDate ? new Date(r.managerApprovalDate).getTime() : 0,
        director: r.directorApprovalDate ? new Date(r.directorApprovalDate).getTime() : 0,
        placed: r.orderPlacedDate ? new Date(r.orderPlacedDate).getTime() : 0,
        received: r.orderReceivedDate ? new Date(r.orderReceivedDate).getTime() : 0,
        pickedUp: r.orderPickedUpDate ? new Date(r.orderPickedUpDate).getTime() : 0,
      };

      const diff = (end: number, start: number) => end - start;

      if (dates.manager && dates.created && dates.manager > dates.created) {
        stageSums.managerApproval.sum += diff(dates.manager, dates.created);
        stageSums.managerApproval.count++;
      }
      if (dates.director && dates.manager && dates.director > dates.manager) {
        stageSums.directorApproval.sum += diff(dates.director, dates.manager);
        stageSums.directorApproval.count++;
      } else if (dates.director && dates.created && dates.director > dates.created && !dates.manager) {
        // If skipped manager approval
        stageSums.directorApproval.sum += diff(dates.director, dates.created);
        stageSums.directorApproval.count++;
      }

      if (dates.placed && dates.director && dates.placed > dates.director) {
        stageSums.adminPlacement.sum += diff(dates.placed, dates.director);
        stageSums.adminPlacement.count++;
      } else if (dates.placed && dates.created && dates.placed > dates.created && !dates.director) {
        stageSums.adminPlacement.sum += diff(dates.placed, dates.created);
        stageSums.adminPlacement.count++;
      }

      if (dates.received && dates.placed && dates.received > dates.placed) {
        stageSums.supplierDelivery.sum += diff(dates.received, dates.placed);
        stageSums.supplierDelivery.count++;
      }
      if (dates.pickedUp && dates.received && dates.pickedUp > dates.received) {
        stageSums.pickupTime.sum += diff(dates.pickedUp, dates.received);
        stageSums.pickupTime.count++;
      }
    });

    const getAvgHours = (stage: {sum: number, count: number}) => 
      stage.count > 0 ? (stage.sum / stage.count) / (1000 * 60 * 60) : 0;

    const durationData = [
      { name: 'Wait for Manager', hours: getAvgHours(stageSums.managerApproval) },
      { name: 'Wait for Director', hours: getAvgHours(stageSums.directorApproval) },
      { name: 'Wait for Placement', hours: getAvgHours(stageSums.adminPlacement) },
      { name: 'Supplier Delivery', hours: getAvgHours(stageSums.supplierDelivery) },
      { name: 'Wait for Pickup', hours: getAvgHours(stageSums.pickupTime) },
    ].map(d => ({ ...d, hours: Math.round(d.hours * 10) / 10 })); // Round to 1 decimal

    // 4. Categories & Locations
    const catMap: Record<string, number> = {};
    const locMap: Record<string, number> = {};
    const urgencyMap: Record<string, number> = {};

    requests.forEach(r => {
      catMap[r.category] = (catMap[r.category] || 0) + 1;
      locMap[r.farmLocation] = (locMap[r.farmLocation] || 0) + 1;
      urgencyMap[r.urgency] = (urgencyMap[r.urgency] || 0) + 1;
    });

    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    const locationData = Object.entries(locMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
    const urgencyData = Object.entries(urgencyMap).map(([name, value]) => ({ name, value }));

    return {
      activeCount: activeRequests.length,
      completedCount: completedRequests.length,
      avgFulfillmentDays,
      funnelData,
      durationData,
      categoryData,
      locationData,
      urgencyData
    };
  }, [requests]);

  const COLORS = ['#8A1F2D', '#D97706', '#059669', '#2563EB', '#7C3AED', '#DB2777', '#4B5563', '#0891B2'];
  const URGENCY_COLORS = {
    "Critical": "#DC2626", // Red
    "High": "#EA580C", // Orange
    "Medium": "#CA8A04", // Yellow
    "Low": "#16A34A" // Green
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Active Requests</span>
          <span className="text-4xl font-bold text-gray-900">{data.activeCount}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Completed</span>
          <span className="text-4xl font-bold text-green-600">{data.completedCount}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Avg Fulfillment</span>
          <span className="text-4xl font-bold text-blue-600">
            {data.avgFulfillmentDays > 0 ? `${Math.round(data.avgFulfillmentDays * 10) / 10} Days` : "—"}
          </span>
        </div>
      </div>

      {/* Row 1: Funnel & Time Durations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Active Pipeline</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 13, fontWeight: 500}} width={120} />
                <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#8A1F2D" radius={[0, 8, 8, 0]} barSize={32}>
                  {data.funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#8A1F2D', '#D97706', '#2563EB', '#059669', '#7C3AED'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time in Stage */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Avg Time in Stage (Hours)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.durationData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 11}} tickMargin={12} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="hours" fill="#4B5563" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Locations, Categories, Urgency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Locations Bar */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Requests by Location</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.locationData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickMargin={12} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgency & Categories (Stack) */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Urgency Distribution</h3>
            <div className="flex-1 min-h-[140px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.urgencyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.urgencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={URGENCY_COLORS[entry.name as keyof typeof URGENCY_COLORS] || '#6B7280'} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {data.urgencyData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: URGENCY_COLORS[entry.name as keyof typeof URGENCY_COLORS] || '#6B7280'}}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Top Categories</h3>
            <div className="flex-1 min-h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryData.slice(0, 5)} // Show top 5
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.categoryData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {data.categoryData.slice(0, 5).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-[11px] font-medium text-gray-600 max-w-[100px] truncate" title={entry.name}>
                  <div className="w-2 h-2 shrink-0 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span className="truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
