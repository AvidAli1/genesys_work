import "./globals.css"
import Navigation from "@/components/navigation"

export const metadata = {
  title: "Genesys Voicebot SaaS",
  description: "Multi-tenant RAG-based SaaS Voicebot",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <Navigation />
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  )
}
