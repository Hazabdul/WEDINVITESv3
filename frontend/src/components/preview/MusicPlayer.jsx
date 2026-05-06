import React, { useState, useRef, useEffect } from 'react';
import { Music2, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { cn } from '../../utils/cn';

export function MusicPlayer({ url, autoPlay = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!url || !audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleCanPlay = () => {
      if (autoPlay && !hasStarted) {
        // Attempt autoplay (most browsers will block this until user interaction)
        audio.play()
          .then(() => {
            setIsPlaying(true);
            setHasStarted(true);
          })
          .catch(() => {
            console.log('Autoplay blocked by browser');
          });
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    return () => audio.removeEventListener('canplay', handleCanPlay);
  }, [url, autoPlay, hasStarted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      setHasStarted(true);
    }
    setIsPlaying(!isPlaying);
  };

  if (!url) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] sm:bottom-8 sm:right-8">
      <audio ref={audioRef} src={url} loop />
      
      <button
        onClick={togglePlay}
        className={cn(
          "group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-500 active:scale-90 sm:h-12 sm:w-12",
          isPlaying 
            ? "bg-[#c9a87c] text-[#1a3529]" 
            : "bg-white/90 text-[#1a3529] hover:bg-white"
        )}
      >
        {/* Animated Ripple Effects when Playing */}
        {isPlaying && (
          <>
            <div className="absolute inset-0 animate-ping rounded-full bg-[#c9a87c]/20" />
          </>
        )}

        <div className="relative z-10 flex items-center justify-center">
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
          ) : (
            <Play className="h-4 w-4 ml-0.5 fill-current sm:h-5 sm:w-5" />
          )}
        </div>

        {/* Floating Label */}
        <div className="absolute -top-12 right-0 whitespace-nowrap rounded-xl bg-[#1a3529] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[2px] text-[#f5ede0] opacity-0 shadow-xl transition-all duration-300 group-hover:-top-14 group-hover:opacity-100">
          {isPlaying ? 'Pause Music' : 'Play Music'}
        </div>
      </button>
    </div>
  );
}
