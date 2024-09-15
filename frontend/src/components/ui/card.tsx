'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Globe, Linkedin, Mail } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

type CardProps = {
  name: string,
  score?: number,
  profileImage: string
  keywords: string[]
  description: string
  email: string
  linkedin: string
  website: string
}

const Card: React.FC<CardProps> = ({
  name,
  score,
  profileImage,
  keywords,
  description,
  email,
  linkedin,
  website,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    if (score !== undefined) {
      const timer = setTimeout(() => {
        setAnimatedScore(score)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [score])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 max-w-md mx-auto">
      {score !== undefined ? (
        <div className="flex items-center mb-4">
          <img className="w-24 h-24 rounded-full mr-4" src={profileImage} alt={`${name}'s profile`}/>
          <div className="flex-grow">
            <h2 className="text-xl font-semibold mb-2">{name}</h2>
            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full ${getScoreColor(animatedScore)} transition-all duration-1000 ease-out`}
                style={{ width: `${animatedScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Match Score: {animatedScore}%</p>
          </div>
        </div>
      ) : (
        <>
          <img className="w-24 h-24 rounded-full mx-auto mb-4" src={profileImage} alt={`${name}'s profile`}/>
          <h2 className="text-xl font-semibold text-center mb-2">{name}</h2>
        </>
      )}

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {keywords.map((keyword, index) => (
          <span
            key={index}
            className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
          >
            {keyword}
          </span>
        ))}
      </div>

      <p className="text-gray-700 text-center mb-4">{description}</p>

      <div className="flex justify-center space-x-4 mb-4">
        <a href={`mailto:${email}`} aria-label="Email">
          <Mail className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </a>
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <Linkedin className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </a>
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Website"
        >
          <Globe className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </a>
        <a
          href="https://docs.google.com/document/d/1xt4QYihIuLaRdzGxOwUMMtmRl3emNe9waYi_C3mcLWE/edit"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Web Summit"
        >
          <Image
            src="/web-summit.png"
            alt="Web Summit Logo"
            width={34}
            height={17}
            className="object-contain"
          />
        </a>
      </div>
    </div>
  )
}

export default Card