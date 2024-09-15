'use client'

import { Loader2, Mic } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Groq } from 'groq-sdk'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function ChatPage() {
  const { user, error, isLoading } = useUser()
  const router = useRouter()

  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([{ role: 'assistant', content: 'Hey! Tell me about yourself.' }]) // Initial bot message
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [redirecting, setRedirecting] = useState(false) // New state for redirecting

  useEffect(() => {
    if (user) {
      console.log(user)
    }
  }, [user])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }

    // Check if the chat should terminate after 5 user messages (excluding bot messages)
    const userMessageCount = messages.filter(
      (msg) => msg.role === 'user'
    ).length
    if (userMessageCount >= 5 && !redirecting) {
      saveChatHistoryAndTerminate()
    }
  }, [messages, redirecting])

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
    const rate = 1.4
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate // Set the speaking rate
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
      const updatedMessages: { role: 'user' | 'assistant'; content: string }[] =
        [...messages, { role: 'user', content: transcription }]
      setMessages(updatedMessages)

      // Extract only the user message strings
      const userMessages = updatedMessages
        .filter((msg) => msg.role === 'user')
        .map((msg) => msg.content)

      // Create the ChatRequest payload with just the array of user messages
      const chatRequestPayload = {
        email: user?.email || '', // Use user.email for user_id
        messages: userMessages, // Send only the user messages
      }

      // Send the payload to the FastAPI backend and handle the response
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequestPayload),
      })

      const data = await response.json()

      // Process the response from the FastAPI backend
      const botResponse = data.llm_response || 'Sorry, something went wrong.'
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botResponse },
      ])

      speak(botResponse) // Convert text to speech
      setIsTranscribing(false)
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

  const saveChatHistoryAndTerminate = async () => {
    try {
      setRedirecting(true) // Set redirecting to true to show "Hang on tight!" message
      const chatHistoryPayload = {
        email: user?.email || '',
        messages: messages
          .filter((msg) => msg.role === 'user')
          .map((msg) => msg.content),
      }

      await fetch('http://localhost:8000/save_chat_history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatHistoryPayload),
      })

      // Show "Hang on tight!" message for 3 seconds before redirecting
      setMessages([{ role: 'assistant', content: 'Hang on tight!' }])
      setTimeout(() => {
        router.push('/home')
      }, 1000)
    } catch (error) {
      console.error('Error saving chat history:', error)
    }
  }

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording()
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
