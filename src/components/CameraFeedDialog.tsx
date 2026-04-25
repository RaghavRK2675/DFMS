import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCameras, useAddCamera, useDeleteCamera } from "@/hooks/useDfmsData";
import { CameraPlayer } from "@/components/CameraPlayer";
import { Camera as CameraIcon, Plus, Trash2, VideoOff } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CameraFeedDialog({ open, onClose }: Props) {
  const { data: cameras, isLoading } = useCameras();
  const addCam = useAddCamera();
  const delCam = useDeleteCamera();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [streamType, setStreamType] = useState<"hls" | "mp4">("hls");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addCam.mutateAsync({ name, location, streamUrl, streamType });
      toast.success("Camera added");
      setName(""); setLocation(""); setStreamUrl(""); setShowAdd(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to add camera");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CameraIcon className="w-5 h-5" /> Live Camera Feed
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Loading cameras…</p>
        ) : !cameras || cameras.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed rounded-xl">
            <VideoOff className="w-10 h-10 mx-auto text-muted-foreground/60" />
            <p className="font-medium text-foreground mt-3">No cameras detected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add an HLS or MP4 stream URL to view a live feed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto">
            {cameras.map((c) => (
              <div key={c.id} className="border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.location}</p>
                  </div>
                  <button
                    onClick={async () => { await delCam.mutateAsync(c.id); toast.success("Camera removed"); }}
                    className="text-destructive hover:bg-destructive/10 p-1.5 rounded"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <CameraPlayer src={c.streamUrl} type={c.streamType} className="aspect-video" />
              </div>
            ))}
          </div>
        )}

        {showAdd ? (
          <form onSubmit={handleAdd} className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm">Add a camera</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cn">Name</Label>
                <Input id="cn" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Pen A camera" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cl">Location</Label>
                <Input id="cl" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="Pen A" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cu">Stream URL (HLS .m3u8 or MP4)</Label>
              <Input id="cu" type="url" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} required placeholder="https://example.com/stream.m3u8" />
              <p className="text-xs text-muted-foreground">For RTSP cameras, use a service like go2rtc / MediaMTX to publish an HLS URL.</p>
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={streamType} onValueChange={(v: "hls" | "mp4") => setStreamType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hls">HLS (.m3u8)</SelectItem>
                  <SelectItem value="mp4">MP4 / Direct video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={addCam.isPending}>Save camera</Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="gap-1.5 self-start">
            <Plus className="w-3.5 h-3.5" /> Add camera
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
