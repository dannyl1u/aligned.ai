'use client'

import { Loader2, Mic } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Groq } from 'groq-sdk'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function ChatPage() {
  const { user, error, isLoading } = useUser()

  const [isRecording, setIsRecording] = useState(false)
  // const [audioFile, setAudioFile] = useState<File | null>(null)
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([])
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      console.log(user)
    }
  }, [user])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        })
        const file = new File([audioBlob], 'recorded_audio.wav', {
          type: 'audio/wav',
        })
        transcribeAudio(file)
        // setAudioFile(
        //   new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' })
        // )
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    } else {
      console.warn('Speech Synthesis not supported in this browser.')
    }
  }

  const transcribeAudio = async (file: File) => {
    setIsTranscribing(true)

    try {
      console.log('Transcribing audio...', process.env.NEXT_PUBLIC_GROQ_API_KEY)
      const client = new Groq({
        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
        dangerouslyAllowBrowser: true,
      })

      const transcriptionResponse = await client.audio.transcriptions.create({
        file: file,
        model: 'distil-whisper-large-v3-en',
        response_format: 'json',
        language: 'en',
        temperature: 0.0,
      })

      const transcription = transcriptionResponse.text || ''
      setMessages((prev) => [...prev, { role: 'user', content: transcription }])

      // Process bot's response
      setTimeout(() => {
        const botResponse = `I heard you say: "${transcription}"`
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: botResponse },
        ])
        speak(botResponse) // Convert text to speech
        setIsTranscribing(false)
      }, 1000)
    } catch (error) {
      console.error('Error transcribing audio:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error transcribing audio. Please try again.',
        },
      ])
      setIsTranscribing(false)
    }
  }

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording()
      // transcribeAudio()
    } else {
      startRecording()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <header className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-2xl font-bold text-primary">VoiceVenture Chat</h1>
      </header>
      <main className="flex-1 overflow-hidden p-6">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isTranscribing && (
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin inline-block" />
              <span className="ml-2">Transcribing...</span>
            </div>
          )}
        </ScrollArea>
      </main>
      <footer className="bg-white shadow-sm py-4 px-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <Button
            onClick={handleVoiceInput}
            className={`w-full ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : ''
            }`}
          >
            {isRecording ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Speaking
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  )
}
