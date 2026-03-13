import OwnerDashboard from "@/components/dashboard/OwnerDashboard";
import StaffDashboard from "@/components/dashboard/StaffDashboard";
import { useAuthStore } from "@/store/useAuthStore";
import React from "react";

export default function TabIndex() {
  const user = useAuthStore((state) => state.user);

  if (user?.role === "owner") {
    return <OwnerDashboard username={user.username} />;
  }

  return <StaffDashboard />;
}
