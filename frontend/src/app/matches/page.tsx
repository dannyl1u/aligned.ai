'use client'

import React, { useEffect, useState } from 'react'
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client'
import Card from '../../components/ui/card'
import Header from '@/components/ui/header'
import { Loader2 } from 'lucide-react'

interface UserData {
  userType: string
  matchType: string
}

const MatchesPageContent: React.FC = () => {
  const { user, error, isLoading } = useUser()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    document.title = 'aligned.ai | Matches'
  }, [])

  useEffect(() => {
    if (user?.email) {
      const fetchData = async () => {
        try {
          // Fetch user data
          const userResponse = await fetch(`http://localhost:8000/user_data/${user.email}`)
          const userData = await userResponse.json()
          if (userData.status === 'success') {
            setUserData(userData.user)
          }

          // Fetch matches
          const matchesResponse = await fetch('http://localhost:8000/matches', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email })
          })
          const matchesData = await matchesResponse.json()
          setMatches(matchesData.matches)
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }
  }, [user?.email])

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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Your Matches</h1>
        <p className="text-xl text-center mb-8 text-gray-600">
          We think these {userData?.matchType}s would be great to have a coffee with
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {matches.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">No matches found.</p>
          ) : (
            matches.map((match, index) => (
              <Card
                key={index}
                name={match.name}
                score={match.score}
                profileImage={match.profileImage}
                keywords={match.keywords}
                description={match.description}
                email={match.email}
                linkedin={match.linkedin}
                website={match.website}
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