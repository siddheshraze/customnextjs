'use client';
import * as React from 'react';
import CssBaseline from '@mui/joy/CssBaseline';
import NextAppDirEmotionCacheProvider from './emotioncache';
import {
  experimental_extendTheme as materialExtendTheme,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';
const materialTheme = materialExtendTheme();
export default function Themeregistry({ children }: { children: React.ReactNode }) {
  
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'joy' }}>
      <MaterialCssVarsProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }} defaultMode={"dark"} defaultColorScheme={"dark"}>
        <JoyCssVarsProvider defaultMode={"dark"} defaultColorScheme={"dark"}>
          <CssBaseline />
          {children}
        </JoyCssVarsProvider>
      </MaterialCssVarsProvider>
    </NextAppDirEmotionCacheProvider>
  );
}