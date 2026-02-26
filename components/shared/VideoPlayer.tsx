"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Lock } from "lucide-react"

interface VideoPlayerProps {
  lessonId: string
  onProgress?: () => void
}

export default function VideoPlayer({ lessonId, onProgress }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setEmbedUrl(null)

    axios
      .get(`/api/get-video-url/${lessonId}`)
      .then(({ data }) => {
        setEmbedUrl(data.embedUrl)
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError("Please purchase this course to watch this lesson.")
        } else if (axios.isAxiosError(err) && err.response?.status === 429) {
          setError("Too many requests. Please wait a moment.")
        } else {
          setError("Failed to load video. Please try again.")
        }
      })
      .finally(() => setLoading(false))
  }, [lessonId])

  // Listen for YouTube player state changes via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube-nocookie.com") return
      try {
        const data = JSON.parse(event.data)
        // PlayerState 0 = ended
        if (data.event === "onStateChange" && data.info === 0 && onProgress) {
          onProgress()
        }
      } catch {
        // ignore parse errors
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onProgress])

  if (loading) {
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted flex flex-col items-center justify-center gap-4 text-center p-6">
        {error.includes("purchase") ? (
          <Lock className="h-12 w-12 text-muted-foreground" />
        ) : (
          <AlertCircle className="h-12 w-12 text-destructive" />
        )}
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
      {/* Overlay to prevent right-click inspection of iframe */}
      <div
        className="absolute inset-0 z-10"
        style={{ pointerEvents: "none" }}
        onContextMenu={(e) => e.preventDefault()}
      />
      <iframe
        ref={iframeRef}
        src={embedUrl!}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Course Video"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}
