import { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import tools from './tools';
import { categorizedTools } from './categories';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import NotFound from './components/NotFound';
import Seo from './components/Seo';
import CommandPalette from './components/CommandPalette';
import Dashboard from './components/dashboard/Dashboard';
import { Spinner } from './components/ui';

function SidebarCategory({ category, currentPath, open, onToggle }) {
  const { t } = useTranslation();

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-fg hover:bg-muted transition-colors"
      >
        {t(category.nameKey)}
        <ChevronDown size={15} className={`text-fg-tertiary transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <ul className="m-0 list-none space-y-0.5 p-0">
          {category.items.map(tool => {
            const active = currentPath === tool.path;
            return (
              <li key={tool.path}>
                <Link
                  to={tool.path}
                  onMouseEnter={() => tool.preload?.()}
                  className={`block rounded-lg py-1.5 pl-7 pr-3 text-[13px] no-underline transition-colors ${
                    active
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-fg-secondary hover:bg-muted hover:text-fg'
                  }`}
                >
                  {t(tool.nameKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// 当前路由所属的分类 key
const categoryOfPath = (pathname) =>
  categorizedTools.find(c => c.items.some(tool => tool.path === pathname))?.key;

function Sidebar({ theme, setTheme }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  // 手风琴：一次只展开一个分类，默认展开当前工具所属分类
  const [openKey, setOpenKey] = useState(() => categoryOfPath(pathname) || categorizedTools[0].key);

  // 路由变化（如点击 logo 回默认工具）时展开对应分类
  useEffect(() => {
    const key = categoryOfPath(pathname);
    if (key) setOpenKey(key);
  }, [pathname]);

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-paper">
      <Link to="/" className="flex items-center gap-2 px-4 py-4 no-underline hover:opacity-80">
        <img src="/toolbox-icon.svg" alt="Toolbox Icon" width="22" height="22" />
        <span className="text-base font-bold text-fg">{t('Multi-function Toolbox')}</span>
      </Link>

      <nav className="grow space-y-2 overflow-y-auto px-2 pb-4">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          className="mb-1 flex w-full cursor-pointer items-center justify-between rounded-lg border border-line bg-bg px-3 py-1.5 text-sm text-fg-tertiary transition-colors hover:text-fg"
        >
          {t('commandPalette.hint')}
          <kbd className="rounded border border-line bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
        {/* 工作台固定入口 */}
        <Link
          to="/"
          className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm no-underline transition-colors ${
            pathname === '/'
              ? 'bg-primary/10 font-medium text-primary'
              : 'text-fg-secondary hover:bg-muted hover:text-fg'
          }`}
        >
          <LayoutGrid size={15} className="shrink-0" />
          {t('Dashboard')}
        </Link>
        {categorizedTools.map(category => (
          <SidebarCategory
            key={category.key}
            category={category}
            currentPath={pathname}
            open={openKey === category.key}
            onToggle={() => setOpenKey(k => (k === category.key ? null : category.key))}
          />
        ))}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-3">
        <LanguageSwitcher />
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </div>
    </aside>
  );
}

// 为每个工具生成SEO关键词
const getToolKeywords = (path) => {
  const tool = tools.find(tool => tool.path === path);
  return (tool && tool.keywords) || 'online tools,free tools,developer tools,在线工具,开发工具';
};

function App() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const currentLang = ({ zh: 'zh-CN', en: 'en-US' })[i18n.language] || 'zh-CN';

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar theme={theme} setTheme={setTheme} />
        <CommandPalette />

        <main className="min-w-0 flex-1 px-8 py-6">
          <Suspense fallback={
            <div className="flex min-h-96 items-center justify-center">
              <Spinner size={40} />
            </div>
          }>
            <Routes>
              <Route path="/" element={
                <>
                  <Seo
                    title={t('dashboard.pageTitle')}
                    description={t('dashboard.pageDescription')}
                    canonical="https://toolifyhub.top/"
                    lang={currentLang}
                  />
                  <Dashboard />
                </>
              } />
              {tools.map(tool => (
                <Route
                  key={tool.path}
                  path={tool.path}
                  element={
                    <>
                      <Seo
                        title={t(tool.pageTitleKey || tool.nameKey)}
                        description={t(tool.pageDescriptionKey || tool.descKey)}
                        canonical={`https://toolifyhub.top${tool.path}`}
                        keywords={getToolKeywords(tool.path)}
                        toolPath={tool.path}
                        lang={currentLang}
                      />
                      <tool.Component />
                    </>
                  }
                />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
