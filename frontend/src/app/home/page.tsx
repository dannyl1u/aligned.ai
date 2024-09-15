'use client'

import { LogOut, Mic, Search, Settings, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Button } from '@/components/ui/button'
import Header from '@/components/ui/header'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, error, isLoading } = useUser()
  const [userType, setUserType] = useState('VC')
  const [matchType, setMatchType] = useState('VC')
  const router = useRouter()

  useEffect(() => {
    if (user) {
      console.log(user)
    }
  }, [user])

  const goToChat = () => {
    console.log(user)
    router.push('/chat')
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="search">
          <TabsContent value="search" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Tells us about yourself</h2>
            <div className="max-w-xl">
              <form className="flex space-x-2">
                <Input
                  className="flex-1"
                  placeholder="Describe what you're looking for..."
                />
                <Button type="submit">
                  <Mic className="h-4 w-4 mr-2" />
                  Speak
                </Button>
              </form>
              
            </div>
            <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">I am a</h2>
            <button
                      type="button"
                      className={`flex-1 px-4 py-2 focus:outline-none ${
                        userType === 'VC'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-foreground'
                      } hover:bg-opacity-100 active:bg-opacity-100`}
                      onClick={() => setUserType('VC')}
                    >
                      VC
                    </button>
                    <button
                      type="button"
                      className={`flex-1 px-4 py-2 focus:outline-none ${
                        userType === 'Founder'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-foreground'
                      } hover:bg-opacity-100 active:bg-opacity-100`}
                      onClick={() => setUserType('Founder')}
                    >
                      Founder
                    </button>
            </div>
            <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">I'm looking to match with a</h2>
            <button
                      type="button"
                      className={`flex-1 px-4 py-2 focus:outline-none ${
                        matchType === 'VC'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-foreground'
                      } hover:bg-opacity-100 active:bg-opacity-100`}
                      onClick={() => setMatchType('VC')}
                    >
                      VC
                    </button>
                    <button
                      type="button"
                      className={`flex-1 px-4 py-2 focus:outline-none ${
                        matchType === 'Founder'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-foreground'
                      } hover:bg-opacity-100 active:bg-opacity-100`}
                      onClick={() => setMatchType('Founder')}
                    >
                      Founder
                    </button>
            </div>
            <div className='mt-10'>
            <Button 
                type="submit" 
                onClick={() => goToChat()}
              >
                <span>Let's get started! →</span>
              </Button>
            </div>
            {/* <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Recent Searches</h3>
              <ul className="space-y-2">
                <li>Tech founders in San Francisco</li>
                <li>VCs specializing in AI startups</li>
                <li>Seed-stage investors for fintech</li>
              </ul>
            </div> */}
          </TabsContent>
          <TabsContent value="network" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Your Network</h2>
            <p>Content for the Network tab will go here.</p>
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p>Content for the Settings tab will go here.</p>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t py-4 text-center text-sm text-gray-500">
        © 2023 VoiceVenture. All rights reserved.
      </footer>
    </div>
  )
}
