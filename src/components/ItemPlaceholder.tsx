import React from 'react';

interface ItemPlaceholderProps {
  className?: string;
  itemType?: 'lost' | 'found' | 'verification';
}
export default function ItemPlaceholder({ className = '', itemType = 'lost' }: ItemPlaceholderProps) {
  const colors = itemType === 'lost' 
    ? { primary: '#3B82F6', secondary: '#60A5FA', tertiary: '#93C5FD', bg: '#EFF6FF' }
    : { primary: '#10B981', secondary: '#34D399', tertiary: '#6EE7B7', bg: '#ECFDF5' };

  return (
    <svg 
      className={className}
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.bg} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.bg} stopOpacity="1" />
        </linearGradient>
        
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.primary} />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background with gradient */}
      <rect width="200" height="200" fill="url(#bgGradient)"/>
      
      {/* Decorative circles */}
      <circle cx="30" cy="30" r="40" fill={colors.tertiary} opacity="0.1">
        <animate attributeName="r" values="40;45;40" dur="4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="170" cy="170" r="50" fill={colors.secondary} opacity="0.1">
        <animate attributeName="r" values="50;55;50" dur="5s" repeatCount="indefinite"/>
      </circle>
      
      {/* Main icon group */}
      <g transform="translate(100, 100)">
        {/* Image frame with shadow */}
        <rect 
          x="-35" 
          y="-30" 
          width="70" 
          height="60" 
          rx="8" 
          fill="white"
          opacity="0.9"
          filter="drop-shadow(0 4px 12px rgba(0,0,0,0.1))"
        />
        
        <rect 
          x="-35" 
          y="-30" 
          width="70" 
          height="60" 
          rx="8" 
          fill="none"
          stroke="url(#iconGradient)" 
          strokeWidth="2.5"
          filter="url(#glow)"
        >
          <animate 
            attributeName="stroke-opacity" 
            values="1;0.6;1" 
            dur="3s" 
            repeatCount="indefinite"
          />
        </rect>
        
        {/* Mountain landscape */}
        <path 
          d="M-25 10 L-12 -8 L2 10" 
          stroke={colors.primary} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
          opacity="0.8"
        >
          <animate 
            attributeName="opacity" 
            values="0.8;1;0.8" 
            dur="2s" 
            repeatCount="indefinite"
          />
        </path>
        
        <path 
          d="M-5 10 L12 -12 L28 10" 
          stroke={colors.secondary} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        >
          <animate 
            attributeName="opacity" 
            values="0.7;0.9;0.7" 
            dur="2.5s" 
            repeatCount="indefinite"
          />
        </path>
        
        {/* Sun with rays */}
        <g opacity="0.9">
          <circle cx="-18" cy="-15" r="5" fill={colors.primary}>
            <animate 
              attributeName="r" 
              values="5;5.5;5" 
              dur="3s" 
              repeatCount="indefinite"
            />
          </circle>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = -18 + Math.cos(rad) * 7;
            const y1 = -15 + Math.sin(rad) * 7;
            const x2 = -18 + Math.cos(rad) * 9;
            const y2 = -15 + Math.sin(rad) * 9;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={colors.secondary}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              >
                <animate 
                  attributeName="opacity" 
                  values="0.6;0.3;0.6" 
                  dur="2s" 
                  begin={`${i * 0.1}s`}
                  repeatCount="indefinite"
                />
              </line>
            );
          })}
        </g>
      </g>
      
      {/* Bottom label */}
      <text 
        x="100" 
        y="165" 
        textAnchor="middle" 
        fill={colors.primary}
        fontSize="12"
        fontWeight="500"
        opacity="0.7"
      >
        No Image
      </text>
    </svg>
  );
}