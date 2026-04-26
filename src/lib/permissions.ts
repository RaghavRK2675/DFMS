// Centralized RBAC matrix.
// Roles in DB: 'farmer','veterinarian','farm_worker','supervisor','inspector','admin'
export type Role =
  | "farmer"
  | "veterinarian"
  | "farm_worker"
  | "supervisor"
  | "inspector"
  | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  farmer: "Farmer",
  veterinarian: "Veterinarian",
  supervisor: "Supervisor",
  farm_worker: "Farm Worker",
  inspector: "Inspector",
};

export type Capability =
  | "animals.create"
  | "animals.update"
  | "animals.delete"
  | "vaccinations.write"
  | "treatments.write"
  | "events.observe"
  | "events.clinical"
  | "mortality.write"
  | "users.manage"
  | "audit.viewAll";

export const CAPABILITIES: Record<Capability, Role[]> = {
  "animals.create": ["farmer", "supervisor", "admin"],
  "animals.update": ["farmer", "supervisor", "admin", "veterinarian"],
  "animals.delete": ["admin"],
  "vaccinations.write": ["farmer", "supervisor", "admin", "veterinarian"],
  "treatments.write": ["farmer", "supervisor", "admin", "veterinarian"],
  "events.observe": ["farm_worker", "farmer", "supervisor", "admin", "veterinarian"],
  "events.clinical": ["farmer", "supervisor", "admin", "veterinarian"],
  "mortality.write": ["farmer", "supervisor", "admin", "veterinarian"],
  "users.manage": ["admin"],
  "audit.viewAll": ["admin"],
};

export function can(role: Role | undefined | null, capability: Capability): boolean {
  if (!role) return false;
  return CAPABILITIES[capability].includes(role);
}
