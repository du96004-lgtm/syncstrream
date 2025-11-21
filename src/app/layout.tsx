import type { Metadata } from 'next';
import { Poppins, PT_Sans, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';

const fontHeadline = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-headline',
});

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const fontCode = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-code',
});

export const metadata: Metadata = {
  title: 'SyncStream',
  description: 'Listen to music together in sync and chat at the same time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          'font-body antialiased',
          fontHeadline.variable,
          fontBody.variable,
          fontCode.variable
        )}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
