import React from 'react';
import { Mail, Linkedin, Globe } from 'lucide-react';

type CardProps = {
  profileImage: string;
  keywords: string[];
  description: string;
  email: string;
  linkedin: string;
  website: string;
};

const Card: React.FC<CardProps> = ({ profileImage, keywords, description, email, linkedin, website }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 max-w-md mx-auto">
      {/* Profile Image */}
      <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4" />

      {/* Keywords/Interests */}
      <div className="flex justify-center space-x-2 mb-4">
        {keywords.map((keyword, index) => (
          <span key={index} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm">
            {keyword}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-gray-700 text-center mb-4">{description}</p>

      {/* Social Icons */}
      <div className="flex justify-center space-x-4">
        <a href={`mailto:${email}`} aria-label="Email">
          <Mail className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </a>
        <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <Linkedin className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </a>
        <a href={website} target="_blank" rel="noopener noreferrer" aria-label="Website">
          <Globe className="w-6 h-6 text-gray-600 hover:text-gray-800" />
        </a>
      </div>
    </div>
  );
};

export default Card;
