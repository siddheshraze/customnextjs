import "@/styles/globals.css";
import {Providers} from "./providers";
import React from "react";
import {PlotsProvider} from "@/app/plotcontext";
export default function RootLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <>
      <html lang="en" suppressContentEditableWarning suppressHydrationWarning className={"dark"} >
      <head>
        <title>ForestGEO Data Entry</title>
      </head>
      <PlotsProvider>
        <Providers>
          {children}
        </Providers>
      </PlotsProvider>
      </html>
    </>
  );
}
