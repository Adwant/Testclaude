import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import '@fontsource/onest/500.css';
import '@fontsource/onest/600.css';
import './styles/tokens.css';
import './styles/app.css';
import './styles/home.css';
import './styles/screens.css';
import { AppProvider } from './lib/store';
import { App } from './App';

// iOS Safari: не даём «резиновому» скроллу тянуть весь документ — скроллятся только экраны.
document.addEventListener(
  'touchmove',
  (e) => {
    const t = e.target as HTMLElement | null;
    if (!t?.closest('.screen__scroll, .sheet__body, .carousel, .ruler, .dialog')) e.preventDefault();
  },
  { passive: false },
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <App />
      </AppProvider>
    </MotionConfig>
  </StrictMode>,
);
