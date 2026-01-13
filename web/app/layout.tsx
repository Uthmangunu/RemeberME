import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';

const manrope = Manrope({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RemeberME - Context Bank for LLMs',
  description: 'Manage and organize your personal context for AI interactions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
