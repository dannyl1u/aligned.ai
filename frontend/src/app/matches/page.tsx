'use client'

import React, { useEffect, useState } from 'react'
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client'

import Card from '../../components/ui/card'
import Header from '@/components/ui/header'
import { Loader2 } from 'lucide-react'

// Import the Card component

const MatchesPageContent: React.FC = () => {
  const { user, error, isLoading } = useUser()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'VoiceVenture | Matches';
  })

  useEffect(() => {

    if (user?.email){

      // Define an async function inside useEffect
      const fetchData = async () => {
        
        const matchesPayload = {
          email: user?.email || '',
        }
        
        try {
          // Simulating an API call with a timeout
          const response = await fetch('http://localhost:8000/matches', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(matchesPayload)
          });
          
          const data = await response.json();
          console.log(data.matches);
          setMatches(data.matches);  // Set the result to the state
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);  // Set loading to false when the API call is done
        }
      };

    // Call the async function
    fetchData();
    }
  }, [user?.email]);  // Empty dependency array means this effect runs once after initial render

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading matches...</span>
      </div>
    )
  }

  if (error) {
    return <div>Error loading user data: {error.message}</div>
  }

  return (
    <div>
      <Header />
      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
          {matches.length === 0 ? (
            <p className="text-center text-gray-500">No matches found.</p>
          ) : (
            matches.map((match, index) => (
              <Card
                key={index}
                name={match.name}
                profileImage={match.profileImage} // Assuming the API returns this
                keywords={match.keywords} // Assuming keywords is an array
                description={match.description} // Assuming description of the match
                email={match.email} // Email contact
                linkedin={match.linkedin} // LinkedIn profile URL
                website={match.website} // Website URL
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function MatchesPage() {
  return (
    <UserProvider>
      <MatchesPageContent />
    </UserProvider>
  )
}
