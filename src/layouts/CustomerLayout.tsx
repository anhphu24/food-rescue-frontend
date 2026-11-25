import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StoreSwitchModal } from '../components/StoreSwitchModal';

const STITCH_LOGO_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBlsn4_3t_7oZW1pfzbgEyyS0_e-3W_Dgh9EqnYSjhdJSdT8KdvBVqwrykznUPIglB7T62ZFktb50RJEx1Xz9fbCRSTG98l6gLl4WqPVgeyC-7RPMoQ-WYkxc5nXLQy4MAiSxhnSf07VfetpHp5YAHs12IRqiUARALGiiV-iLrFa0efzolOlwEo-pfr6wpppQd6t-sHltjzgC8JL4wHgeebaIp6p61hbYW43_pjgdIm';

export const CustomerLayout: React.FC = () => {
  const { selectedStore, setStoreModalOpen, storeModalOpen, coupons } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeCouponCount = coupons.filter((c) => c.status === 'ACQUIRED').length;

  const navItems = [
    { to: '/', label: 'ホーム', end: true },
    { to: '/products', label: '食材を探す', end: false },
    { to: '/ai-recipes', label: 'AIレシピ', end: false },
    { to: '/my-coupons', label: 'マイクーポン', end: false },
    { to: '/mypage', label: 'マイページ', end: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-body-md text-on-surface antialiased">
      {/* Fixed Customer Top Navigation Header - Exact Stitch Design */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 w-full px-margin-mobile lg:px-margin flex items-center justify-between gap-space-md">
          {/* Left: Brand Logo + Active Store Pill */}
          <div className="flex items-center gap-space-md min-w-0">
            <Link to="/" className="flex items-center gap-space-sm flex-shrink-0">
              <img
                alt="Food Rescue Logo"
                className="h-8 w-auto object-contain"
                src={STITCH_LOGO_URL}
              />
              <span className="font-headline-md text-headline-md text-primary tracking-tight">
                Food Rescue
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setStoreModalOpen(true)}
              className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors cursor-pointer max-w-[220px]"
              title="利用店舗を切り替える"
            >
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
                storefront
              </span>
              <span className="font-body-sm text-body-sm font-medium truncate">
                {selectedStore.name}
              </span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">
                arrow_drop_down
              </span>
            </button>
          </div>

          {/* Center: Main Navigation Links - Exact Stitch Active Pill */}
          <nav
            className="hidden xl:flex items-center gap-space-xs"
            aria-label="メインナビゲーション"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive
                    ? 'px-space-md py-space-xs transition-colors bg-primary-container text-on-primary-container font-bold rounded-lg font-body-md text-body-md'
                    : 'px-space-md py-space-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-body-md text-body-md rounded-lg'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Store Admin Link + Avatar + Mobile Menu Toggle */}
          <div className="flex items-center gap-space-sm shrink-0">
            <Link
              to="/store"
              className="hidden md:inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-surface-container-highest text-on-surface hover:bg-surface-variant transition-colors font-body-sm text-body-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">badge</span>
              <span>店舗管理システムへ (スタッフ用)</span>
            </Link>

            <Link
              to="/auth"
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary-container transition-colors"
              title="ログイン・アカウント"
              aria-label="ログイン・アカウント"
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="xl:hidden p-1.5 rounded-lg text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="メニューを開く"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-surface-container-lowest border-t border-outline-variant/20 shadow-xl px-margin-mobile py-space-md flex flex-col gap-space-sm">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setStoreModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-space-md py-space-sm rounded-xl bg-surface-container-low text-on-surface cursor-pointer"
            >
              <span className="flex items-center gap-space-xs font-body-sm font-bold">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  storefront
                </span>
                {selectedStore.name}
              </span>
              <span className="font-label-badge text-label-badge text-primary">店舗切替</span>
            </button>

            <div className="grid grid-cols-2 gap-space-xs">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? 'px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary-container font-body-sm font-bold flex items-center justify-between'
                      : 'px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm font-medium flex items-center justify-between'
                  }
                >
                  <span>{item.label}</span>
                  {item.to === '/my-coupons' && activeCouponCount > 0 ? (
                    <span className="bg-secondary text-on-secondary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {activeCouponCount}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>

            <Link
              to="/store"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-highest text-on-surface font-body-sm font-bold"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">badge</span>
              <span>店舗管理システムへ (スタッフ用)</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="w-full pt-16 bg-background min-h-screen flex-1">
        <div className="flex flex-col w-full">
          <Outlet />
        </div>
      </main>

      {/* Customer Footer - Exact Stitch Design */}
      <footer className="w-full bg-surface-container-low text-on-surface-variant mt-space-xl">
        <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-xl">
          <div className="bg-surface-container-lowest rounded-xl p-space-md mb-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0">
                info
              </span>
              <div className="flex flex-col gap-space-xs">
                <p className="font-headline-md text-body-lg text-on-surface">
                  ご利用ガイド（お買い物にあたってのお願い）
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Food Rescueは店頭での食品ロス削減を応援するアプリです。
                  <strong>
                    店舗で商品を選び、レジでクーポンをご提示ください。※予約・取り置き・事前決済サービスではありません。
                  </strong>{' '}
                  店頭の在庫状況はリアルタイムで変動するため、売り切れの際はご容赦ください。
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-lg mb-space-lg">
            <div className="space-y-space-xs">
              <div className="flex items-center gap-space-xs text-primary font-headline-md text-headline-md">
                <span className="material-symbols-outlined">eco</span>
                <span>Food Rescue</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                スーパーの食品ロスをAIとテクノロジーでおいしく解決。地域とお店をつなぐサステナブルな買い物支援プラットフォームです。
              </p>
            </div>

            <div>
              <p className="font-headline-md text-body-md text-on-surface mb-space-sm">サービス</p>
              <ul className="space-y-space-xs font-body-sm text-body-sm">
                <li>
                  <Link className="hover:text-primary transition-colors" to="/products">
                    値引き食材・見切り品検索
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" to="/ai-recipes">
                    食品ロス削減AIレシピ
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" to="/my-coupons">
                    レジ提示用マイクーポン
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-headline-md text-body-md text-on-surface mb-space-sm">
                インフォメーション
              </p>
              <ul className="space-y-space-xs font-body-sm text-body-sm">
                <li>
                  <Link className="hover:text-primary transition-colors" to="/mypage">
                    食品ロス削減への取り組み
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" to="/">
                    ご利用ガイド・店頭ルール
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" to="/mypage">
                    会社概要
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" to="/mypage">
                    プライバシーポリシー
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-headline-md text-body-md text-on-surface mb-space-sm">
                加盟店・パートナー
              </p>
              <ul className="space-y-space-xs font-body-sm text-body-sm">
                <li>
                  <Link
                    className="flex items-center gap-space-xs text-primary hover:text-primary-container transition-colors font-medium"
                    to="/store"
                  >
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    <span>店舗スタッフログイン</span>
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary transition-colors" to="/store/settings">
                    新規加盟スーパーのお問い合わせ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-space-md border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-space-sm font-body-sm text-body-sm">
            <p>© 2025 Food Rescue Japan. All rights reserved.</p>
            <p className="text-label-caption text-on-surface-variant">
              本サービスは店頭購買支援専用です（オンライン決済・事前取り置き不可）
            </p>
          </div>
        </div>
      </footer>

      <StoreSwitchModal open={storeModalOpen} onClose={() => setStoreModalOpen(false)} />
    </div>
  );
};
