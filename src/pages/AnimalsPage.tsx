import { useState } from "react";
import { Link } from "react-router-dom";
import { useAnimalsList } from "@/hooks/useMedical";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ChevronRight, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AnimalsPage() {
  const { data: animals, isLoading } = useAnimalsList();
  const [q, setQ] = useState("");
  const [species, setSpecies] = useState<string>("all");
  const [status, setStatus] = useState<string>("active");

  const filtered = (animals ?? []).filter((a) => {
    if (species !== "all" && a.species !== species) return false;
    if (status !== "all" && a.status !== status) return false;
    if (q && !`${a.tag} ${a.breed ?? ""} ${a.pen}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-white px-6 py-5 shadow-elevated">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl">Animal Registry & Medical Records</h1>
            <p className="text-white/70 text-xs">Long-term health history, vaccinations, treatments, mortality</p>
          </div>
          <Link to="/">
            <Button variant="secondary" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Herd Records</span>
              <Badge variant="secondary">{filtered.length} of {animals?.length ?? 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by tag, breed, pen…" className="pl-9" />
              </div>
              <Select value={species} onValueChange={setSpecies}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All species</SelectItem>
                  <SelectItem value="pig">Pig</SelectItem>
                  <SelectItem value="poultry">Poultry</SelectItem>
                  <SelectItem value="cattle">Cattle</SelectItem>
                  <SelectItem value="goat">Goat</SelectItem>
                  <SelectItem value="sheep">Sheep</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No animals match these filters.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2">Tag</th>
                      <th className="text-left px-3 py-2">Species</th>
                      <th className="text-left px-3 py-2">Breed</th>
                      <th className="text-left px-3 py-2">Pen</th>
                      <th className="text-left px-3 py-2">Health</th>
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr key={a.id} className="border-t hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">
                          <Link to={`/animals/${a.id}`} className="hover:underline">{a.tag}</Link>
                        </td>
                        <td className="px-3 py-2 capitalize">{a.species}</td>
                        <td className="px-3 py-2 text-muted-foreground">{a.breed || "—"}</td>
                        <td className="px-3 py-2">{a.pen}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={a.health_status === "high" ? "destructive" : a.health_status === "medium" ? "secondary" : "default"}
                            className="capitalize"
                          >
                            {a.health_status ?? "—"}
                          </Badge>
                          {a.is_isolated && <Badge variant="outline" className="ml-2 text-xs">Isolated</Badge>}
                        </td>
                        <td className="px-3 py-2 capitalize text-muted-foreground">{a.status}</td>
                        <td className="px-3 py-2 text-right">
                          <Link to={`/animals/${a.id}`}>
                            <Button variant="ghost" size="icon"><ChevronRight className="w-4 h-4" /></Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
