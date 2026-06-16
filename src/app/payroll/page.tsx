'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useERP } from '@/context/erp-context';
import { HRPayrollDashboard } from '@/components/payroll/hr-payroll';
import { EmployeePortal } from '@/components/payroll/employee-portal';

function PayrollHubContent() {
  const { activeRole } = useERP();
  const isHRorAdmin = ['Super Admin', 'Company Admin', 'HR'].includes(activeRole);

  if (isHRorAdmin) {
    return <HRPayrollDashboard />;
  }

  return <EmployeePortal />;
}

export default function PayrollHub() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-450 font-bold uppercase tracking-widest">Loading Payroll Suite...</div>}>
      <PayrollHubContent />
    </Suspense>
  );
}
