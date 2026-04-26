import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { can, Capability, Role } from "@/lib/permissions";

interface Props {
  children: React.ReactNode;
  requireCapability?: Capability;
  requireRoles?: Role[];
}

export function ProtectedRoute({ children, requireCapability, requireRoles }: Props) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  const role = user.role as Role;
  if (requireCapability && !can(role, requireCapability)) {
    return <Forbidden />;
  }
  if (requireRoles && !requireRoles.includes(role)) {
    return <Forbidden />;
  }
  return <>{children}</>;
}

function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="font-display text-2xl font-semibold">Access restricted</h1>
      <p className="text-muted-foreground max-w-md">
        Your role doesn't have permission to view this page. Contact your farm administrator
        if you believe this is a mistake.
      </p>
    </div>
  );
}
