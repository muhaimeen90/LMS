"use client";

import { Inter, Roboto_Mono, Lexend_Deca } from 'next/font/google';

// Define default sans and mono fonts
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

// Load dyslexic friendly font from Google Fonts
// Lexend Deca is designed for improved readability and is dyslexia-friendly
export const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend-deca',
});
