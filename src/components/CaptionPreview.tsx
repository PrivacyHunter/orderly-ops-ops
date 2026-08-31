import React, { useRef, useEffect, useState } from 'react';
import { Subtitles, Play, Pause } from 'lucide-react';

interface CaptionPreviewProps {
  videoUrl: string;
  captions: any[];
  style: {
    fontSize: string;
    color: string;
    position: string;
  };
}

export function CaptionPreview({ videoUrl, captions, style }: CaptionPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    v.addEventListener('timeupdate', onTimeUpdate);
    return () => v.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  const activeCaption = captions.find(c => currentTime >= c.start && currentTime <= c.end);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 group">
      <video 
        ref={videoRef}
        src={videoUrl} 
        className="w-full h-full object-cover opacity-60" 
        muted 
        playsInline
      />
      
      {activeCaption && (
        <div 
          className={`absolute left-0 right-0 px-4 text-center pointer-events-none ${
            style.position === 'top' ? 'top-8' : 
            style.position === 'center' ? 'top-1/2 -translate-y-1/2' : 
            'bottom-8'
          }`}
        >
          <span 
            className={`bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg font-medium shadow-xl inline-block animate-in fade-in zoom-in-95 duration-200 ${style.fontSize}`}
            style={{ color: style.color }}
          >
            {activeCaption.text}
          </span>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center text-primary border border-primary/30"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
      </div>

      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[8px] font-bold text-white uppercase tracking-widest">
        Live Preview
      </div>
    </div>
  );
}
