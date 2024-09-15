'use client';

import React, { useEffect, useState } from 'react';
import { useUser, UserProvider } from '@auth0/nextjs-auth0/client';
import { Loader2 } from 'lucide-react';
import Card from '../../components/ui/card';  // Import the Card component
import Header from '@/components/ui/header';

const MatchesPageContent: React.FC = () => {
  const { user, error, isLoading } = useUser();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      // try {
      //   const response = await fetch('http://localhost:8000/matches');  // Fetch match data from the API
      //   const data = await response.json();
      //   setMatches(data.matches);  // Assume the matches are in the "matches" array in the response
      //   setLoading(false);
      // } catch (err) {
      //   console.error('Failed to fetch matches:', err);
      //   setLoading(false);
      // }

      const matches = [
        {
        profileImage: "",
        keywords: ['Happy', 'Sad', 'Excited'],
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        email: "cameron@gmail.com",
        linkedin: "cameron beneteau",
        website: "cameronbeneteau.com"
      },
      {
        profileImage: "",
        keywords: ['Happy', 'Sad', 'Excited'],
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        email: "cameron@gmail.com",
        linkedin: "cameron beneteau",
        website: "cameronbeneteau.com"
      }
    ]

      setMatches(matches)
      setLoading(false);
    };

    fetchMatches();
  }, []);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading matches...</span>
      </div>
    );
  }

  if (error) {
    return <div>Error loading user data: {error.message}</div>;
  }

  return (
    <div>
      <Header pageName="Matches"/>
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {matches.length === 0 ? (
          <p className="text-center text-gray-500">No matches found.</p>
        ) : (
          matches.map((match, index) => (
            <Card
              key={index}
              profileImage={match.profileImage}  // Assuming the API returns this
              keywords={match.keywords}  // Assuming keywords is an array
              description={match.description}  // Assuming description of the match
              email={match.email}  // Email contact
              linkedin={match.linkedin}  // LinkedIn profile URL
              website={match.website}  // Website URL
            />
          ))
        )}
      </div>
    </div>
    </div>
  );
};

export default function MatchesPage() {
  return (
    <UserProvider>
      <MatchesPageContent />
    </UserProvider>
  );
}
