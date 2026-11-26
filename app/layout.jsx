import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import ServiceWorker from './ServiceWorker';
import './globals.css';

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'limpio. — Limpiador de texto de WhatsApp',
  description:
    'Quita fechas, horas y nombres de contacto de chats copiados de WhatsApp. Funciona en tu navegador, sin enviar nada.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f4f4f1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
