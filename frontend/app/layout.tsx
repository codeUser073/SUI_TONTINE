'use client';
import '@mysten/dapp-kit/dist/index.css';
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/amphora.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Darte - Create your own rotative savings with your pairs</title>
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
