import React from 'react';
import Link from 'next/link';
import { Mic, Search, Users, Settings, LogOut } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Adjust import path based on your project
import { Button } from '@/components/ui/button'; // Adjust import path based on your project

// Define the prop type for the component
type HeaderProps = {
    pageName?: string;
  };
  
const Header: React.FC<HeaderProps> = ({ pageName }) => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/home" className="flex items-center space-x-2">
              <Mic className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-primary">
                VoiceVenture {pageName}
              </span>
            </Link>
            <Tabs defaultValue="search" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="search">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </TabsTrigger>
                <TabsTrigger value="network">
                  <Users className="h-4 w-4 mr-2" />
                  <Link href="/chat">
                    Chat
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Link href="/api/auth/logout">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
