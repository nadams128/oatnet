import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Oatnet',
  description: 'An inventory application for FNB Boston',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-oatnet-background">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
