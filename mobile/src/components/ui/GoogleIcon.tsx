import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path fill="#4285F4" d="M15.68 8.18c0-.58-.05-1.13-.15-1.66H8v3.14h4.3c-.19 1-.75 1.85-1.6 2.42v2h2.6c1.52-1.4 2.38-3.47 2.38-5.9z" />
      <Path fill="#34A853" d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.6-2c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.4-4.47-3.3H.83v2.06C2.15 14.2 4.87 16 8 16z" />
      <Path fill="#FBBC05" d="M3.53 9.53A4.8 4.8 0 0 1 3.27 8c0-.53.09-1.05.26-1.53V4.4H.83A8 8 0 0 0 0 8c0 1.29.31 2.51.83 3.6l2.7-2.07z" />
      <Path fill="#EA4335" d="M8 3.18c1.17 0 2.23.4 3.06 1.19l2.3-2.3C11.96.9 10.15.18 8 .18 4.87.18 2.15 1.98.83 4.4l2.7 2.07C4.16 4.58 5.92 3.18 8 3.18z" />
    </Svg>
  );
}
