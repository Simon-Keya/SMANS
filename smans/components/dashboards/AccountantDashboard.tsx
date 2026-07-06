// app/dashboard/components/AccountantDashboard.tsx
"use client";

interface AccountantDashboardProps {
  stats: any;
}

export function AccountantDashboard({ stats }: AccountantDashboardProps) {
  return (
    <>
      {/* Accountant Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalInvoices || 0}</div>
          <div className="text-base-content/60 mt-1">Total Invoices</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalPayments || 0}</div>
          <div className="text-base-content/60 mt-1">Total Payments</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.totalFeeItems || 0}</div>
          <div className="text-base-content/60 mt-1">Fee Items</div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-shadow">
          <div className="text-4xl font-bold text-primary">{stats.pendingCount || 0}</div>
          <div className="text-base-content/60 mt-1">Pending Invoices</div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Pending Invoices</span>
              <div className="text-right">
                <p className="text-xl font-semibold text-warning">{stats.pendingCount || 0}</p>
                <p className="text-sm text-base-content/60">KSh {(stats.pendingAmount || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Paid Invoices</span>
              <div className="text-right">
                <p className="text-xl font-semibold text-success">{stats.paidCount || 0}</p>
                <p className="text-sm text-base-content/60">KSh {(stats.paidAmount || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Overdue Invoices</span>
              <div className="text-right">
                <p className="text-xl font-semibold text-error">{stats.overdueCount || 0}</p>
                <p className="text-sm text-base-content/60">KSh {(stats.overdueAmount || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-base-content/60">Recent Payments (30 days)</span>
                <p className="text-xl font-semibold text-primary">
                  KSh {(stats.recentPaymentsAmount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/dashboard/invoices/new" className="btn btn-sm btn-outline w-full">Create Invoice</a>
            <a href="/dashboard/invoices" className="btn btn-sm btn-outline w-full">View All Invoices</a>
            <a href="/dashboard/payments" className="btn btn-sm btn-outline w-full">Record Payment</a>
            <a href="/dashboard/fees/structure" className="btn btn-sm btn-outline w-full">Manage Fee Items</a>
            <a href="/dashboard/fees/structure/new" className="btn btn-sm btn-outline w-full">Add Fee Item</a>
            <a href="/dashboard/reports/financial" className="btn btn-sm btn-outline w-full">Financial Reports</a>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-base-200 rounded-2xl p-8 border border-base-300">
        <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/dashboard/fees" className="btn btn-outline">Fee Management</a>
          <a href="/dashboard/fees/structure" className="btn btn-outline">Fee Structure</a>
          <a href="/dashboard/invoices" className="btn btn-outline">Invoices</a>
          <a href="/dashboard/payments" className="btn btn-outline">Payments</a>
          <a href="/dashboard/reports/financial" className="btn btn-outline">Financial Reports</a>
          <a href="/dashboard/profile" className="btn btn-outline">My Profile</a>
        </div>
      </div>
    </>
  );
}