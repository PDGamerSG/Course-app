"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle, Lock, Play, Pause,
  Volume2, VolumeX, Maximize, Minimize,
  RotateCcw, Settings,
} from "lucide-react"

/* ─── YT IFrame API types ─── */
declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: YTOpts) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
}
interface YTOpts {
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
  seekTo(s: number, allow: boolean): void
  setVolume(v: number): void
  mute(): void
  unMute(): void
  isMuted(): boolean
  getVolume(): number
  setPlaybackRate(r: number): void
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
  setPlaybackQuality(q: string): void
  getPlaybackQuality(): string
  getAvailableQualityLevels(): string[]
  destroy(): void
}

function loadYT(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return }
    if (!document.getElementById("yt-api")) {
      const s = document.createElement("script")
      s.id = "yt-api"
      s.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(s)
    }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve() }
  })
}

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return "0:00"
  const m = Math.floor(s / 60)
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

interface Props { lessonId: string; onProgress?: () => void }

export default function VideoPlayer({ lessonId, onProgress }: Props) {
  const [videoId, setVideoId]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [playing, setPlaying]   = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [current, setCurrent]   = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume]     = useState(100)
  const [muted, setMuted]       = useState(false)
  const [speed, setSpeed]       = useState(1)
  const [showSpeed, setShowSpeed] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [ctrlVisible, setCtrlVisible] = useState(true)

  const playerRef   = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ytDivRef    = useRef<HTMLDivElement>(null)
  const tickRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const doneRef     = useRef(false)
  // Keep onProgress in a ref so the YT player effect doesn't re-run when callback changes
  const onProgressRef = useRef(onProgress)
  useEffect(() => { onProgressRef.current = onProgress })

  /* fetch video id */
  useEffect(() => {
    setLoading(true); setError(null); setVideoId(null)
    doneRef.current = false
    axios.get(`/api/get-video-url/${lessonId}`)
      .then(({ data }) => setVideoId(atob(data.vid)))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401)
          setError("Please purchase this course to watch this lesson.")
        else setError("Failed to load video. Please try again.")
      })
      .finally(() => setLoading(false))
  }, [lessonId])

  /* init player */
  useEffect(() => {
    if (!videoId || !ytDivRef.current) return
    let player: YTPlayer
    loadYT().then(() => {
      if (!ytDivRef.current) return
      player = new window.YT.Player(ytDivRef.current, {
        videoId,
        playerVars: {
          controls: 0, rel: 0, modestbranding: 1,
          iv_load_policy: 3, disablekb: 1, fs: 0,
          playsinline: 1, cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            playerRef.current = e.target
            setVolume(e.target.getVolume())
            setDuration(e.target.getDuration())
          },
          onStateChange: (e) => {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setPlaying(true); setBuffering(false)
              tickRef.current = setInterval(() => {
                const p = playerRef.current; if (!p) return
                const t = p.getCurrentTime(), d = p.getDuration()
                setCurrent(t); setDuration(d)
                if (!doneRef.current && d > 0 && t / d >= 0.9) {
                  doneRef.current = true; onProgressRef.current?.()
                }
              }, 500)
            } else {
              setPlaying(false)
              if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
              if (e.data === S.BUFFERING) setBuffering(true)
              if (e.data === S.ENDED)     { onProgressRef.current?.(); setCurrent(0) }
            }
          },
        },
      })
    })
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      player?.destroy(); playerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  /* fullscreen listener */
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", h)
    return () => document.removeEventListener("fullscreenchange", h)
  }, [])

  /* auto-hide controls */
  const nudge = useCallback(() => {
    setCtrlVisible(true)
    if (hideRef.current) clearTimeout(hideRef.current)
    hideRef.current = setTimeout(() => {
      if (playerRef.current?.getPlayerState() === window.YT?.PlayerState?.PLAYING)
        setCtrlVisible(false)
    }, 3000)
  }, [])

  const togglePlay = useCallback(() => {
    const p = playerRef.current; if (!p) return
    if (p.getPlayerState() === window.YT.PlayerState.PLAYING) { p.pauseVideo() } else { p.playVideo() }
  }, [])

  const seek = useCallback((v: number) => {
    playerRef.current?.seekTo(v, true); setCurrent(v)
  }, [])

  const changeVolume = useCallback((v: number) => {
    const p = playerRef.current; if (!p) return
    p.setVolume(v); setVolume(v)
    if (v === 0) { p.mute(); setMuted(true) } else { p.unMute(); setMuted(false) }
  }, [])

  const toggleMute = useCallback(() => {
    const p = playerRef.current; if (!p) return
    if (muted) { p.unMute(); setMuted(false); const v = volume || 80; p.setVolume(v); setVolume(v) }
    else        { p.mute();  setMuted(true) }
  }, [muted, volume])

  const toggleFS = useCallback(() => {
    if (!containerRef.current) return
    if (document.fullscreenElement) { document.exitFullscreen() }
    else { containerRef.current.requestFullscreen().catch(() => {}) }
  }, [])

  if (loading) return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-zinc-900">
      <Skeleton className="w-full h-full" />
    </div>
  )
  if (error) return (
    <div className="w-full aspect-video rounded-xl bg-zinc-900 flex flex-col items-center justify-center gap-4 text-center p-6">
      {error.includes("purchase") ? <Lock className="h-12 w-12 text-zinc-500" /> : <AlertCircle className="h-12 w-12 text-red-400" />}
      <p className="text-zinc-300 text-sm max-w-xs">{error}</p>
    </div>
  )

  const pct = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black select-none"
      onMouseMove={nudge}
      onMouseLeave={() => playing && setCtrlVisible(false)}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.code === "Space")       { e.preventDefault(); togglePlay() }
        if (e.code === "ArrowRight")  seek(Math.min(duration, current + 10))
        if (e.code === "ArrowLeft")   seek(Math.max(0, current - 10))
        if (e.code === "KeyF")        toggleFS()
        if (e.code === "KeyM")        toggleMute()
      }}
    >
      {/* iframe — pointer-events:none so YouTube never gets mouse events */}
      <div ref={ytDivRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* click / interaction layer */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={() => { setShowSpeed(false); togglePlay() }}
        onDoubleClick={toggleFS}
      />

      {/* buffering spinner */}
      {buffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* centre play icon when paused */}
      {!playing && !buffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/60 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <Play className="h-7 w-7 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* ── Controls ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${ctrlVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none rounded-b-xl" />

        <div className="relative px-4 pb-3 pt-8 space-y-2">
          {/* Progress bar */}
          <div className="relative h-1 group/prog">
            <div className="absolute inset-0 h-1 rounded-full bg-white/20" />
            <div className="absolute top-0 left-0 h-1 rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
            <input
              type="range" min={0} max={duration || 100} step={0.5} value={current}
              onChange={(e) => seek(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-5 -top-2"
            />
          </div>

          {/* Button row */}
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform shrink-0">
              {playing ? <Pause className="h-5 w-5 fill-white stroke-none" /> : <Play className="h-5 w-5 fill-white stroke-none" />}
            </button>

            <button onClick={() => seek(Math.max(0, current - 10))} className="text-white/70 hover:text-white shrink-0" title="Rewind 10s">
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol shrink-0">
              <button onClick={toggleMute} className="text-white hover:scale-110 transition-transform">
                {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
                <input type="range" min={0} max={100} value={muted ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  className="w-20 h-1 cursor-pointer accent-white" />
              </div>
            </div>

            <span className="text-white/60 text-xs font-mono tabular-nums shrink-0">
              {fmt(current)} / {fmt(duration)}
            </span>

            <div className="flex-1" />

            {/* Speed */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowSpeed(!showSpeed)}
                className="flex items-center gap-1 text-white/70 hover:text-white text-xs font-medium transition-colors px-2 py-1 rounded-md hover:bg-white/10"
              >
                <Settings className="h-3.5 w-3.5" />
                {speed === 1 ? "Speed" : `${speed}x`}
              </button>

              {showSpeed && (
                <div className="absolute bottom-9 right-0 bg-zinc-900/95 backdrop-blur border border-white/10 rounded-xl shadow-2xl overflow-hidden w-36">
                  <div className="px-3 py-2 border-b border-white/10">
                    <span className="text-xs text-white/50 font-medium">Playback Speed</span>
                  </div>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { playerRef.current?.setPlaybackRate(s); setSpeed(s); setShowSpeed(false) }}
                      className={`flex items-center justify-between w-full px-4 py-2 text-sm transition-colors ${
                        s === speed ? "text-white bg-white/10 font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{s === 1 ? "Normal" : `${s}x`}</span>
                      {s === speed && <span className="text-blue-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleFS} className="text-white/70 hover:text-white transition-colors shrink-0">
              {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
