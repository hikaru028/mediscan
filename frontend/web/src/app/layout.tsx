import type { Metadata } from "next";
import Head from 'next/head';
import { Manrope } from "next/font/google";
import '@/app/globals.css';
import ClientLayout from './template';
import ThemeToggler from '../components/themes/ThemeToggler'

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mediscan",
  description: "Mediscan is a mobile/web application that aims to solve the problem of inefficient product searches and stock checks. The expected outcome is an AI-driven application that uses image recognition for quick, accurate product identification, offering relevant information via images.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/images/favicon.png" />
      </Head>
      <body className={manrope.className}>
        <ClientLayout>
          <ThemeToggler />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
