'use client'

import { LogOut, Mic, Search, Settings, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Button } from '@/components/ui/button'
import Header from '@/components/ui/header'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useEffect } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function HomePage() {
  const { user, error, isLoading } = useUser()

  useEffect(() => {
    document.title = 'VoiceVenture | Home';
    if (user) {
      console.log(user)
    }
  }, [user])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="search">
          <TabsContent value="search" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Find Founders and VCs</h2>
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
              <h3 className="text-xl font-semibold mb-4">Recent Searches</h3>
              <ul className="space-y-2">
                <li>Tech founders in San Francisco</li>
                <li>VCs specializing in AI startups</li>
                <li>Seed-stage investors for fintech</li>
              </ul>
            </div>
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
