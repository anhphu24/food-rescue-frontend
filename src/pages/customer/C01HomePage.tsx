import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { prioritizeStoresByAddress } from '../../utils/foodRescueLogic';

const C01_IMAGES = {
  feedBeef:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDc9BCayxa0oEMM-gxOeIbgz7RwD6lYTBHediyyrG4FNUAQig-FwGi_o3BzO9rDugTyQ72peJasu3cqmxwawpwj-DJFEnsgs0RVPVe6KdgyyivlWNyOmGYfNj7yE1z_KzuhR8myiBCpNuhBbWlaF2qZ60wE9lb9EAOkFd2QKoHV5MdCvqnDzz-qwBcJjr17BIPk2WpCDQSfQLAappfC87IQhBj30vZEseTldZSq4Tru',
  feedTomato:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAVtCcdWIgdx9HLJxz0F3jI4ZSoSr895BdBGUi22pIH9CRdJybsgMNnQiw2Y0w6rHVyL14spw9eqs8dl8PMy9jXlLZrhgKOJDm5KCL03m_AcC5Ic9sOSD1MkWpJjud3Oql9Qh7kqGpJNUZQpgE6dwslQomUB7RDv90kobPI5K6c16XUOGEBzT8spG6yDu4fVuB3C943s8FQOgiyYmUXIrfGvuzVVxgUQjAqhFjijv2E',
  feedBream:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDNxlwg76U33JvyRLAUoPLaW-BFhMQxBNsLkQJYFhv5FhLSpadsD0xpUq_8PpTAuXOwgZJv-Axn39U6egidbRMNAVbrZdqhangnr3Vrq4rYfXNb870YTSD4KFiZC63RLjRWnH28nCN6sx7WWicimUgqWw37WI6ECCEZ0AuxwhSbzjT7VlF2BLJy4vKLrRvsqagBZAJ6wWfLchjQZrmmdJ5RNRsnARk1Izetrp0VEwjb',
  cardBeef:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAZzn8K7mfodPw4tlTRGIs7YKSMj7PYPxvgO0tLfJNpKISUUd-6ePPEDTn8jVWvjao5TRj8Y_oJJkd7B0R0bRcJJ_yBVEu2y9PY0Mg41HnOITv5UkoK5_ph5PF232vgE2hNqaCeKZ-5TsoFeakV5kw7IbaII2y6froeFoZQWIXIjTsbDFxmIAtNouu6Z-VauYvVwaujtT6jW7rC5MANaIhi696e898SQNsTRtHoKpmK',
  cardOnion:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDmnp3uCYqbQ-cbZTRbrreYw_f4-m91XBqbFn4civKybOHgeRjl7keOOyyo08VE3pun3DHmbLCp2bDS1f1aYoiyZi_6BnlSo64s8VIUsvtXHNfm4aAkS_BvZxJz0aJMFhwJ66pD079NahKRLoQQpuOctdAO0HCN6fmFnLZrXH2fr7V1z90QlzHtgP8fOR13k5CfnzsIOSKvUAL5JBLv8aiUFZKG86ub1ljTViq8AHrH',
  cardBream:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC2q1y9_UWr7Z2DJKUbOuJ7YoKHKvztzPPdMaMJ4xbg8XRL9UMRK4XuHYqaii0An9dZpwmvvyS1z6FxL6TQ422MUu-XJCanopqeOs02lV_WS41LrluFGyebTNINjRG7AOqNMGTl-6WVRv-RB4mg2g781Js8nMS8E-q8SSIDLLM00tXV4ly6pNdTFlAxDYwXXvKVrm0bjx5LoDEg8gHGhUsMvKOfV4zJ8j7ugIGmc5vG',
  cardTomato:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDgZUT21YWxx--rpOL0uI89alLlrikh0_MHFPl6YOhyE-OyVE_mhVQsx96C6Kj2ii1z7OKv5kIvrQrpRegKU0xm0jRpbIHXuuoGPcSblFoJ0b-B68S97QGivZJVsQseR42NgYkPGVVFFNUkTZM4KtWciyRtqtFDWu6NH1WlKgO85g_jwVtboKH_B7L-Jv_FLtoZ_dF9KNbxbOpjWzxlcf1Bo_GKPFLgZWrpW8-b-wCJ',
};

