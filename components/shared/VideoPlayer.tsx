"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle, Lock, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, Settings, RotateCcw,
} from "lucide-react"

/* ── YouTube IFrame API types ── */
declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement | string, opts: YTPlayerOptions) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number; UNSTARTED: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
}
interface YTPlayerOptions {
  videoId: string
  playerVars?: Record<string, number | string>
  events?: {
    onReady?: (e: { target: YTPlayer }) => void
    onStateChange?: (e: { data: number }) => void
  }
}
interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(s: number, allowSeekAhead: boolean): void
  setVolume(v: number): void
  mute(): void
  unMute(): void
  isMuted(): boolean
  getVolume(): number
  setPlaybackRate(r: number): void
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
  destroy(): void
}

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00"
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, "0")}`
}

function loadYTScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return }
    const existing = document.getElementById("yt-iframe-api")
    if (!existing) {
      const tag = document.createElement("script")
      tag.id = "yt-iframe-api"
      tag.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(tag)
    }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve() }
  })
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

interface VideoPlayerProps {
  lessonId: string
  onProgress?: () => void
}

export default function VideoPlayer({ lessonId, onProgress }: VideoPlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [buffering, setBuffering] = useState(false)

  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ytDivRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressedRef = useRef(false)

  /* fetch & decode video ID */
  useEffect(() => {
    setLoading(true); setError(null); setVideoId(null)
    progressedRef.current = false
    axios.get(`/api/get-video-url/${lessonId}`)
      .then(({ data }) => {
        // Decode base64-encoded video ID
        setVideoId(atob(data.vid))
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401)
          setError("Please purchase this course to watch this lesson.")
        else setError("Failed to load video. Please try again.")
      })
      .finally(() => setLoading(false))
  }, [lessonId])

  /* init YT player once videoId is ready */
  useEffect(() => {
    if (!videoId || !ytDivRef.current) return
    let player: YTPlayer

    loadYTScript().then(() => {
      if (!ytDivRef.current) return
      player = new window.YT.Player(ytDivRef.current, {
        videoId,
        playerVars: {
          controls: 0,         // hide all YouTube controls
          rel: 0,              // no related videos
          modestbranding: 1,   // minimal branding
          showinfo: 0,         // no title bar
          iv_load_policy: 3,   // no annotations
          disablekb: 1,        // no keyboard shortcuts (we handle them)
          fs: 0,               // no YouTube fullscreen button
          playsinline: 1,
          cc_load_policy: 0,   // no captions by default
          autohide: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            playerRef.current = e.target
            setDuration(e.target.getDuration())
            setVolume(e.target.getVolume())
          },
          onStateChange: (e) => {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setPlaying(true); setBuffering(false)
              intervalRef.current = setInterval(() => {
                const p = playerRef.current; if (!p) return
                const t = p.getCurrentTime()
                const d = p.getDuration()
                setCurrent(t); setDuration(d)
                if (!progressedRef.current && d > 0 && t / d >= 0.9) {
                  progressedRef.current = true
                  onProgress?.()
                }
              }, 500)
            } else {
              setPlaying(false)
              if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
              if (e.data === S.BUFFERING) setBuffering(true)
              if (e.data === S.ENDED) { onProgress?.(); setCurrent(0) }
            }
          },
        },
      })
    })

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      player?.destroy()
      playerRef.current = null
    }
  }, [videoId, onProgress])

  /* fullscreen listener */
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  /* auto-hide controls after 3s */
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (playerRef.current?.getPlayerState() === window.YT?.PlayerState?.PLAYING)
        setControlsVisible(false)
    }, 3000)
  }, [])

  const togglePlay = useCallback(() => {
    const p = playerRef.current; if (!p) return
    if (p.getPlayerState() === window.YT.PlayerState.PLAYING) { p.pauseVideo() } else { p.playVideo() }
    resetHideTimer()
  }, [resetHideTimer])

  const seek = useCallback((val: number) => {
    playerRef.current?.seekTo(val, true); setCurrent(val)
  }, [])

  const changeVolume = useCallback((val: number) => {
    const p = playerRef.current; if (!p) return
    p.setVolume(val); setVolume(val)
    if (val === 0) { p.mute(); setMuted(true) } else { p.unMute(); setMuted(false) }
  }, [])

  const toggleMute = useCallback(() => {
    const p = playerRef.current; if (!p) return
    if (muted) { p.unMute(); setMuted(false); const v = volume || 80; p.setVolume(v); setVolume(v) }
    else { p.mute(); setMuted(true) }
  }, [muted, volume])

  const changeSpeed = useCallback((s: number) => {
    playerRef.current?.setPlaybackRate(s); setSpeed(s); setShowSettings(false)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) containerRef.current.requestFullscreen().catch(() => {})
    else document.exitFullscreen()
  }, [])

  const rewind = useCallback(() => {
    const t = (playerRef.current?.getCurrentTime() ?? 0) - 10
    seek(Math.max(0, t))
  }, [seek])

  if (loading) return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-zinc-900">
      <Skeleton className="w-full h-full" />
    </div>
  )

  if (error) return (
    <div className="w-full aspect-video rounded-xl bg-zinc-900 flex flex-col items-center justify-center gap-4 text-center p-6">
      {error.includes("purchase") ? <Lock className="h-12 w-12 text-zinc-500" /> : <AlertCircle className="h-12 w-12 text-red-400" />}
      <p className="text-zinc-400 text-sm max-w-xs">{error}</p>
    </div>
  )

  const pct = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black select-none focus:outline-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setControlsVisible(false)}
      onKeyDown={(e) => {
        if (e.code === "Space") { e.preventDefault(); togglePlay() }
        if (e.code === "ArrowRight") seek(Math.min(duration, current + 10))
        if (e.code === "ArrowLeft") seek(Math.max(0, current - 10))
        if (e.code === "KeyF") toggleFullscreen()
        if (e.code === "KeyM") toggleMute()
      }}
      tabIndex={0}
    >
      {/*
        ── YouTube iframe container ──
        Scaled up 6% so YouTube's UI elements (logo, branding) are pushed
        outside the visible area (parent has overflow:hidden).
        pointer-events: none means the iframe NEVER receives mouse events,
        so YouTube's hover-triggered UI (Watch Later, Share) never appears.
      */}
      <div
        ref={ytDivRef}
        className="absolute pointer-events-none"
        style={{
          inset: "-4%",          // expand beyond bounds so scale doesn't shrink video
          width: "108%",
          height: "108%",
          top: "-4%",
          left: "-4%",
        }}
      />

      {/*
        ── Black edge masks ──
        Cover the ~4% overflow zone on all edges.
        These permanently hide any YouTube branding that appears near edges.
      */}
      <div className="absolute top-0 left-0 right-0 h-[5%] bg-black z-[5] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[5%] bg-black z-[5] pointer-events-none" />
      <div className="absolute top-0 bottom-0 left-0 w-[3%] bg-black z-[5] pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-[3%] bg-black z-[5] pointer-events-none" />

      {/*
        ── Full interaction capture overlay ──
        z-10, pointer-events: all. This sits on top of the iframe and
        captures ALL mouse/touch events — YouTube's iframe receives zero
        pointer events so it cannot show "Watch on YouTube", "Watch Later",
        or any hover-triggered controls.
      */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* ── Buffering spinner ── */}
      {buffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* ── Centered play icon (when paused) ── */}
      {!playing && !buffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Play className="h-7 w-7 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* ── Controls bar ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Gradient shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-3 pt-10 space-y-2">
          {/* Progress bar */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={current}
            onChange={(e) => seek(Number(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-1 rounded-full cursor-pointer appearance-none bg-white/25"
            style={{ background: `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,0.25) ${pct}%)` }}
          />

          {/* Buttons row */}
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-white/80 transition-colors shrink-0"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing
                ? <Pause className="h-5 w-5 fill-white stroke-white" />
                : <Play className="h-5 w-5 fill-white stroke-white" />}
            </button>

            {/* Rewind 10s */}
            <button
              onClick={rewind}
              className="text-white/80 hover:text-white transition-colors shrink-0"
              title="Rewind 10s"
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol shrink-0">
              <button onClick={toggleMute} className="text-white hover:text-white/80 transition-colors" aria-label="Toggle mute">
                {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                className="w-0 group-hover/vol:w-18 transition-all duration-200 h-1 rounded-full cursor-pointer appearance-none overflow-hidden"
                style={{
                  background: `linear-gradient(to right, #fff ${muted ? 0 : volume}%, rgba(255,255,255,0.25) ${muted ? 0 : volume}%)`
                }}
              />
            </div>

            {/* Time */}
            <span className="text-white/75 text-xs font-mono tabular-nums shrink-0">
              {formatTime(current)} / {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Speed */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1 text-white/75 hover:text-white text-xs font-semibold transition-colors"
                aria-label="Playback speed"
              >
                <Settings className="h-3.5 w-3.5" />
                <span>{speed}x</span>
              </button>
              {showSettings && (
                <div className="absolute bottom-8 right-0 bg-zinc-900/95 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 shadow-xl min-w-[72px]">
                  <p className="text-[10px] text-white/40 px-3 pt-2 pb-1 uppercase tracking-wider">Speed</p>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`block w-full text-right px-4 py-1.5 text-xs transition-colors ${
                        s === speed
                          ? "bg-white/15 text-white font-bold"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {s === 1 ? "Normal" : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white/75 hover:text-white transition-colors shrink-0"
              aria-label="Toggle fullscreen"
            >
              {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
