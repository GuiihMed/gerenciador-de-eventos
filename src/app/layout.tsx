import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Gerenciador de Eventos",
  description: "Plataforma Multi-Tenant de Eventos, Palestrantes e Credenciamento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="navy"
          enableSystem={false}
          themes={["light", "dark", "navy"]}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
