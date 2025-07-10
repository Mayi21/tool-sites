import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LiquidGlass from 'liquid-glass-react'
import { useTranslation } from 'react-i18next'
import './App.css'

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate()
  const features = [
    { path: '/uuid', title: t('uuid'), desc: t('uuid_desc') },
    { path: '/base64', title: t('base64'), desc: t('base64_desc') },
    { path: '/compare', title: t('compare'), desc: t('compare_desc') },
    { path: '/timestamp', title: t('timestamp'), desc: t('timestamp_desc') },
    { path: '/ipgen', title: t('ipgen'), desc: t('ipgen_desc') },
    { path: '/password', title: t('password'), desc: t('password_desc') },
    { path: '/unicode', title: t('unicode'), desc: t('unicode_desc') },
  ];
  return (
    <div className="feature-menu-container">
      {features.map(f => (
        <div key={f.path} className="feature-card" onClick={() => navigate(f.path)}>
          <LiquidGlass
            displacementScale={64}
            blurAmount={0.18}
            cornerRadius={24}
            padding="32px"
            overLight={true}
            saturation={180}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 16px 0 rgba(100,108,255,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.06)',
              background: 'rgba(255,255,255,0.28)',
              backdropFilter: 'blur(18px) saturate(1.2)',
              transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
            }}
          >
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </LiquidGlass>
        </div>
      ))}
    </div>
  )
}

function Placeholder({ title }) {
  return <div style={{ marginTop: 80, fontSize: 24, color: '#888' }}>{title} 页面开发中...</div>
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const { t } = useTranslation();
  const toggle = () => {
    setDark(d => {
      document.documentElement.setAttribute('data-theme', !d ? 'dark' : 'light')
      return !d
    })
  }
  return (
    <button className="theme-toggle" onClick={toggle}>{dark ? t('theme_dark') : t('theme_light')}</button>
  )
}

function LangToggle() {
  const { i18n, t } = useTranslation();
  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
  };
  return (
    <button className="lang-toggle" onClick={toggleLang}>{t('lang')}</button>
  )
}

function App() {
  const { t } = useTranslation();
  return (
    <div>
      <nav className="navbar">
        <span className="site-title">{t('title')}</span>
        <div className="navbar-actions">
          <ThemeToggle />
          <LangToggle />
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/uuid" element={<Placeholder title={t('uuid')} />} />
        <Route path="/base64" element={<Placeholder title={t('base64')} />} />
        <Route path="/compare" element={<Placeholder title={t('compare')} />} />
        <Route path="/timestamp" element={<Placeholder title={t('timestamp')} />} />
        <Route path="/ipgen" element={<Placeholder title={t('ipgen')} />} />
        <Route path="/password" element={<Placeholder title={t('password')} />} />
        <Route path="/unicode" element={<Placeholder title={t('unicode')} />} />
      </Routes>
    </div>
  )
}

export default App 