import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const C10AuthPage: React.FC = () => {
  const { setLoggedIn } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('佐藤 陽子');
  const [email, setEmail] = useState('yoko.sato@example.jp');
  const [password, setPassword] = useState('foodrescue2025');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedIn(true, mode === 'register' ? name : undefined, email);
    navigate('/mypage');
  };

  return (
    <div className="w-full max-w-md mx-auto px-margin-mobile py-space-xl flex flex-col gap-space-lg">
      {/* Brand Header */}
      <div className="text-center flex flex-col items-center gap-space-xs">
        <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md">
          <span className="material-symbols-outlined text-[32px]">eco</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mt-1">
          {mode === 'login' ? 'Food Rescue にログイン' : '新規会員登録（無料）'}
        </h1>
        <p className="font-body-sm text-on-surface-variant">
          見切り品のAIレシピ保存・レジ提示クーポンの管理がスムーズになります
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md">
        {/* Login / Register Tab Switcher */}
        <div className="grid grid-cols-2 bg-surface-container-low p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg font-body-sm font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg font-body-sm font-bold transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            新規登録
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          {mode === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="font-body-sm font-bold text-on-surface">ニックネーム / お名前</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 佐藤 陽子"
                className="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="font-body-sm font-bold text-on-surface">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.jp"
              className="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-body-sm font-bold text-on-surface">パスワード</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-space-md pr-10 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                aria-label="パスワード表示切替"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-lg font-bold shadow-md transition-colors cursor-pointer"
          >
            {mode === 'login' ? 'ログインして続ける' : '無料でアカウントを作成'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 text-outline font-label-caption">
          <div className="h-px bg-outline-variant/40 flex-1" />
          <span>または外部アカウントで連携</span>
          <div className="h-px bg-outline-variant/40 flex-1" />
        </div>

        {/* Social Auth Buttons */}
        <div className="flex flex-col gap-2">
          {[
            { label: 'LINEアカウントでログイン', bg: 'bg-[#06C755] text-white' },
            { label: 'Googleアカウントで続ける', bg: 'bg-surface-container-low text-on-surface' },
            { label: 'Appleでサインイン', bg: 'bg-on-surface text-surface' },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => {
                setLoggedIn(true);
                navigate('/mypage');
              }}
              className={`w-full py-2.5 rounded-xl font-body-sm font-bold transition-opacity hover:opacity-90 cursor-pointer ${btn.bg}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Member Reward Banner */}
      <div className="bg-primary-fixed/40 rounded-2xl p-space-md flex items-center gap-space-sm">
        <span className="material-symbols-outlined text-primary text-[26px] shrink-0">redeem</span>
        <div>
          <span className="font-body-sm font-bold text-on-primary-fixed block">
            初回登録で「3品セット割 ¥100引」クーポン進呈
          </span>
          <span className="font-label-caption text-on-primary-fixed-variant">
            加盟スーパーの店頭レジで今日からすぐにご利用いただけます
          </span>
        </div>
      </div>

      {/* SSL & Staff Portal Footer */}
      <div className="text-center flex flex-col items-center gap-2 font-label-caption text-on-surface-variant">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px] text-primary">lock</span>
          <span>通信はSSLにより暗号化保護されています</span>
        </div>
        <Link to="/store" className="text-primary font-bold hover:underline">
          店舗スタッフの方はこちら（店舗管理システムへ）
        </Link>
      </div>
    </div>
  );
};
