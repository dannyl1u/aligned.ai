'use client'

import { Home, LogOut, Mic, Speech, Users } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const Header: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b bg-gray-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/home" className="flex items-center space-x-2">
              <Mic className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-primary">
                aligned.ai
              </span>
            </Link>
            <Tabs value={pathname} className="w-[400px]">
              <TabsList className="bg-white border border-gray-200 p-1 rounded-md">
                <TabsTrigger
                  value="/home"
                  onClick={() => router.push('/home')}
                  className={`transition-all duration-200 ${
                    isActive('/home')
                      ? 'bg-primary text-primary-foreground shadow-md underline'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </TabsTrigger>
                <TabsTrigger
                  value="/matches"
                  onClick={() => router.push('/matches')}
                  className={`transition-all duration-200 ${
                    isActive('/matches')
                      ? 'bg-primary text-primary-foreground shadow-md underline'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  My Matches
                </TabsTrigger>
                <TabsTrigger
                  value="/chat"
                  onClick={() => router.push('/chat')}
                  className={`transition-all duration-200 ${
                    isActive('/chat')
                      ? 'bg-primary text-primary-foreground shadow-md underline'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Speech className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Link href="/api/auth/logout">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
