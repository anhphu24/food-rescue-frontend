import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const C09MyPage: React.FC = () => {
  const {
    user,
    updateUserAddress,
    togglePrioritizeNearby,
    setLoggedIn,
    selectedStore,
    coupons,
    recipes,
    setStoreModalOpen,
  } = useApp();
  const navigate = useNavigate();

  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState(user.address);
  const [savedNotice, setSavedNotice] = useState(false);

  const activeCoupons = coupons.filter((c) => c.status === 'ACQUIRED');
  const usedCoupons = coupons.filter((c) => c.status === 'USED');
  const savedRecipes = recipes.filter((r) => r.saved);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserAddress(addressDraft);
    setEditingAddress(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2600);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col gap-space-lg">
      {/* Profile Hero Card */}
      <section className="bg-gradient-to-r from-primary via-primary-container to-tertiary text-on-primary rounded-2xl p-space-lg shadow-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-16 h-16 rounded-2xl bg-on-primary/20 backdrop-blur-sm flex items-center justify-center text-on-primary font-headline-lg shrink-0">
            {user.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-primary-fixed text-on-primary-fixed font-label-badge px-2.5 py-0.5 rounded-full">
                {user.rank}
              </span>
              <span className="font-label-caption text-primary-fixed">ID: {user.memberId}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg mt-0.5">{user.name} さん</h1>
            <p className="font-body-sm text-on-primary-container/90">
              よく利用する店舗: <strong>{selectedStore.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={() => setStoreModalOpen(true)}
            className="px-space-md py-2 rounded-xl bg-on-primary/15 hover:bg-on-primary/25 text-on-primary font-body-sm font-bold transition-colors cursor-pointer"
          >
            マイ店舗を変更
          </button>
          <Link
            to="/my-coupons"
            className="px-space-md py-2 rounded-xl bg-surface-container-lowest text-primary font-body-sm font-bold shadow-sm hover:bg-surface-container-low transition-colors"
          >
            マイクーポン ({activeCoupons.length})
          </Link>
        </div>
      </section>

      {/* Main 12-Col Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Main Content (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Eco Impact Dashboard */}
          <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">eco</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  あなたの食品ロス削減・節約インパクト
                </h2>
              </div>
              <span className="font-label-caption text-outline">累計実績</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md items-center">
              {/* SVG Progress Ring */}
              <div className="bg-surface-container-low rounded-2xl p-space-md flex items-center gap-space-md">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-high"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.8"
                    />
                    <path
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="78, 100"
                      strokeLinecap="round"
                      strokeWidth="3.8"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-label-numeric-md font-bold text-primary">
                      {user.rescuedMealsCount}
                    </span>
                    <span className="font-label-caption text-outline">食救済</span>
                  </div>
                </div>
                <div>
                  <span className="font-body-sm font-bold text-on-surface block">レスキュー数</span>
                  <span className="font-label-caption text-on-surface-variant">
                    プラチナまであと{user.nextRankRemaining}食
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-space-md flex flex-col gap-1">
                <span className="font-label-caption text-on-surface-variant">CO2排出削減量</span>
                <span className="font-headline-xl text-primary font-label-numeric-lg">
                  {user.co2SavedKg}
                  <span className="text-body-md font-bold ml-1">kg</span>
                </span>
                <span className="font-label-caption text-tertiary font-bold">
                  杉の木 約2本分の年間吸収量
                </span>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-space-md flex flex-col gap-1">
                <span className="font-label-caption text-on-surface-variant">累計おトク節約額</span>
                <span className="font-headline-xl text-secondary font-label-numeric-lg">
                  ¥{user.totalMoneySavedYen.toLocaleString()}
                </span>
                <span className="font-label-caption text-on-surface-variant">
                  見切り値引き＋セット割合計
                </span>
              </div>
            </div>
          </section>

          {/* Shopping Reference Address Section (Strict In-Store Discovery Only, NO Delivery) */}
          <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">home_pin</span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    お買い物基準住所（近隣スーパー検索用）
                  </h2>
                  <p className="font-label-caption text-on-surface-variant">
                    ※近隣店舗の優先表示のみに使用します（配送・配達サービスには使用しません）
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddressDraft(user.address);
                  setEditingAddress((v) => !v);
                }}
                className="px-space-md py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-body-sm font-bold transition-colors self-start sm:self-auto cursor-pointer"
              >
                {editingAddress ? '編集を閉じる' : '住所を編集'}
              </button>
            </div>

            {savedNotice && (
              <div className="bg-tertiary-fixed/50 text-on-tertiary-fixed px-space-md py-2 rounded-xl font-body-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>お買い物基準住所を更新しました。近くのスーパー一覧に反映されます。</span>
              </div>
            )}

            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
              <div className="flex items-start justify-between gap-space-sm flex-wrap">
                <div>
                  <span className="font-label-badge bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {user.address.label}
                  </span>
                  <div className="font-body-md font-bold text-on-surface mt-1">
                    〒{user.address.postalCode} {user.address.prefecture}
                    {user.address.city}
                    {user.address.street} {user.address.building}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-space-md">
                <div>
                  <span className="font-body-sm font-bold text-on-surface block">
                    登録住所から近い店舗を優先表示する
                  </span>
                  <span className="font-label-caption text-on-surface-variant">
                    ホーム画面・店舗一覧で距離が近い加盟スーパーを上位に表示します
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={user.prioritizeNearbyByAddress}
                    onChange={(e) => togglePrioritizeNearby(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>

            {editingAddress && (
              <form
                onSubmit={handleSaveAddress}
                className="bg-surface-container-low/60 border border-outline-variant/30 rounded-xl p-space-md grid grid-cols-1 sm:grid-cols-2 gap-space-sm"
              >
                <div className="flex flex-col gap-1">
                  <label className="font-label-caption font-bold text-on-surface-variant">
                    郵便番号
                  </label>
                  <input
                    type="text"
                    value={addressDraft.postalCode}
                    onChange={(e) =>
                      setAddressDraft({ ...addressDraft, postalCode: e.target.value })
                    }
                    className="bg-surface-container-lowest px-3 py-2 rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caption font-bold text-on-surface-variant">
                    都道府県
                  </label>
                  <input
                    type="text"
                    value={addressDraft.prefecture}
                    onChange={(e) =>
                      setAddressDraft({ ...addressDraft, prefecture: e.target.value })
                    }
                    className="bg-surface-container-lowest px-3 py-2 rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caption font-bold text-on-surface-variant">
                    市区町村
                  </label>
                  <input
                    type="text"
                    value={addressDraft.city}
                    onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })}
                    className="bg-surface-container-lowest px-3 py-2 rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caption font-bold text-on-surface-variant">
                    町名・番地
                  </label>
                  <input
                    type="text"
                    value={addressDraft.street}
                    onChange={(e) => setAddressDraft({ ...addressDraft, street: e.target.value })}
                    className="bg-surface-container-lowest px-3 py-2 rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingAddress(false)}
                    className="px-space-md py-2 rounded-xl bg-surface-container text-on-surface-variant font-body-sm font-bold cursor-pointer"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-space-lg py-2 rounded-xl bg-primary text-on-primary font-body-sm font-bold cursor-pointer"
                  >
                    基準住所を保存
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Saved AI Recipes */}
          <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                保存したAIレシピ（{savedRecipes.length}件）
              </h2>
              <Link to="/ai-recipes" className="font-body-sm text-primary font-bold hover:underline">
                もっと探す →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              {savedRecipes.map((rec) => (
                <Link
                  key={rec.id}
                  to={`/recipe-set/${rec.id}`}
                  className="bg-surface-container-low rounded-xl overflow-hidden hover:shadow-sm transition-all flex flex-col"
                >
                  <img
                    src={rec.imageUrl}
                    alt={rec.title}
                    className="w-full h-28 object-cover"
                  />
                  <div className="p-space-sm">
                    <span className="font-label-caption text-secondary font-bold">
                      セット割 -¥{rec.setDiscountYen}
                    </span>
                    <div className="font-body-sm font-bold text-on-surface line-clamp-2 mt-0.5">
                      {rec.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Redemption History */}
          <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              最近の店頭レスキュー履歴
            </h2>
            <div className="flex flex-col gap-2">
              {usedCoupons.map((cp) => (
                <div
                  key={cp.id}
                  className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between gap-space-sm"
                >
                  <div className="min-w-0">
                    <div className="font-body-sm font-bold text-on-surface truncate">
                      {cp.title}
                    </div>
                    <div className="font-label-caption text-on-surface-variant">
                      {cp.storeName} ・ {cp.usedAt || '利用済'} ・ 伝票 {cp.txNumber || 'TX-98412'}
                    </div>
                  </div>
                  <span className="font-label-numeric-md text-primary font-bold shrink-0">
                    -¥{cp.discountAmountYen}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar (4 cols) - Exact Stitch C09 Account Settings, Support & Quick Tip */}
        <aside className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[22px]">
                manage_accounts
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">アカウント設定</h3>
            </div>
            <div className="space-y-space-xs">
              {[
                {
                  icon: 'lock',
                  title: 'パスワード・ログイン管理',
                  sub: 'セキュリティ設定',
                  action: () => navigate('/auth'),
                },
                {
                  icon: 'store',
                  title: 'よく行く店舗の設定',
                  sub: '現在 1店舗 登録 (最大3店舗)',
                  action: () => setStoreModalOpen(true),
                },
                {
                  icon: 'notifications_active',
                  title: '通知・タイムセール設定',
                  sub: '見切り品・AI献立プッシュ ON',
                  action: () => setSavedNotice(true),
                },
                {
                  icon: 'no_meals',
                  title: 'アレルゲン・苦手な食材',
                  sub: 'AI献立提案の自動最適化',
                  action: () => navigate('/ai-recipes'),
                },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={item.action}
                  className="w-full text-left group flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <div>
                      <span className="font-body-md text-body-md text-on-surface font-medium block">
                        {item.title}
                      </span>
                      <span className="font-label-caption text-label-caption text-on-surface-variant">
                        {item.sub}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg shadow-sm space-y-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[22px]">
                help_center
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">サポート＆ヘルプ</h3>
            </div>
            <div className="space-y-space-xs font-body-sm text-body-sm">
              {[
                { icon: 'local_convenience_store', label: '店頭でのご利用ガイド', to: '/' },
                { icon: 'quiz', label: 'よくあるご質問 (FAQ)', to: '/' },
                { icon: 'mail', label: 'お問い合わせフォーム', to: '/store/settings' },
                { icon: 'policy', label: '利用規約・プライバシーポリシー', to: '/' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low text-on-surface transition-colors"
                >
                  <span className="flex items-center gap-space-xs font-medium">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    chevron_right
                  </span>
                </Link>
              ))}
            </div>
            <div className="pt-space-xs">
              <button
                type="button"
                onClick={() => {
                  setLoggedIn(false);
                  navigate('/auth');
                }}
                className="w-full flex items-center justify-center gap-space-xs py-2 px-space-md rounded-lg text-error hover:bg-error-container/40 transition-colors font-body-sm text-body-sm font-medium cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>ログアウト</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-fixed/20 to-surface-container-high rounded-xl p-space-md space-y-space-xs">
            <div className="flex items-center gap-space-xs text-primary font-headline-md text-body-lg font-bold">
              <span className="material-symbols-outlined text-[20px]">lightbulb</span>
              <span>店頭お買い物のコツ</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface">
              夕方17時〜19時はスーパー各店で「見切り品」シールの貼付タイミング。アプリで通知をONにしておくとタイムリーに食材に出会えます。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
