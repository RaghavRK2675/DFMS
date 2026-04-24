import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { VideoOff, Loader2 } from "lucide-react";

interface Props {
  src: string;
  type: "hls" | "mp4";
  className?: string;
}

export function CameraPlayer({ src, type, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    setError(null);
    setLoading(true);

    let hls: Hls | null = null;

    function handleCanPlay() { setLoading(false); }
    function handleError() {
      setError("Stream unavailable");
      setLoading(false);
    }

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    if (type === "hls" && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) handleError();
      });
    } else {
      // Native HLS (Safari) or mp4
      video.src = src;
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      hls?.destroy();
    };
  }, [src, type]);

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        ref={ref}
        controls
        muted
        playsInline
        autoPlay
        className="w-full h-full object-cover"
      />
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white text-xs gap-2">
          <VideoOff className="w-6 h-6" />
          {error}
        </div>
      )}
    </div>
  );
}
