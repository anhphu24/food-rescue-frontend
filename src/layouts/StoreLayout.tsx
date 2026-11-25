import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StoreSwitchModal } from '../components/StoreSwitchModal';

export const StoreLayout: React.FC = () => {
  const { selectedStore, storeModalOpen, setStoreModalOpen } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/store', label: 'ダッシュボード', icon: 'dashboard', end: true },
    { to: '/store/products', label: '商品マスター', icon: 'inventory_2', end: false },
    { to: '/store/lots', label: 'ロット・在庫管理', icon: 'shelves', end: false },
    { to: '/store/coupons', label: 'クーポン管理', icon: 'sell', end: false },
    { to: '/store/register', label: 'レジ利用確認', icon: 'qr_code_scanner', end: false },
    { to: '/store/settings', label: '店舗設定・スタッフ', icon: 'settings', end: false },
  ];

  const SidebarContent = (
    <>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="p-space-md bg-surface-container-low">
          <div className="flex items-center justify-between mb-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">eco</span>
              <span className="font-headline-md text-headline-md text-on-surface">
                Food Rescue 店舗管理
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
              aria-label="サイドバーを閉じる"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div className="flex items-center justify-between mt-space-xs bg-surface-container-lowest px-space-sm py-space-xs rounded-lg">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                storefront
              </span>
              <span className="font-body-sm text-body-sm text-on-surface font-bold truncate">
                {selectedStore.name}
              </span>
            </div>
            <span className="font-label-badge text-label-badge bg-primary text-on-primary px-space-xs py-0.5 rounded shrink-0">
              {selectedStore.badge}
            </span>
          </div>
        </div>

        <nav className="p-space-md flex flex-col gap-space-xs" aria-label="店舗管理メニュー">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-space-sm px-space-md py-space-sm transition-colors bg-primary-container text-on-primary-container font-bold rounded-xl'
                  : 'flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors'
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-space-md bg-surface-container-low flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-body-sm text-body-sm text-on-surface font-bold truncate">
              田中 健一
            </span>
            <span className="font-label-caption text-label-caption text-on-surface-variant truncate">
              店長・店舗管理者
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-xs">
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false);
              setStoreModalOpen(true);
            }}
            className="flex-1 flex items-center justify-center gap-space-xs py-space-xs px-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-body-sm transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>店舗切替</span>
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-space-xs py-space-xs px-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-body-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>お客様画面</span>
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface">
      {/* Desktop Fixed Left Sidebar (Exact Stitch w-72) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        {SidebarContent}
      </aside>

      {/* Mobile/Tablet Slide-Over Sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-on-background/40 backdrop-blur-xs flex"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="w-72 max-w-[85vw] h-full bg-surface-container-lowest flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Container */}
      <div className="lg:pl-72">
        {/* Top Fixed Console Header */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40">
          <div className="h-16 w-full px-space-md lg:px-space-lg flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm lg:gap-space-md min-w-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-on-surface hover:bg-surface-container cursor-pointer"
                aria-label="サイドメニューを開く"
              >
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>

              <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm truncate">
                <span className="font-bold text-on-surface truncate">{selectedStore.name}</span>
                <span className="text-outline hidden sm:inline">/</span>
                <span className="hidden sm:inline">店舗管理コンソール</span>
              </div>

              <div className="hidden xl:flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-space-xs rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-badge text-label-badge text-on-surface-variant">
                  POS連携: オンライン (同期中) 最終更新 18:45
                </span>
              </div>
            </div>

            <div className="flex items-center gap-space-xs sm:gap-space-md shrink-0">
              <div className="hidden md:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-lowest text-on-surface font-label-badge text-label-badge">
                <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
                <span>営業中 {selectedStore.hours}</span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/store/lots')}
                className="relative p-space-xs rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface cursor-pointer"
                aria-label="通知"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/store/lots')}
                className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-sm sm:px-space-md py-space-xs rounded-xl font-body-sm text-body-sm font-bold shadow-[0_2px_8px_rgba(0,105,72,0.2)] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span className="hidden sm:inline">+ 見切り品・ロット登録</span>
                <span className="sm:hidden">ロット登録</span>
              </button>

              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative pt-16 w-full bg-surface min-h-screen">
          <Outlet />
        </main>
      </div>

      <StoreSwitchModal open={storeModalOpen} onClose={() => setStoreModalOpen(false)} />
    </div>
  );
};
