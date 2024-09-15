import {
  Home,
  LogOut,
  Mic,
  Search,
  Settings,
  Speech,
  Users,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs' // Adjust import path based on your project

import { Button } from '@/components/ui/button' // Adjust import path based on your project
import Link from 'next/link'
import React from 'react'

// Define the prop type for the component
type HeaderProps = {
  pageName?: string
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/home" className="flex items-center space-x-2">
              <Mic className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-primary">
                VoiceVenture
              </span>
            </Link>
            <Tabs className="w-[400px]">
              <TabsList>
                <TabsTrigger value="home">
                  <Home className="h-4 w-4 mr-2" />
                  <Link href="/home">Home</Link>
                </TabsTrigger>
                <TabsTrigger value="network">
                  <Users className="h-4 w-4 mr-2" />
                  <Link href="/matches">Connect</Link>
                </TabsTrigger>
                <TabsTrigger value="chat">
                  <Speech className="h-4 w-4 mr-2" />
                  <Link href="/chat">Chat</Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Link href="/api/auth/logout">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
