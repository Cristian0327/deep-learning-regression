import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Academia Ladrillera Santafé - Capacitación Profesional",
  description: "Plataforma de cursos y capacitaciones para el personal de Ladrillera Santafé. Aprende, crece y certifícate.",
  keywords: "cursos, capacitación, ladrillera santafé, educación, formación",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="es" className="overflow-x-hidden">
      <body className={`${poppins.variable} font-sans overflow-x-hidden`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
