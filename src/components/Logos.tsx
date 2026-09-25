import React from 'react';

export const SmabaCrestLogo: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 120 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Shield Base */}
    <path
      d="M60 4C90 4 112 16 114 36C114 84 85 116 60 134C35 116 6 84 6 36C8 16 30 4 60 4Z"
      fill="#DC2626"
    />
    <path
      d="M60 9C86 9 106 19 108 37C108 79 82 108 60 125C38 108 12 79 12 37C14 19 34 9 60 9Z"
      fill="white"
    />

    {/* Header Text Arc Background */}
    <path
      d="M20 28C32 20 46 16 60 16C74 16 88 20 100 28"
      stroke="#1E3A8A"
      strokeWidth="0.5"
      fill="none"
      id="crestTextArc"
    />
    <text fill="#B91C1C" fontSize="8.5" fontWeight="900" textAnchor="middle">
      <textPath href="#crestTextArc" startOffset="50%">
        SMA N 1 BATANGAN
      </textPath>
    </text>

    {/* Center Torch & Flame */}
    {/* Outer yellow flame */}
    <path
      d="M60 38C52 48 46 60 52 74C56 68 59 64 60 58C62 65 67 69 70 74C75 60 69 48 60 38Z"
      fill="#F59E0B"
    />
    {/* Inner red flame */}
    <path
      d="M60 46C55 54 52 62 56 71C58 67 59 64 60 60C61 64 63 67 65 71C69 62 66 54 60 46Z"
      fill="#DC2626"
    />
    {/* Open Book */}
    <path
      d="M60 84C50 78 36 78 26 84L28 98C38 92 50 92 60 98C70 92 82 92 92 98L94 84C84 78 70 78 60 84Z"
      fill="#059669"
    />
    <path
      d="M60 86C51 81 38 81 29 86L30 96C39 91 51 91 60 96C69 91 81 91 90 96L91 86C82 81 69 81 60 86Z"
      fill="#10B981"
    />
    {/* Center page spine line */}
    <path d="M60 84V98" stroke="white" strokeWidth="1.5" />

    {/* Gear / Base element */}
    <path
      d="M48 76C48 73 72 73 72 76L69 82H51L48 76Z"
      fill="#D97706"
    />

    {/* Ribbon Banner at Bottom */}
    <path
      d="M22 108L32 103C48 107 72 107 88 103L98 108L93 118C77 122 43 122 27 118L22 108Z"
      fill="#1E293B"
    />
    <path
      d="M26 109C46 113 74 113 94 109L90 116C72 120 48 120 30 116L26 109Z"
      fill="#0F172A"
    />
    <text
      x="60"
      y="115"
      fill="#F8FAFC"
      fontSize="7.5"
      fontWeight="900"
      letterSpacing="1.5"
      textAnchor="middle"
    >
      KUMANDANG
    </text>
  </svg>
);

export const PijarEmblemLogo: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 140 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer Ring */}
    <circle cx="70" cy="70" r="67" fill="#0A2540" stroke="#F59E0B" strokeWidth="2.5" />
    <circle cx="70" cy="70" r="62" fill="#0E3359" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
    <circle cx="70" cy="70" r="50" fill="white" />

    {/* Circular Text Paths */}
    <path
      id="topArcPijar"
      d="M20 70 A50 50 0 0 1 120 70"
      fill="none"
    />
    <text fill="#FFFFFF" fontSize="6.2" fontWeight="900" letterSpacing="0.4">
      <textPath href="#topArcPijar" startOffset="50%" textAnchor="middle">
        PUSAT INFORMASI DAN JARINGAN BELAJAR
      </textPath>
    </text>

    <path
      id="bottomArcPijar"
      d="M120 70 A50 50 0 0 1 20 70"
      fill="none"
    />
    <text fill="#FDE68A" fontSize="6.8" fontWeight="900" letterSpacing="0.8">
      <textPath href="#bottomArcPijar" startOffset="50%" textAnchor="middle">
        SMA NEGERI 1 BATANGAN
      </textPath>
    </text>

    {/* Lightbulb outline (Orange/Circuit glowing) */}
    <path
      d="M70 32C58 32 49 41 49 53C49 61 54 68 58 72L59 78C59 80 61 82 63 82H77C79 82 81 80 81 78L82 72C86 68 91 61 91 53C91 41 82 32 70 32Z"
      fill="#FFFBEB"
      stroke="#F97316"
      strokeWidth="2.5"
    />

    {/* Circuit board tree inside lightbulb */}
    <circle cx="70" cy="45" r="2.5" fill="#F97316" />
    <path d="M70 47V60" stroke="#F97316" strokeWidth="2" />
    <circle cx="62" cy="50" r="2" fill="#0284C7" />
    <path d="M62 52L66 57" stroke="#0284C7" strokeWidth="1.5" />
    <circle cx="78" cy="50" r="2" fill="#0284C7" />
    <path d="M78 52L74 57" stroke="#0284C7" strokeWidth="1.5" />

    <circle cx="58" cy="62" r="2" fill="#EA580C" />
    <path d="M58 64L64 67" stroke="#EA580C" strokeWidth="1.5" />
    <circle cx="82" cy="62" r="2" fill="#EA580C" />
    <path d="M82 64L76 67" stroke="#EA580C" strokeWidth="1.5" />

    {/* Center connector */}
    <path d="M70 60V74" stroke="#F97316" strokeWidth="2.5" />

    {/* Lamp Pedestal Base (Blue/Teal) */}
    <path d="M62 82H78V85H62V82Z" fill="#1E3A8A" />
    <path d="M63 86H77V89H63V86Z" fill="#2563EB" />
    <path d="M65 90H75V93H65V90Z" fill="#1D4ED8" />

    {/* Blue base badge with PIJAR text */}
    <rect x="52" y="74" width="36" height="7" rx="3" fill="#0284C7" />
    <text x="70" y="79" fill="white" fontSize="5.5" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
      PIJAR SMABA
    </text>
  </svg>
);
