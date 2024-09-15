'use client'

import { Loader2, Mic, Rocket } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client'

import { Button } from '@/components/ui/button'
import { Groq } from 'groq-sdk'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRouter } from 'next/navigation'

function ChatPageContent() {
  const { user, error, isLoading } = useUser()
  const router = useRouter()

  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([{ role: 'assistant', content: 'Hey! Tell me about yourself.' }])
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance[]>([]) // To store all speech utterances

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
      utterance.rate = rate
      utteranceRef.current.push(utterance) // Store the utterance for later cancellation
      window.speechSynthesis.speak(utterance)
    } else {
      console.warn('Speech Synthesis not supported in this browser.')
    }
  }

  const cancelSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Cancel all speech
      utteranceRef.current.forEach((utterance) => {
        utterance.onend = null // Prevent triggering any end event
      })
      utteranceRef.current = [] // Clear the reference array
    }
  }

  const transcribeAudio = async (file: File) => {
    setIsTranscribing(true)

    try {
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

      // Check if this is the 5th user message
      const userMessageCount = updatedMessages.filter(
        (msg) => msg.role === 'user'
      ).length
      if (userMessageCount === 5) {
        setMessages(updatedMessages)
        setShowConfirmation(true)
        cancelSpeech() // Stop any ongoing speech synthesis
        return // Exit early to show confirmation screen
      }

      setMessages(updatedMessages)

      const userMessages = updatedMessages
        .filter((msg) => msg.role === 'user')
        .map((msg) => msg.content)

      const chatRequestPayload = {
        email: user?.email || '',
        messages: userMessages,
      }

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequestPayload),
      })

      const data = await response.json()

      const botResponse = data.llm_response || 'Sorry, something went wrong.'
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: botResponse },
      ])

      speak(botResponse)
    } catch (error) {
      console.error('Error transcribing audio:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error transcribing audio. Please try again.',
        },
      ])
    } finally {
      setIsTranscribing(false)
    }
  }

  const saveChatHistoryAndRedirect = async () => {
    try {
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

      setTimeout(() => {
        router.push('/home')
      }, 100)
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
        {showConfirmation ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Rocket className="w-24 h-24 text-primary animate-bounce mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              We&apos;ve finished analyzing your personality profile!
            </h2>
            <p className="text-lg mb-8">
              We&apos;re excited to share these insights.
            </p>
            <Button onClick={saveChatHistoryAndRedirect} size="lg">
              See my results!
            </Button>
          </div>
        ) : (
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
        )}
      </main>
      {!showConfirmation && (
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
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <UserProvider>
      <ChatPageContent />
    </UserProvider>
  )
}
