"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider, getSession, useSession } from "next-auth/react";

// Customers are logged out after 4 hours of inactivity. Refreshing the session
// on each page change counts as activity, so active customers stay logged in.
function CustomerKeepAlive() {
  const pathname = usePathname();
  const { data } = useSession();
  const isCustomer = data?.user?.role === "customer";
  useEffect(() => {
    if (isCustomer) getSession();
  }, [pathname, isCustomer]);
  return null;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <CustomerKeepAlive />
      {children}
    </SessionProvider>
  );
}
