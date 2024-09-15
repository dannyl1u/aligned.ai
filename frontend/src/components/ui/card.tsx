import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Globe, Linkedin, Mail } from 'lucide-react'

import Image from 'next/image'
import React from 'react'

type CardProps = {
  name: string,
  profileImage: string
  keywords: string[]
  description: string
  email: string
  linkedin: string
  website: string
}

const Card: React.FC<CardProps> = ({
  name,
  profileImage,
  keywords,
  description,
  email,
  linkedin,
  website,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 max-w-md mx-auto">
      {/* Profile Image */}
      <img className="w-24 h-24 rounded-full mx-auto mb-4" src={profileImage} alt={`${name}'s profile`}/>

      {/* Name */}
      <h2 className="text-xl font-semibold text-center mb-2">{name}</h2>

      {/* Keywords/Interests */}
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

      {/* Description */}
      <p className="text-gray-700 text-center mb-4">{description}</p>

      {/* Social Icons */}
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
