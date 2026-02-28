"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Lock } from "lucide-react"

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
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
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

interface Props {
  lessonId: string
  onProgress?: () => void
}

export default function VideoPlayer({ lessonId, onProgress }: Props) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const playerRef = useRef<YTPlayer | null>(null)
  const ytDivRef = useRef<HTMLDivElement>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doneRef = useRef(false)

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

  useEffect(() => {
    if (!videoId || !ytDivRef.current) return
    let player: YTPlayer

    loadYT().then(() => {
      if (!ytDivRef.current) return
      player = new window.YT.Player(ytDivRef.current, {
        videoId,
        playerVars: {
          controls: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => { playerRef.current = e.target },
          onStateChange: (e) => {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              tickRef.current = setInterval(() => {
                const p = playerRef.current; if (!p) return
                const t = p.getCurrentTime(), d = p.getDuration()
                if (!doneRef.current && d > 0 && t / d >= 0.9) {
                  doneRef.current = true; onProgress?.()
                }
              }, 1000)
            } else {
              if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
              if (e.data === S.ENDED) onProgress?.()
            }
          },
        },
      })
    })

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      player?.destroy(); playerRef.current = null
    }
  }, [videoId, onProgress])

  if (loading) return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-zinc-900">
      <Skeleton className="w-full h-full" />
    </div>
  )
  if (error) return (
    <div className="w-full aspect-video rounded-xl bg-zinc-900 flex flex-col items-center justify-center gap-4 text-center p-6">
      {error.includes("purchase")
        ? <Lock className="h-12 w-12 text-zinc-500" />
        : <AlertCircle className="h-12 w-12 text-red-400" />}
      <p className="text-zinc-300 text-sm max-w-xs">{error}</p>
    </div>
  )

  return (
    <div
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* YouTube iframe with native controls */}
      <div ref={ytDivRef} className="absolute inset-0 w-full h-full" />

      {/*
        Transparent overlay covering only the top ~13% of the player.
        YouTube renders the "Watch on YouTube" button and Share icon in
        this top hover-bar. This overlay intercepts those clicks so users
        cannot navigate to youtube.com. The bottom controls (progress bar,
        play/pause, volume, quality, speed, fullscreen) are fully usable.
      */}
      <div className="absolute top-0 left-0 right-0 z-10" style={{ height: "13%" }} />
    </div>
  )
}