export const C01HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    stores,
    selectedStore,
    selectStore,
    setStoreModalOpen,
    user,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [areaQuery, setAreaQuery] = useState('');
  const [mapView, setMapView] = useState<'map' | 'list'>('map');
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const orderedStores = prioritizeStoresByAddress(stores, user.prioritizeNearbyByAddress);
  const filteredStores = areaQuery.trim()
    ? orderedStores.filter(
        (s) =>
          s.name.includes(areaQuery.trim()) ||
          s.address.includes(areaQuery.trim()) ||
          areaQuery.includes('150') ||
          areaQuery.includes('渋谷')
      )
    : orderedStores;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  const handleQuickTag = (tag: string) => {
    navigate(`/products?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section - Exact Stitch c01/code.html */}
      <section className="relative w-full overflow-hidden bg-surface-container-low pb-space-xl pt-space-lg lg:pt-space-xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary-fixed-dim/20 blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 -bottom-16 w-80 h-80 rounded-full bg-secondary-fixed/30 blur-2xl pointer-events-none" />
        <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin relative z-10">
          {/* Store Badge & Mode Indicator */}
          <div className="flex flex-wrap items-center gap-space-sm mb-space-md">
            <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-lowest shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="font-body-sm text-body-sm text-on-surface-variant">現在選択中:</span>
              <span className="font-body-md text-body-md font-bold text-on-surface">
                {selectedStore.name}
              </span>
              <button
                type="button"
                onClick={() => setStoreModalOpen(true)}
                className="ml-1 text-primary hover:text-primary-container font-body-sm text-body-sm font-bold flex items-center cursor-pointer"
              >
                変更
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1 text-label-badge text-primary bg-primary-fixed/50 px-2.5 py-1 rounded-full font-bold">
              <span className="material-symbols-outlined text-[14px]">eco</span>
              本日142点のお得なレスキュー食材あり
            </div>
          </div>

          {/* Main Copy Block with Asymmetric Visual Balancing */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
            <div className="lg:col-span-7 space-y-space-md">
              <div className="inline-block">
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-primary font-bold bg-tertiary-fixed/60 px-space-sm py-0.5 rounded">
                  Food Loss × AI Recipe Assistant
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight leading-tight">
                今日の食材から、
                <br className="hidden sm:inline" />
                <span className="text-primary underline decoration-tertiary-fixed-dim decoration-wavy decoration-2">
                  お得な献立
                </span>
                を見つけよう。
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                買いたい食材を選ぶだけ。AIがおすすめ料理と買い足し食材を賢く提案し、店頭セット割クーポンでお得に美味しく食品ロスを削減できます。
              </p>

              {/* Search Bar & Instant Actions */}
              <div className="pt-space-xs max-w-xl">
                <form
                  className="flex flex-col sm:flex-row gap-space-xs bg-surface-container-lowest p-2 rounded-xl shadow-md"
                  onSubmit={handleSearch}
                >
                  <div className="relative flex-1 flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-outline text-[22px]">
                      search
                    </span>
                    <input
                      className="w-full pl-10 pr-3 py-3 bg-transparent text-on-surface placeholder:text-outline focus:outline-none font-body-md text-body-md"
                      placeholder="牛肉、玉ねぎ、トマト、白菜など食材名..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    className="px-space-lg py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-bold transition-transform active:scale-95 flex items-center justify-center gap-space-xs shadow-sm cursor-pointer"
                    type="submit"
                  >
                    <span>検索</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </form>

                {/* Popular Quick Tags */}
                <div className="flex flex-wrap items-center gap-space-xs mt-space-sm font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-label-caption text-label-caption font-bold text-outline">
                    急上昇の食材:
                  </span>
                  {['牛肉もも', 'たまねぎ', '真鯛', 'トマト'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTag(tag)}
                      className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-variant text-on-surface transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Main Action Button */}
              <div className="pt-space-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-space-sm px-space-xl py-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-md text-body-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[24px]">shopping_basket</span>
                  <span>食材を探す (スタート)</span>
                </Link>
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    verified
                  </span>
                  <span>予約・取り置き不要。店頭で選んでレジで提示</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Side: Realtime Rescue Status Widget */}
            <div className="lg:col-span-5 relative mt-space-md lg:mt-0">
              <div className="relative mx-auto max-w-md bg-surface-container-lowest rounded-2xl p-space-md shadow-xl overflow-hidden">
                <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-surface-container">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[22px]">
                      bolt
                    </span>
                    <span className="font-headline-md text-body-md text-on-surface">
                      店舗リアルタイム入荷状況
                    </span>
                  </div>
                  <span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-error-container text-on-error-container font-bold">
                    18:00更新
                  </span>
                </div>

                {/* Mini Live Feed List */}
                <div className="space-y-space-sm">
                  <Link
                    to="/products/lot-01"
                    className="flex items-center gap-space-sm p-space-xs rounded-xl hover:bg-surface-container-low transition-colors"
                  >
                    <img
                      alt="国産牛もも切り落とし"
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      src={C01_IMAGES.feedBeef}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-primary text-[10px] font-bold">
                          -30%
                        </span>
                        <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                          国産牛もも切り落とし
                        </p>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        本日中消費 / 残りわずか
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-label-numeric-md text-label-numeric-md text-secondary">
                        ¥336
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/products"
                    className="flex items-center gap-space-sm p-space-xs rounded-xl hover:bg-surface-container-low transition-colors"
                  >
                    <img
                      alt="有機栽培トマト 2個"
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      src={C01_IMAGES.feedTomato}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-primary text-[10px] font-bold">
                          -25%
                        </span>
                        <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                          有機栽培トマト 2個
                        </p>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        完熟・本日使い切り推奨
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-label-numeric-md text-label-numeric-md text-secondary">
                        ¥223
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/products/lot-02"
                    className="flex items-center gap-space-sm p-space-xs rounded-xl hover:bg-surface-container-low transition-colors"
                  >
                    <img
                      alt="鮮魚 真鯛のサク 180g"
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      src={C01_IMAGES.feedBream}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-primary text-[10px] font-bold">
                          -40%
                        </span>
                        <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                          鮮魚 真鯛のサク 180g
                        </p>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        カルパッチョ・ソテーに最適
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-label-numeric-md text-label-numeric-md text-secondary">
                        ¥348
                      </span>
                    </div>
                  </Link>
                </div>

                <div className="mt-space-sm pt-space-xs bg-surface-container-high/50 -mx-space-md -mb-space-md p-space-sm text-center">
                  <span className="font-body-sm text-body-sm text-primary font-bold flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                    店舗の陳列棚でそのままピックアップ！
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Locator & Map Section */}
      <section className="w-full py-space-xl bg-surface border-b border-surface-container">
        <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-md">
            <div>
              <div className="inline-block mb-1">
                <span className="font-label-badge text-label-badge uppercase tracking-wider text-primary font-bold bg-primary-fixed/50 px-space-sm py-0.5 rounded">
                  STORE LOCATOR &amp; MAP
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                お近くのスーパーを探す・選択中の店舗
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mt-1 leading-relaxed">
                ご自宅の登録住所や現在地から、近隣のスーパーを検索できます。選択した店舗のリアルタイム見切り品・在庫情報をもとにAIレシピとまとめ買い割クーポンを提案します。
              </p>
            </div>

            {/* Controls / Toggles */}
            <div className="flex flex-wrap items-center gap-space-xs">
              <div className="inline-flex rounded-xl bg-surface-container p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setMapView('map')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-body-sm text-body-sm cursor-pointer transition-colors ${
                    mapView === 'map'
                      ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  <span>地図表示</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapView('list')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-body-sm text-body-sm cursor-pointer transition-colors ${
                    mapView === 'list'
                      ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    format_list_bulleted
                  </span>
                  <span>店舗リスト表示</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() =>
                  setLocationNotice('現在地（東京都渋谷区桜丘町付近）から最寄り店舗を表示しています。')
                }
                className="inline-flex items-center gap-1 px-space-md py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-body-sm text-body-sm font-medium transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">
                  my_location
                </span>
                <span>現在地を取得（許可が必要）</span>
              </button>
            </div>
          </div>

          {/* Address Status Bar & Area Search */}
          <div className="bg-surface-container-low rounded-2xl p-space-md mb-space-md border border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant text-body-sm font-bold">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  home_pin
                </span>
                <span>
                  {locationNotice ||
                    `登録住所（${user.address?.prefecture || '東京都'}${user.address?.city || '渋谷区'}${user.address?.street?.split(' ')[0] || '桜丘町'}）周辺の店舗を優先表示中（半径2km以内）`}
                </span>
              </div>
              <span className="text-label-caption text-on-surface-variant">
                ※未登録の場合は郵便番号・エリア名から検索、または住所を登録すると優先表示されます
              </span>
            </div>
            <form
              className="flex items-center gap-space-xs w-full lg:w-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative flex-1 sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                  location_city
                </span>
                <input
                  type="text"
                  value={areaQuery}
                  onChange={(e) => setAreaQuery(e.target.value)}
                  placeholder="郵便番号(例: 150-0031)・市区町村"
                  className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest text-on-surface placeholder:text-outline rounded-lg font-body-sm text-body-sm border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm font-bold transition-colors cursor-pointer flex-shrink-0"
              >
                検索
              </button>
            </form>
          </div>

          {/* Store Map & Cards Grid (2 Column) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
            {/* Left: Interactive Map Mock UI */}
            {mapView === 'map' && (
              <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      explore
                    </span>
                    <span className="font-headline-md text-body-md font-bold text-on-surface">
                      渋谷・恵比寿・中目黒エリア
                    </span>
                  </div>
                  <span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-primary-fixed/50 text-primary font-bold">
                    近隣 {filteredStores.length}店舗検出
                  </span>
                </div>

                {/* Map Canvas / Visual Area */}
                <div className="relative w-full h-80 sm:h-96 rounded-xl bg-surface-container-high overflow-hidden border border-outline-variant/30 flex items-center justify-center">
                  <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                      backgroundImage:
                        'radial-gradient(#6d7a72 1px, transparent 1px), linear-gradient(to right, rgba(109,122,114,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(109,122,114,0.1) 1px, transparent 1px)',
                      backgroundSize: '24px 24px, 48px 48px, 48px 48px',
                    }}
                  />
                  {/* River representation */}
                  <div className="absolute -left-10 top-1/2 w-[120%] h-8 bg-surface-variant/70 rotate-[-18deg] pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-outline tracking-widest uppercase font-bold opacity-60">
                      目黒川 / Meguro River
                    </span>
                  </div>
                  {/* Main train line */}
                  <div className="absolute top-0 bottom-0 left-1/3 w-1.5 bg-outline-variant/40 pointer-events-none border-l border-dashed border-outline/50" />

                  {/* Registered Home Marker */}
                  <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="px-2 py-0.5 rounded bg-on-surface text-surface text-[10px] font-bold shadow-md whitespace-nowrap mb-1">
                      🏠 登録住所
                    </div>
                    <span className="w-3 h-3 rounded-full bg-secondary ring-4 ring-secondary-fixed" />
                  </div>

                  {/* Store Pins */}
                  {orderedStores.map((st, idx) => {
                    const isSelected = st.id === selectedStore.id;
                    const posClass =
                      idx === 0
                        ? 'top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2'
                        : idx === 1
                          ? 'bottom-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2'
                          : 'bottom-1/3 left-1/4 -translate-x-1/2 translate-y-1/2';

                    if (isSelected) {
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => selectStore(st.id)}
                          className={`absolute ${posClass} transform flex flex-col items-center z-20 cursor-pointer`}
                        >
                          <div className="bg-surface-container-lowest border-2 border-primary rounded-xl p-2.5 shadow-xl mb-1.5 text-center min-w-[210px]">
                            <div className="flex items-center justify-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              <span className="font-headline-md text-body-sm font-bold text-primary">
                                {st.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary text-[10px] font-bold">
                                選択中
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] text-on-surface font-medium flex items-center justify-center gap-2 border-t border-surface-container pt-1">
                              <span>
                                見切り品: <strong className="text-secondary">28品</strong>
                              </span>
                              <span className="text-outline">|</span>
                              <span>
                                出品総数: <strong>142品</strong>
                              </span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg ring-4 ring-primary-fixed animate-bounce">
                            <span className="material-symbols-outlined text-[20px]">
                              storefront
                            </span>
                          </div>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => selectStore(st.id)}
                        className={`absolute ${posClass} transform flex flex-col items-center z-10 cursor-pointer group`}
                      >
                        <div className="px-2 py-0.5 rounded bg-surface-container-lowest/90 text-on-surface text-[10px] font-bold shadow-sm whitespace-nowrap mb-1 group-hover:bg-surface-variant transition-colors">
                          {st.name} ({st.distanceKm}km)
                        </div>
                        <div className="w-7 h-7 rounded-full bg-surface-variant text-on-surface flex items-center justify-center shadow-md ring-2 ring-surface-container-lowest group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          <span className="material-symbols-outlined text-[16px]">storefront</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="font-label-caption text-label-caption text-outline mt-space-xs text-center">
                  ※マップ表示はUIプロトタイプ（モック）です。実際の位置情報はブラウザの許可設定に基づきます。
                </p>
              </div>
            )}

            {/* Right: Store Cards List */}
            <div
              className={
                mapView === 'map'
                  ? 'lg:col-span-5 space-y-space-sm'
                  : 'lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-space-md'
              }
            >
              {filteredStores.map((st, idx) => {
                const isSelected = st.id === selectedStore.id;
                const rescueDisplay = idx === 0 ? 28 : idx === 1 ? 19 : 32;
                const distDisplay = idx === 0 ? '350m' : `${st.distanceKm}km`;

                if (isSelected) {
                  return (
                    <div
                      key={st.id}
                      className="bg-surface-container-lowest rounded-2xl p-space-md border-2 border-primary shadow-md relative"
                    >
                      <div className="flex items-start justify-between gap-space-sm mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-bold text-[11px]">
                              現在選択中
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-bold text-[11px]">
                              優先（登録住所から {distDisplay}）
                            </span>
                          </div>
                          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                            {st.name}
                          </h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[24px]">storefront</span>
                        </div>
                      </div>

                      <div className="space-y-1 font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-outline">
                            schedule
                          </span>
                          <span>営業時間: {st.hours}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-outline">
                            pin_drop
                          </span>
                          <span>{st.address}</span>
                        </div>
                      </div>

                      <div className="bg-surface-container-low rounded-xl p-2.5 mb-space-sm flex items-center justify-around text-center">
                        <div>
                          <p className="text-label-caption text-on-surface-variant">
                            本日の見切り品
                          </p>
                          <p className="font-label-numeric-md text-label-numeric-md text-secondary">
                            {rescueDisplay}品
                          </p>
                        </div>
                        <div className="w-px h-6 bg-surface-container" />
                        <div>
                          <p className="text-label-caption text-on-surface-variant">
                            レスキュー総数
                          </p>
                          <p className="font-label-numeric-md text-label-numeric-md text-primary">
                            142品
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 rounded-xl bg-primary/10 text-primary font-body-sm text-body-sm font-bold flex items-center justify-center gap-1.5 cursor-default"
                      >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>この店舗で買い物中（商品一覧に反映済み）</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={st.id}
                    className="bg-surface-container-lowest rounded-2xl p-space-md border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    <div className="flex items-start justify-between gap-space-sm mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-[11px]">
                            登録住所から {distDisplay}
                          </span>
                        </div>
                        <h3 className="font-headline-md text-body-lg text-on-surface font-bold">
                          {st.name}
                        </h3>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-surface-container text-outline flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[20px]">store</span>
                      </div>
                    </div>

                    <div className="space-y-1 font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-outline">
                          schedule
                        </span>
                        <span>営業時間: {st.hours}</span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary font-bold">
                        <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                        <span>本日の見切り品: {rescueDisplay}品</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => selectStore(st.id)}
                      className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-variant text-on-surface font-body-sm text-body-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                      <span>この店舗に変更する</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Store Sync Informational Notice Badge */}
          <div className="mt-space-md p-space-sm rounded-xl bg-primary-fixed/20 border border-primary-fixed flex items-start sm:items-center gap-space-sm text-on-surface">
            <span className="material-symbols-outlined text-primary text-[22px] flex-shrink-0">
              sync
            </span>
            <p className="font-body-sm text-body-sm text-on-surface leading-normal">
              <strong>店舗連動:</strong>{' '}
              店舗を変更すると、表示される食材・見切り品・割引価格・在庫状況、およびAIレシピセットの提案内容が自動的に選択店舗のものに切り替わります。（予約・取り置きは行われません）
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step Guided Journey Section */}
      <section className="w-full py-space-xl bg-surface-container-lowest">
        <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin">
          <div className="text-center max-w-2xl mx-auto mb-space-lg">
            <span className="font-label-badge text-label-badge font-bold text-primary tracking-widest uppercase bg-surface-container px-3 py-1 rounded-full">
              Simple 3 Steps
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-xs">
              店頭で完結する、新しいお買い物体験
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              スマホでお取り置きの手続きは一切不要。店内の棚から直接手に取り、レジでサッと割引。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md relative">
            {/* Step 1 */}
            <div className="relative bg-surface rounded-2xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-numeric-md text-label-numeric-md">
                    1
                  </span>
                  <span className="material-symbols-outlined text-outline text-[28px]">
                    checklist
                  </span>
                </div>
                <p className="font-label-caption text-label-caption text-primary font-bold uppercase tracking-wider">
                  STEP 01
                </p>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  買いたい食材を選ぶ
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                  値引きシール付きの見切り品や、今日使いたい食材を1品〜複数タップ。お肉・野菜・魚など店頭のリアル在庫を即座に確認できます。
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-2 text-primary font-body-sm text-body-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">touch_app</span>
                <span>気になる食材をタップするだけ</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-surface rounded-2xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-numeric-md text-label-numeric-md">
                    2
                  </span>
                  <span className="material-symbols-outlined text-outline text-[28px]">
                    psychology
                  </span>
                </div>
                <p className="font-label-caption text-label-caption text-secondary font-bold uppercase tracking-wider">
                  STEP 02
                </p>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  AIが料理と買い足し食材を提案
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                  選んだ食材に合う今晩の時短献立をAIが瞬時に生成。「あと1品これを入れると美味しい」食材のまとめ買いセット割引クーポンも自動適用されます。
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-2 text-secondary font-body-sm text-body-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">percent</span>
                <span>セット割クーポンが自動発行</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-surface rounded-2xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-numeric-md text-label-numeric-md">
                    3
                  </span>
                  <span className="material-symbols-outlined text-outline text-[28px]">
                    point_of_sale
                  </span>
                </div>
                <p className="font-label-caption text-label-caption text-primary font-bold uppercase tracking-wider">
                  STEP 03
                </p>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                  お店で取ってレジで提示
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                  商品はスーパーの売り場で直接かごへ。レジまたはセルフレジにてアプリのマイクーポン画面（バーコード）を読み取らせるだけでお得に会計完了！
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-2 text-primary font-body-sm text-body-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">store</span>
                <span>決済はお店のレジで普段通り</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rescued Ingredients Section */}
      <section className="w-full py-space-xl bg-background">
        <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
            <div>
              <div className="flex items-center gap-space-xs text-secondary font-headline-md text-body-md font-bold mb-1">
                <span className="material-symbols-outlined text-[20px]">timer</span>
                <span>本日限定レスキュー食材</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                見切り品・期限間近のおすすめ食材
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                食材をタップして、今夜の美味しいレシピアイデアと買い足し食材を見つけましょう。
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 font-body-md text-body-md text-primary hover:text-primary-container font-bold cursor-pointer"
            >
              <span>すべてのレスキュー食材を見る (142件)</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {/* Item 1 */}
            <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <Link to="/products/lot-01" className="relative block">
                <img
                  alt="国産牛もも切り落とし 250g"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  src={C01_IMAGES.cardBeef}
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-primary font-bold text-label-badge shadow-sm">
                    30% OFF
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-on-surface font-label-caption text-label-caption backdrop-blur-sm">
                    見切り品
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-inverse-surface/80 text-inverse-on-surface font-label-caption text-label-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-tertiary-fixed">
                    alarm
                  </span>
                  本日21時まで
                </div>
              </Link>
              <div className="p-space-md flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-label-caption text-on-surface-variant mb-1">
                    <span>精肉売場 / {selectedStore.name}</span>
                    <span className="text-primary font-bold">参考在庫: 残り3点</span>
                  </div>
                  <h3 className="font-headline-md text-body-lg text-on-surface font-bold leading-snug">
                    国産牛もも切り落とし 250g
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    牛丼、肉じゃが、チンジャオロースなどに大活躍。
                  </p>
                  <div className="flex items-baseline gap-space-xs mt-space-sm">
                    <span className="font-label-numeric-lg text-label-numeric-lg text-secondary">
                      ¥336
                    </span>
                    <span className="font-body-sm text-body-sm line-through text-outline">
                      ¥480
                    </span>
                    <span className="font-label-caption text-label-caption text-on-surface-variant">
                      (税込 ¥362)
                    </span>
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <Link
                    to="/ai-recipes"
                    className="w-full py-2.5 px-space-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm text-body-sm font-bold flex items-center justify-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>この食材でレシピを探す</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <Link to="/products/lot-06" className="relative block">
                <img
                  alt="北海道産たまねぎ 3個入"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  src={C01_IMAGES.cardOnion}
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-primary font-bold text-label-badge shadow-sm">
                    20% OFF
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-on-surface font-label-caption text-label-caption backdrop-blur-sm">
                    規格外・不揃い
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-inverse-surface/80 text-inverse-on-surface font-label-caption text-label-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-tertiary-fixed">
                    eco
                  </span>
                  甘み抜群
                </div>
              </Link>
              <div className="p-space-md flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-label-caption text-on-surface-variant mb-1">
                    <span>青果売場 / {selectedStore.name}</span>
                    <span className="text-primary font-bold">参考在庫: 残り8点</span>
                  </div>
                  <h3 className="font-headline-md text-body-lg text-on-surface font-bold leading-snug">
                    北海道産たまねぎ 3個入
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    サイズ不揃いですが味は抜群。煮込みやスープに。
                  </p>
                  <div className="flex items-baseline gap-space-xs mt-space-sm">
                    <span className="font-label-numeric-lg text-label-numeric-lg text-secondary">
                      ¥158
                    </span>
                    <span className="font-body-sm text-body-sm line-through text-outline">
                      ¥198
                    </span>
                    <span className="font-label-caption text-label-caption text-on-surface-variant">
                      (税込 ¥170)
                    </span>
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <Link
                    to="/ai-recipes"
                    className="w-full py-2.5 px-space-sm rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-body-sm text-body-sm font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>この食材でレシピを探す</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <Link to="/products/lot-02" className="relative block">
                <img
                  alt="鮮魚 真鯛のサク 180g"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  src={C01_IMAGES.cardBream}
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className="px-2 py-0.5 rounded bg-error text-on-error font-bold text-label-badge shadow-sm">
                    40% OFF
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-on-surface font-label-caption text-label-caption backdrop-blur-sm">
                    本日消費推奨
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-inverse-surface/80 text-inverse-on-surface font-label-caption text-label-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-tertiary-fixed">
                    alarm
                  </span>
                  本日20時まで
                </div>
              </Link>
              <div className="p-space-md flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-label-caption text-on-surface-variant mb-1">
                    <span>鮮魚売場 / {selectedStore.name}</span>
                    <span className="text-error font-bold">参考在庫: 残り2点</span>
                  </div>
                  <h3 className="font-headline-md text-body-lg text-on-surface font-bold leading-snug">
                    鮮魚 真鯛のサク 180g
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    新鮮なうちに鯛茶漬けやハーブグリル、アクアパッツァに。
                  </p>
                  <div className="flex items-baseline gap-space-xs mt-space-sm">
                    <span className="font-label-numeric-lg text-label-numeric-lg text-secondary">
                      ¥348
                    </span>
                    <span className="font-body-sm text-body-sm line-through text-outline">
                      ¥580
                    </span>
                    <span className="font-label-caption text-label-caption text-on-surface-variant">
                      (税込 ¥375)
                    </span>
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <Link
                    to="/ai-recipes"
                    className="w-full py-2.5 px-space-sm rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-body-sm text-body-sm font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>この食材でレシピを探す</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <Link to="/products" className="relative block">
                <img
                  alt="有機栽培トマト 2個パック"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  src={C01_IMAGES.cardTomato}
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-primary font-bold text-label-badge shadow-sm">
                    25% OFF
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-on-surface font-label-caption text-label-caption backdrop-blur-sm">
                    完熟
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-inverse-surface/80 text-inverse-on-surface font-label-caption text-label-caption flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-tertiary-fixed">
                    eco
                  </span>
                  有機栽培JAS認定
                </div>
              </Link>
              <div className="p-space-md flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-label-caption text-on-surface-variant mb-1">
                    <span>青果売場 / {selectedStore.name}</span>
                    <span className="text-primary font-bold">参考在庫: 残り5点</span>
                  </div>
                  <h3 className="font-headline-md text-body-lg text-on-surface font-bold leading-snug">
                    有機栽培トマト 2個パック
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    完熟で甘みたっぷり。パスタソースやスープにも最適。
                  </p>
                  <div className="flex items-baseline gap-space-xs mt-space-sm">
                    <span className="font-label-numeric-lg text-label-numeric-lg text-secondary">
                      ¥223
                    </span>
                    <span className="font-body-sm text-body-sm line-through text-outline">
                      ¥298
                    </span>
                    <span className="font-label-caption text-label-caption text-on-surface-variant">
                      (税込 ¥240)
                    </span>
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <Link
                    to="/ai-recipes"
                    className="w-full py-2.5 px-space-sm rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-body-sm text-body-sm font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>この食材でレシピを探す</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredient Categories Section */}
      <section className="w-full py-space-xl bg-surface-container-low">
        <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
            <div>
              <span className="font-label-badge text-label-badge font-bold text-primary tracking-widest uppercase bg-surface-container-highest px-3 py-1 rounded-full">
                Browse by Department
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-xs">
                食材カテゴリーから探す
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                スーパーの売り場ごとに、本日のレスキュー値引き食材をチェックできます。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-sm">
            <Link
              to="/products?category=精肉"
              className="group bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors mb-space-sm">
                <span className="material-symbols-outlined text-[32px]">set_meal</span>
              </div>
              <span className="font-headline-md text-body-lg text-on-surface font-bold">
                精肉・お肉
              </span>
              <span className="font-label-caption text-label-caption text-on-surface-variant mt-1">
                牛・豚・鶏肉・加工肉
              </span>
              <span className="mt-space-sm font-label-badge text-label-badge text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full font-bold">
                38品 レスキュー
              </span>
            </Link>

            <Link
              to="/products?category=鮮魚"
              className="group bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors mb-space-sm">
                <span className="material-symbols-outlined text-[32px]">phishing</span>
              </div>
              <span className="font-headline-md text-body-lg text-on-surface font-bold">
                鮮魚・魚介
              </span>
              <span className="font-label-caption text-label-caption text-on-surface-variant mt-1">
                刺身・切り身・貝類
              </span>
              <span className="mt-space-sm font-label-badge text-label-badge text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full font-bold">
                24品 レスキュー
              </span>
            </Link>

            <Link
              to="/products?category=青果"
              className="group bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-tertiary-fixed/60 flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors mb-space-sm">
                <span className="material-symbols-outlined text-[32px]">nutrition</span>
              </div>
              <span className="font-headline-md text-body-lg text-on-surface font-bold">
                青果・野菜・果物
              </span>
              <span className="font-label-caption text-label-caption text-on-surface-variant mt-1">
                旬の野菜・不揃い果物
              </span>
              <span className="mt-space-sm font-label-badge text-label-badge text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full font-bold">
                49品 レスキュー
              </span>
            </Link>

            <Link
              to="/products?category=惣菜・弁当"
              className="group bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center text-on-surface group-hover:bg-inverse-surface group-hover:text-inverse-on-surface transition-colors mb-space-sm">
                <span className="material-symbols-outlined text-[32px]">bento</span>
              </div>
              <span className="font-headline-md text-body-lg text-on-surface font-bold">
                日配品・豆腐・納豆
              </span>
              <span className="font-label-caption text-label-caption text-on-surface-variant mt-1">
                麺類・練り物・惣菜
              </span>
              <span className="mt-space-sm font-label-badge text-label-badge text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full font-bold">
                19品 レスキュー
              </span>
            </Link>

            <Link
              to="/products?category=日配・乳製品"
              className="group bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer hover:-translate-y-1 col-span-2 sm:col-span-1"
            >
              <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary group-hover:bg-secondary-container group-hover:text-on-primary transition-colors mb-space-sm">
                <span className="material-symbols-outlined text-[32px]">egg_alt</span>
              </div>
              <span className="font-headline-md text-body-lg text-on-surface font-bold">
                乳製品・卵
              </span>
              <span className="font-label-caption text-label-caption text-on-surface-variant mt-1">
                牛乳・チーズ・ヨーグルト
              </span>
              <span className="mt-space-sm font-label-badge text-label-badge text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full font-bold">
                12品 レスキュー
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive AI Suggestion Banner */}
      <section className="w-full py-space-xl bg-surface-container-lowest">
        <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin">
          <div className="relative rounded-3xl bg-primary text-on-primary p-space-lg lg:p-space-xl overflow-hidden shadow-xl">
            <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-primary-fixed-dim/20 blur-2xl" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
              <div className="lg:col-span-8 space-y-space-sm">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-badge font-bold">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  AI献立アシスタント機能
                </div>
                <h2 className="font-headline-xl text-headline-xl text-on-primary tracking-tight">
                  食材を組み合わせると、
                  <br className="hidden sm:inline" />
                  追加の「まとめ買い割クーポン」が届きます
                </h2>
                <p className="font-body-md text-body-md text-on-primary-container max-w-2xl leading-relaxed">
                  例えば「国産牛もも」と「北海道産たまねぎ」を選ぶと、AIが「絶品肉じゃが」のレシピを提案。さらに煮込み用調味料や糸こんにゃくの店頭限定セット値引きクーポンを発行します。
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
                <Link
                  to="/ai-recipes"
                  className="w-full sm:w-auto px-space-xl py-4 rounded-xl bg-surface-container-lowest text-primary hover:bg-surface hover:text-primary-container font-headline-md text-body-lg font-bold shadow-lg text-center transition-transform active:scale-95 cursor-pointer"
                >
                  食材を選んでレシピを見る
                </Link>
                <span className="text-label-caption text-on-primary/80 mt-2">
                  ※事前決済なし・レジでバーコードをスキャンするだけ
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Service Commitment Banner */}
      <section className="w-full py-space-lg bg-surface-container-high/40">
        <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin">
          <div className="rounded-2xl bg-surface-container-lowest p-space-md lg:p-space-lg shadow-sm flex flex-col sm:flex-row items-center gap-space-md">
            <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed/70 text-on-tertiary-fixed-variant flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[32px]">shield</span>
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1">
              <p className="font-headline-md text-body-lg text-on-surface font-bold">
                Food Rescueからのお約束（ご利用前にお読みください）
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Food Rescueはお取り置きやネット決済ではありません。スーパーの店頭で実際にお手に取り、レジでクーポンをご提示いただくエコでお得なサービスです。在庫は実店舗の店頭状況と連動するため、ご来店時の売り切れはご容赦ください。
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/products"
                className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-body-sm text-body-sm font-bold transition-colors inline-block cursor-pointer"
              >
                お買い物を始める
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
