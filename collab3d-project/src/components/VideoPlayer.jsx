import { useRef, useState, useEffect } from 'react';
import './VideoPlayer.css';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const FPS = 30; // assume 30fps for frame stepping

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function VideoPlayer({ videoSrc, videoLabel, commentTimes = [], onTimeClick, seekToTime, onSeekDone, onTimeUpdate }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loop, setLoop] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    if (Number.isFinite(seekToTime) && seekToTime >= 0 && videoRef.current) {
      videoRef.current.currentTime = seekToTime;
      setCurrentTime(seekToTime);
      onSeekDone?.();
    }
  }, [seekToTime]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTimeUpdateHandler = () => {
      const t = v.currentTime;
      setCurrentTime(t);
      onTimeUpdate?.(t);
    };
    const onLoadedMetadata = () => setDuration(v.duration);
    const onEnded = () => setPlaying(false);
    v.addEventListener('timeupdate', onTimeUpdateHandler);
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdateHandler);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const seekTo = (time) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Math.max(0, Math.min(time, duration || 0));
    v.currentTime = t;
    setCurrentTime(t);
  };

  const stepFrame = (dir) => {
    const v = videoRef.current;
    if (!v) return;
    const step = (1 / FPS) * dir;
    seekTo(currentTime + step);
  };

  const handleScrub = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    seekTo(pct * (duration || 0));
  };

  const setSpeed = (rate) => {
    const v = videoRef.current;
    if (v) v.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.closest('.video-player');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const dur = duration || 0;
  const progress = dur > 0 ? (currentTime / dur) * 100 : 0;

  return (
    <section className="video-player">
      <div className="video-header">
        <span className="video-path">{videoLabel || 'Video'}</span>
        <span className="video-version">v3</span>
      </div>

      <div className="video-container">
        <video
          ref={videoRef}
          src={videoSrc}
          loop={loop}
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          className="video-element"
        />
      </div>

      <div className="video-controls">
        <div className="controls-row">
          <button className="control-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button className={`control-btn ${loop ? 'active' : ''}`} onClick={() => setLoop(!loop)} title="Loop" aria-label="Loop">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
          </button>
          <div className="speed-wrap">
            <button className="control-btn speed-btn" onClick={() => setShowSpeedMenu(!showSpeedMenu)} aria-label="Playback speed">
              {playbackRate}x
            </button>
            {showSpeedMenu && (
              <div className="speed-menu">
                {SPEEDS.map((s) => (
                  <button key={s} className={playbackRate === s ? 'active' : ''} onClick={() => setSpeed(s)}>{s}x</button>
                ))}
              </div>
            )}
          </div>
          <button className="control-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
            {muted || volume === 0 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
            )}
          </button>
          <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <span className="quality-tag">HD</span>
          <button className="control-btn fullscreen-btn" onClick={toggleFullscreen} aria-label="Fullscreen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
          </button>
        </div>

        <div className="timeline-wrap">
          <button className="control-btn frame-draw-btn" title="Annotate frame" aria-label="Draw on frame">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /></svg>
          </button>
          <div
            className="timeline"
            role="slider"
            aria-label="Video position"
            aria-valuemin={0}
            aria-valuemax={dur}
            aria-valuenow={currentTime}
            tabIndex={0}
            onClick={handleScrub}
          >
            <div className="timeline-progress" style={{ width: `${progress}%` }} />
            {commentTimes.map((t) => (
              <button
                key={t}
                className="timeline-marker"
                style={{ left: `${(t / dur) * 100}%` }}
                title={`Comment at ${formatTime(t)}`}
                onClick={(e) => { e.stopPropagation(); onTimeClick?.(t); seekTo(t); }}
              />
            ))}
          </div>
        </div>

        <div className="frame-nav">
          <button className="frame-btn" onClick={() => stepFrame(-1)} title="Previous frame">← Frame</button>
          <button className="frame-btn" onClick={() => stepFrame(1)} title="Next frame">Frame →</button>
        </div>
      </div>
    </section>
  );
}
