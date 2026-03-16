import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
})
// ... resto del archivo

export const metadata: Metadata = {
  title: "Prinesa — Agencia Creativa",
  description:
    "Agencia de contenido visual especializada en storytelling estratégico. Convertimos ideas en experiencias memorables.",
  openGraph: {
    title: "Prinesa — Agencia Creativa",
    description: "Contenido visual que conecta marcas con personas.",
    siteName: "Prinesa",
    locale: "es_AR",
    type: "website",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={poppins.variable}>
      <body>{children}</body>
    </html>
  )
}