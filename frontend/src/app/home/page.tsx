'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import Card from '@/components/ui/card'
import Header from '@/components/ui/header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mic } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@auth0/nextjs-auth0/client'

interface UserData {
  profileImage: string
  keywords: string[]
  description: string
  email: string
  linkedin: string
  website: string
  webSummitProfile: string
  userType: string
  matchType: string
}

export default function HomePage() {
  const { user, error, isLoading } = useUser()
  const [userType, setUserType] = useState('')
  const [matchType, setMatchType] = useState('')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [website, setWebsite] = useState('')
  const [webSummitProfile, setWebSummitProfile] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (user && user.email) {
      fetchUserData(user.email)
    }
  }, [user])

  const fetchUserData = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:8000/user_data/${email}`)
      console.log('response:', response)

      if (response.ok) {
        const data = await response.json()

        if (data.status === 'success') {
          console.log('User exists:', data.user)

          // Fetch the full conversation from ChromaDB
          const conversationResponse = await fetch(
            `http://localhost:8000/get_full_user_conversation/${email}`
          )
          let fullDescription = ''

          if (conversationResponse.ok) {
            const conversationData = await conversationResponse.json()
            if (
              conversationData.status === 'success' &&
              conversationData.user_conversations.length > 0
            ) {
              fullDescription = conversationData.user_conversations.join(' ') // Join the messages into a single string
            } else {
              console.log(
                'No full conversation found, using default description'
              )
              fullDescription = `I am a ${data.user?.userType} looking to connect with ${data.user?.matchType}s`
            }
          } else {
            console.log(
              'Error fetching full conversation, using default description'
            )
            fullDescription = `I am a ${data.user?.userType} looking to connect with ${data.user?.matchType}s`
          }

          setUserData({
            profileImage: data.user?.picture || '',
            keywords: ['Startup', 'Tech', data.user?.userType || ''],
            description: fullDescription,
            email: email || data.user?.email || '',
            linkedin: data.user?.linkedin,
            website: data.user?.website,
            webSummitProfile: data.user?.webSummitProfile,
            userType: data.user?.userType,
            matchType: data.user?.matchType,
          })
        } else {
          console.log('User does not exist, showing modal')
          setShowModal(true)
        }
      } else {
        console.log('showing modal')
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setShowModal(true)
    }
  }

  const handleSubmitUserType = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      user_email: user?.email || '',
      given_name: user?.given_name || '',
      family_name: user?.family_name || '',
      name: user?.name || '',
      picture: user?.picture || '',
      linkedin,
      website,
      webSummitProfile,
      userType: userType,
      matchType: matchType,
    }

    try {
      console.log('submitting profile:', payload)
      const response = await fetch('http://localhost:8000/submit_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Profile submitted successfully:', data)
        setShowModal(false)
        setUserData({
          profileImage: user?.picture || '',
          keywords: ['Startup', 'Tech', userType],
          description: `I am a ${userType} looking to connect with ${matchType}s`,
          email: email || user?.email || '',
          linkedin,
          website,
          webSummitProfile,
        })
      } else {
        console.error('Error submitting profile:', response.statusText)
      }
    } catch (error) {
      console.error('Error submitting profile:', error)
    }
  }

  const goToChat = () => {
    console.log(user)
    router.push('/chat')
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  console.log('userdata is', userData)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {userData ? (
          <Card {...userData} />
        ) : (
          <div className="flex justify-center items-center h-screen">
            <Mic className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading user data...</span>
          </div>
        )}
      </main>
      <footer className="border-t py-4 text-center text-sm text-gray-500">
        © 2023 VoiceVenture. All rights reserved.
      </footer>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px] bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Complete Your Profile
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Please provide some information about yourself to get started.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitUserType} className="space-y-4">
            <div>
              <Label
                htmlFor="userType"
                className="block text-sm font-medium text-gray-700"
              >
                I am a
              </Label>
              <div className="mt-1 flex space-x-4">
                <Button
                  type="button"
                  variant={userType === 'VC' ? 'default' : 'outline'}
                  onClick={() => setUserType('VC')}
                >
                  VC
                </Button>
                <Button
                  type="button"
                  variant={userType === 'Founder' ? 'default' : 'outline'}
                  onClick={() => setUserType('Founder')}
                >
                  Founder
                </Button>
              </div>
            </div>
            <div>
              <Label
                htmlFor="matchType"
                className="block text-sm font-medium text-gray-700"
              >
                I'm looking to match with a
              </Label>
              <div className="mt-1 flex space-x-4">
                <Button
                  type="button"
                  variant={matchType === 'VC' ? 'default' : 'outline'}
                  onClick={() => setMatchType('VC')}
                >
                  VC
                </Button>
                <Button
                  type="button"
                  variant={matchType === 'Founder' ? 'default' : 'outline'}
                  onClick={() => setMatchType('Founder')}
                >
                  Founder
                </Button>
              </div>
            </div>
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full"
                required
              />
            </div>
            <div>
              <Label
                htmlFor="linkedin"
                className="block text-sm font-medium text-gray-700"
              >
                LinkedIn Profile
              </Label>
              <Input
                type="url"
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="mt-1 block w-full"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <Label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700"
              >
                Website
              </Label>
              <Input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 block w-full"
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <Label
                htmlFor="webSummitProfile"
                className="block text-sm font-medium text-gray-700"
              >
                Web Summit Profile
              </Label>
              <Input
                type="url"
                id="webSummitProfile"
                value={webSummitProfile}
                onChange={(e) => setWebSummitProfile(e.target.value)}
                className="mt-1 block w-full"
                placeholder="https://websummit.com/profile/yourprofile"
              />
            </div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
