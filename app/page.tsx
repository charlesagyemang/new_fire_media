'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Radio, 
  Music, 
  Share2
} from 'lucide-react'

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [isLoading, setIsLoading] = useState(false)
  const [showVisualizer, setShowVisualizer] = useState(true)
  const [streamStatus, setStreamStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const audioRef = useRef<HTMLAudioElement>(null)
  const volumeTimeoutRef = useRef<NodeJS.Timeout>()

  // Check if stream is online
  const checkStreamStatus = async () => {
    setStreamStatus('checking')
    
    try {
      // Try to fetch the stream URL
      const response = await fetch(streamUrl)
      
      // Check if response is ok (200-299 range)
      if (response.ok) {
        setStreamStatus('online')
      } else {
        // 404, 500, etc. means stream is offline
        console.log('Stream returned status:', response.status)
        setStreamStatus('offline')
      }
    } catch (error) {
      // If fetch fails completely, try audio method as fallback
      try {
        const audio = new Audio()
        audio.src = streamUrl
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout')), 5000)
          
          audio.onloadedmetadata = () => {
            clearTimeout(timeout)
            resolve(true)
          }
          
          audio.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('Stream error'))
          }
        })
        
        setStreamStatus('online')
      } catch (audioError) {
        // Both methods failed - stream is offline
        console.log('Stream check failed:', error, audioError)
        setStreamStatus('offline')
      }
    }
  }

  // Set initial volume only once when component mounts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
    
    // Cleanup function to clear timeout
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current)
      }
    }
  }, []) // Empty dependency array means this only runs once

  // Check stream status on mount and every 2 minutes
  useEffect(() => {
    checkStreamStatus()
    
    const interval = setInterval(checkStreamStatus, 2 * 60 * 1000) // Check every 2 minutes
    
    return () => clearInterval(interval)
  }, [])

  const streamUrl = process.env.NEXT_PUBLIC_URL || 'https://streaming.shoutcast.com/newfireradio'

  // Log the stream URL being used (for debugging)
  useEffect(() => {
    console.log('Stream URL from env:', process.env.NEXT_PUBLIC_URL)
    console.log('Using stream URL:', streamUrl)
  }, [streamUrl])

  const togglePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      setIsLoading(true)
      try {
        audioRef.current.src = streamUrl
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error('Error playing audio:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    
    // Set audio volume immediately for responsive feel
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    
    // Update state immediately for smooth slider movement
    setVolume(newVolume)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stationName,
        text: `Listen to ${stationName} live!`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
    }
  }

  const stationName = process.env.NEXT_PUBLIC_STATION_NAME || 'New Fire Radio'
  const stationDescription = process.env.NEXT_PUBLIC_STATION_DESCRIPTION || 'Experience the hottest sounds from Ghana and beyond'

  const [nowPlayingTitle, setNowPlayingTitle] = useState<string>(process.env.NEXT_PUBLIC_TITLE || stationName)

  const parseMetadata = (body: any): string | null => {
    if (!body) return null
    if (typeof body === 'string') {
      const txt = body.trim()
      if (!txt) return null
      return txt
    }
    const keys = ['title', 'now_playing', 'song', 'current', 'track', 'nowplaying', 'nowPlaying']
    for (const k of keys) {
      if (k in body && body[k]) return String(body[k])
    }
    if (body.data) {
      return parseMetadata(body.data) as string | null
    }
    return null
  }

  useEffect(() => {
    const metadataUrl = process.env.NEXT_PUBLIC_METADATA_URL
    if (!metadataUrl) return

    let mounted = true

    const fetchMeta = async () => {
      try {
        const res = await fetch(metadataUrl, { cache: 'no-cache' })
        let body: any
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          body = await res.json()
        } else {
          body = await res.text()
        }

        const title = parseMetadata(body)
        if (mounted && title) setNowPlayingTitle(title)
      } catch (err) {
      }
    }

    fetchMeta()
    const id = setInterval(fetchMeta, 15 * 1000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const base = stationName || 'Radio'
    try {
      document.title = isPlaying ? `${nowPlayingTitle} — ${base}` : base
    } catch (e) {
    }

    if ('mediaSession' in navigator) {
      try {
        // @ts-ignore
        navigator.mediaSession.metadata = new MediaMetadata({
          title: nowPlayingTitle,
          artist: stationName,
        })
      } catch (err) {
        // ignore unsupported MediaMetadata
      }
    }
  }, [nowPlayingTitle, isPlaying, stationName])

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-purple via-dark-blue to-accent-blue relative overflow-hidden">
      {/* Background Elements - Mobile Optimized */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-80 sm:h-80 bg-fire-orange/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 sm:w-96 sm:h-96 bg-neon-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-accent-blue/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-3 sm:p-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8 w-full max-w-sm sm:max-w-md mx-auto"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-3 sm:mb-4"
          >
            <Radio className="w-12 h-12 sm:w-16 sm:h-16 text-fire-orange animate-glow" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 text-glow leading-tight">
            {stationName}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 px-2 leading-relaxed">
            {stationDescription}
          </p>
        </motion.div>

        {/* Main Player Card - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-effect rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 w-full max-w-sm sm:max-w-md mx-auto shadow-2xl"
        >
          {/* Visualizer - Mobile Optimized */}
          {showVisualizer && isPlaying && (
            <motion.div 
              className="flex justify-center items-center mb-6 sm:mb-8 h-12 sm:h-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="audio-wave mx-0.5 sm:mx-1"
                  animate={{
                    height: [
                      Math.random() * 20 + 10,
                      Math.random() * 40 + 20,
                      Math.random() * 30 + 15,
                      Math.random() * 25 + 10,
                      Math.random() * 35 + 15
                    ]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Play Button - Mobile Optimized */}
          {streamStatus === 'online' ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              disabled={isLoading}
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 sm:mb-6 rounded-full fire-gradient flex items-center justify-center shadow-2xl button-hover disabled:opacity-50 touch-manipulation"
            >
              {isLoading ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              ) : (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-0.5 sm:ml-1" />
              )}
            </motion.button>
          ) : streamStatus === 'offline' ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 sm:mb-6 rounded-full bg-red-600/20 border-2 border-red-500/30 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-red-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-xs text-red-400 font-medium">Offline</p>
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 sm:mb-6 rounded-full bg-yellow-600/20 border-2 border-yellow-500/30 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Status - Mobile Optimized */}
          <div className="text-center mb-5 sm:mb-6 px-2">
            <p className="text-base sm:text-lg font-semibold text-white mb-1">
              {streamStatus === 'checking' ? 'Checking Stream...' :
               streamStatus === 'offline' ? 'Stream Offline' :
               isLoading ? 'Connecting...' : 
               isPlaying ? `Now Playing - ${nowPlayingTitle}` : 'Ready to Play'}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              {streamStatus === 'checking' ? 'Verifying connection...' :
               streamStatus === 'offline' ? 'Radio station is currently offline' :
               isLoading ? 'Establishing connection...' : 
               isPlaying ? `Live from ${process.env.NEXT_PUBLIC_STATION_LOCATION || 'Ghana'}` : 
               'Tap play to start listening'}
            </p>
            
            {/* Stream Status Indicator */}
            <div className="mt-3 flex items-center justify-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                streamStatus === 'online' ? 'bg-green-400' : 
                streamStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
              }`}></div>
              <span className={`text-xs font-medium ${
                streamStatus === 'online' ? 'text-green-400' : 
                streamStatus === 'offline' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {streamStatus === 'online' ? 'Stream Online' : 
                 streamStatus === 'offline' ? 'Stream Offline' : 'Checking...'}
              </span>
            </div>
            
            {/* Refresh Button for Offline State */}
            {streamStatus === 'offline' && (
              <button
                onClick={checkStreamStatus}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors touch-manipulation"
              >
                Check Again
              </button>
            )}
          </div>

          {/* Volume Control - Mobile Optimized */}
          <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6 px-2">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors p-2 touch-manipulation"
            >
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="flex-1 h-3 sm:h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
              style={{ 
                touchAction: 'pan-x',
                WebkitAppearance: 'none',
                cursor: 'grab',
                WebkitTapHighlightColor: 'transparent'
              }}
            />
            <span className="text-xs sm:text-sm text-gray-400 w-8 sm:w-12 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors touch-manipulation"
              title="Share New Fire Radio"
            >
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.button>
          </div>
        </motion.div>

        {/* Footer - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 sm:mt-8 text-gray-400 px-4"
        >
          <p className="text-xs sm:text-sm">
            Powered by {process.env.NEXT_PUBLIC_COMPANY_NAME || 'New Fire Media'}
          </p>
        </motion.div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />
    </div>
  )
}

