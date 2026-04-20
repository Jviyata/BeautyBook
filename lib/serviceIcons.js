// SVG icons for beauty services
export const ServiceIcons = {
  Nails: () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 50C25 35 35 25 50 25C65 25 75 35 75 50L75 75H25L25 50Z" fill="currentColor" />
      <circle cx="50" cy="40" r="5" fill="white" opacity="0.3" />
    </svg>
  ),
  Hair: () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15C60 15 68 23 68 33V70C68 75 65 80 60 82H40C35 80 32 75 32 70V33C32 23 40 15 50 15Z" fill="currentColor" />
      <path d="M45 35C45 32 43 30 40 30" stroke="white" strokeWidth="2" opacity="0.4" />
      <path d="M55 35C55 32 57 30 60 30" stroke="white" strokeWidth="2" opacity="0.4" />
    </svg>
  ),
  Lashes: () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="12" fill="currentColor" />
      <circle cx="50" cy="50" r="6" fill="white" />
      <path d="M35 45L30 35M50 40L50 25M65 45L70 35" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M35 55L30 65M50 60L50 75M65 55L70 65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  Brows: () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 40Q40 30 50 35Q60 30 75 40" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="60" r="8" fill="currentColor" />
    </svg>
  ),
  Makeup: () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="25" width="60" height="50" rx="8" fill="currentColor" opacity="0.3" />
      <path d="M35 45L45 55L65 35" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="75" r="8" fill="currentColor" />
    </svg>
  ),
  Tan: () => (
    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" fill="currentColor" />
      <circle cx="50" cy="50" r="18" fill="white" opacity="0.4" />
      <g opacity="0.5">
        <circle cx="40" cy="40" r="3" fill="white" />
        <circle cx="60" cy="40" r="3" fill="white" />
        <circle cx="50" cy="60" r="3" fill="white" />
      </g>
    </svg>
  ),
}

// Color themes for each service
export const ServiceColors = {
  Nails: { bg: 'from-[#e8b4d4] to-[#f5d5e8]', dark: '#d4537e' },
  Hair: { bg: 'from-[#dbb5a8] to-[#f5e0d5]', dark: '#a0644f' },
  Lashes: { bg: 'from-[#c9c1d6] to-[#e8e0f0]', dark: '#7a6b8f' },
  Brows: { bg: 'from-[#d4c1a8] to-[#e8d9c8]', dark: '#8b6f47' },
  Makeup: { bg: 'from-[#e8b4c8] to-[#f5d0e0]', dark: '#c85a7e' },
  Tan: { bg: 'from-[#f0c894] to-[#f5e0c8]', dark: '#c89d4e' },
}
