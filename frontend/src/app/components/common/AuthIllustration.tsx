import React from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

/**
 * Original vector illustration for the auth brand panel: a monitoring
 * dashboard with a glucose trend inside the target band, a glucometer,
 * a blood drop, a pill and a pulse line. Drawn in white tints so it sits
 * on the teal gradient in both light and dark mode.
 */
export function AuthIllustration({ sx }: { sx?: SxProps<Theme> }) {
  // Unique gradient ids: a second (display:none) copy on the page would otherwise break url(#id)
  const uid = React.useId().replace(/:/g, '');
  const id = (name: string) => `${name}-${uid}`;
  return (
    <Box
      sx={{
        width: '100%',
        '& .float-a': { animation: 'dmFloat 6s ease-in-out infinite' },
        '& .float-b': { animation: 'dmFloat 7s ease-in-out infinite reverse' },
        '@keyframes dmFloat': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        ...(sx as object),
      }}
    >
      <svg viewBox="0 0 440 320" width="100%" height="100%" role="img" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={id('dmCard')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={id('dmDrop')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FDA4AF" />
            <stop offset="1" stopColor="#E11D48" />
          </linearGradient>
          <linearGradient id={id('dmLine')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#A5F3FC" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>

        {/* Soft background blobs */}
        <circle cx="330" cy="70" r="70" fill="#fff" opacity="0.05" />
        <circle cx="90" cy="250" r="56" fill="#fff" opacity="0.05" />

        {/* Pulse line */}
        <path
          d="M0 268 H120 l12 -26 l14 52 l14 -70 l14 44 h40 M268 268 H440"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.28"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dashboard card */}
        <g className="float-a">
          <rect x="120" y="36" width="220" height="196" rx="22" fill={`url(#${id('dmCard')})`} stroke="#fff" strokeOpacity="0.3" />
          {/* header */}
          <circle cx="146" cy="62" r="9" fill="#fff" opacity="0.55" />
          <rect x="162" y="56" width="64" height="7" rx="3.5" fill="#fff" opacity="0.6" />
          <rect x="162" y="67" width="40" height="5" rx="2.5" fill="#fff" opacity="0.3" />
          <rect x="282" y="54" width="40" height="18" rx="9" fill="#4ADE80" opacity="0.85" />
          {/* target band */}
          <rect x="140" y="110" width="180" height="58" rx="6" fill="#4ADE80" opacity="0.18" />
          <line x1="140" y1="110" x2="320" y2="110" stroke="#FBBF24" strokeOpacity="0.7" strokeDasharray="4 4" />
          <line x1="140" y1="168" x2="320" y2="168" stroke="#FB7185" strokeOpacity="0.7" strokeDasharray="4 4" />
          {/* glucose curve */}
          <path
            d="M144 150 C162 120, 176 128, 190 138 S218 160, 236 126 S266 100, 282 132 S306 150, 316 128"
            fill="none"
            stroke={`url(#${id('dmLine')})`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {[[144, 150, '#4ADE80'], [190, 138, '#4ADE80'], [236, 126, '#4ADE80'], [270, 104, '#FBBF24'], [316, 128, '#4ADE80']].map(([x, y, c]) => (
            <circle key={`${x}`} cx={x as number} cy={y as number} r="5" fill={c as string} stroke="#0E4F63" strokeWidth="2" />
          ))}
          {/* bottom stats */}
          <rect x="140" y="186" width="54" height="30" rx="8" fill="#fff" opacity="0.14" />
          <rect x="203" y="186" width="54" height="30" rx="8" fill="#fff" opacity="0.14" />
          <rect x="266" y="186" width="54" height="30" rx="8" fill="#fff" opacity="0.14" />
          <rect x="149" y="194" width="26" height="6" rx="3" fill="#fff" opacity="0.7" />
          <rect x="212" y="194" width="30" height="6" rx="3" fill="#4ADE80" opacity="0.9" />
          <rect x="275" y="194" width="22" height="6" rx="3" fill="#fff" opacity="0.7" />
          <rect x="149" y="205" width="36" height="4" rx="2" fill="#fff" opacity="0.3" />
          <rect x="212" y="205" width="36" height="4" rx="2" fill="#fff" opacity="0.3" />
          <rect x="275" y="205" width="36" height="4" rx="2" fill="#fff" opacity="0.3" />
        </g>

        {/* Glucometer */}
        <g className="float-b">
          <rect x="44" y="132" width="92" height="124" rx="20" fill="#fff" opacity="0.94" />
          <rect x="56" y="146" width="68" height="46" rx="10" fill="#0E7490" />
          <rect x="66" y="158" width="30" height="12" rx="3" fill="#A5F3FC" />
          <rect x="66" y="175" width="18" height="5" rx="2.5" fill="#A5F3FC" opacity="0.6" />
          <circle cx="110" cy="164" r="5" fill="#4ADE80" />
          <circle cx="72" cy="214" r="9" fill="#0E7490" opacity="0.15" />
          <circle cx="108" cy="214" r="9" fill="#0E7490" opacity="0.15" />
          <rect x="80" y="250" width="20" height="26" rx="3" fill="#fff" opacity="0.85" />
          <rect x="85" y="262" width="10" height="10" rx="2" fill="#FB7185" opacity="0.8" />
        </g>

        {/* Blood drop */}
        <g className="float-a">
          <path d="M376 118 C376 118 352 146 352 162 a24 24 0 0 0 48 0 C400 146 376 118 376 118Z" fill={`url(#${id('dmDrop')})`} />
          <path d="M366 160 a10 10 0 0 0 8 12" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Pill */}
        <g className="float-b" transform="rotate(-32 362 236)">
          <rect x="332" y="222" width="64" height="28" rx="14" fill="#fff" opacity="0.92" />
          <path d="M364 222 h18 a14 14 0 0 1 0 28 h-18Z" fill="#A78BFA" />
        </g>

        {/* Sparkles */}
        <path d="M84 70 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4Z" fill="#fff" opacity="0.5" />
        <path d="M394 40 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3Z" fill="#fff" opacity="0.4" />
      </svg>
    </Box>
  );
}
