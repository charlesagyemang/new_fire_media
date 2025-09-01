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
  const audioRef = useRef<HTMLAudioElement>(null)
  const volumeTimeoutRef = useRef<NodeJS.Timeout>()

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

  const streamUrl = 'https://streaming.shoutcast.com/newfireradio'

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
        title: 'New Fire Radio',
        text: 'Listen to New Fire Radio live!',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
    }
  }

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
            New Fire Radio
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 px-2 leading-relaxed">
            Experience the hottest sounds from Ghana and beyond
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

          {/* Status - Mobile Optimized */}
          <div className="text-center mb-5 sm:mb-6 px-2">
            <p className="text-base sm:text-lg font-semibold text-white mb-1">
              {isLoading ? 'Connecting...' : isPlaying ? 'Now Playing' : 'Ready to Play'}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              {isLoading ? 'Establishing connection...' : 
               isPlaying ? 'Live from Ghana' : 
               'Tap play to start listening'}
            </p>
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
            Powered by New Fire Media
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

