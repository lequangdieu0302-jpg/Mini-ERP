import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ERPProvider } from '@/context/erp-context';
import { WMSProvider } from '@/context/wms-context';
import Navbar from '@/components/shell/navbar';
import Sidebar from '@/components/shell/sidebar';
import AIChatbot from '@/components/ai-chat/chat';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Dieule ERP — Construction & Contracting Management',
  description: 'Enterprise resource planning for construction, contracting and material supply.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dieule ERP',
  },
  icons: {
    apple: '/icon-192.png',
    icon: '/icon-512.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#09090b',
    'msapplication-tap-highlight': 'no',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <ERPProvider>
          <WMSProvider>
            {/* Top header navigation */}
            <Navbar />
            
            {/* Main workspace layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Context-aware Left Sidebar */}
              <Suspense fallback={<div className="hidden md:block w-15 md:w-56 shrink-0 bg-slate-50 dark:bg-slate-950" />}>
                <Sidebar />
              </Suspense>
              
              {/* Scrollable page body */}
              <main className="flex-1 overflow-y-auto min-w-0 relative pb-20 md:pb-0">
                {children}
              </main>
            </div>

            {/* Context-aware AI Chatbot Assistant */}
            <AIChatbot />
          </WMSProvider>
        </ERPProvider>

        {process.env.NODE_ENV === 'production' ? (
          <Script id="sw-register" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                const register = () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('SW registered:', reg.scope); })
                    .catch(function(err) { console.log('SW registration failed:', err); });
                };
                if (document.readyState === 'complete') {
                  register();
                } else {
                  window.addEventListener('load', register);
                }
              }
            `}
          </Script>
        ) : (
          <Script id="sw-unregister" strategy="beforeInteractive">
            {`
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  if (registrations.length > 0) {
                    for (let registration of registrations) {
                      registration.unregister();
                    }
                    if ('caches' in window) {
                      caches.keys().then(function(keys) {
                        return Promise.all(keys.map(function(key) { return caches.delete(key); }));
                      }).then(function() {
                        console.log('SW and caches cleared in development mode. Reloading...');
                        window.location.reload();
                      });
                    } else {
                      console.log('SW cleared. Reloading...');
                      window.location.reload();
                    }
                  }
                });
              }
            `}
          </Script>
        )}
      </body>
    </html>
  );
}
