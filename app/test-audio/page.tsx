'use client'

import { useState, useRef } from 'react'

export default function TestAudio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [status, setStatus] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  const testUrls = [
    'https://streaming.shoutcast.com/newfireradio',
    'https://streaming.shoutcast.com/newfireradio',
  ]

  const testStream = async (url: string) => {
    if (!audioRef.current) return

    setCurrentUrl(url)
    setStatus('Testing...')
    
    try {
      audioRef.current.src = url
      audioRef.current.crossOrigin = 'anonymous'
      
      audioRef.current.onloadstart = () => setStatus('Loading...')
      audioRef.current.oncanplay = () => setStatus('Can play!')
      audioRef.current.onerror = (e) => {
        console.error('Audio error:', e)
        setStatus('Error occurred')
      }
      
      await audioRef.current.play()
      setIsPlaying(true)
      setStatus('Playing successfully!')
    } catch (error) {
      console.error('Playback error:', error)
      setStatus(`Error: ${error}`)
      setIsPlaying(false)
    }
  }

  const stopStream = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    setIsPlaying(false)
    setStatus('Stopped')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Audio Stream Test</h1>
      
      <div className="max-w-2xl space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Different Streams</h2>
          <div className="space-y-3">
            {testUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => testStream(url)}
                className="block w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                <span className="font-mono text-sm break-all">{url}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <p><strong>URL:</strong> {currentUrl || 'None'}</p>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Playing:</strong> {isPlaying ? 'Yes' : 'No'}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="space-x-4">
            <button
              onClick={stopStream}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Stop Stream
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Audio Element</h2>
          <audio
            ref={audioRef}
            controls
            className="w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      </div>
    </div>
  )
}
