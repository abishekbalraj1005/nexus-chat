import { ThemeProvider } from '@/components/ThemeProvider';
import SmoothScroll from '@/components/SmoothScroll';
import NotificationProvider from '@/components/NotificationProvider';
import './globals.css';

export const metadata = {
  title: 'Nexus Cinematic - Anti-Gravity Chat',
  description: 'Ultra-premium cinematic messaging platform.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="antialiased selection:bg-purple-500/30">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <NotificationProvider>
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
