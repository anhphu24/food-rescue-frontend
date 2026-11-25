import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { ProductCategory } from '../../types';
import { filterAndSortStoreLots, type ProductSortKey } from '../../utils/foodRescueLogic';

type CategoryPill = {
  id: ProductCategory | 'すべて';
  label: string;
  icon?: string;
};

const CATEGORY_PILLS: CategoryPill[] = [
  { id: 'すべて', label: 'すべて' },
  { id: '精肉', label: '精肉・肉', icon: 'restaurant' },
  { id: '鮮魚', label: '鮮魚・刺身' },
  { id: '青果', label: '青果・野菜・果物' },
  { id: '惣菜・弁当', label: '日配品・総菜' },
  { id: 'ベーカリー', label: 'ベーカリー' },
];

export const C02SearchProductsPage: React.FC = () => {
  const { selectedStore, stores, selectStore, storeLots, setStoreModalOpen } = useApp();
  const [searchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = (searchParams.get('category') as ProductCategory | null) || 'すべて';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<ProductCategory | 'すべて'>(initialCategory);
  const [sortBy, setSortBy] = useState<ProductSortKey>('discount_desc');
  const [rescueOnly, setRescueOnly] = useState(false);
  const [otherStoresOpen, setOtherStoresOpen] = useState(false);

  const storeScopedLots = useMemo(
    () => storeLots.filter((l) => l.storeId === selectedStore.id),
    [storeLots, selectedStore.id]
  );

  const filteredLots = useMemo(
    () =>
      filterAndSortStoreLots(storeLots, {
        storeId: selectedStore.id,
        query,
        category,
        rescueOnly,
        sortBy,
      }),
    [storeLots, selectedStore.id, query, category, rescueOnly, sortBy]
  );

  const otherStores = stores.filter((s) => s.id !== selectedStore.id);

  const countByCategory = (cat: ProductCategory | 'すべて') => {
    if (cat === 'すべて') return storeScopedLots.length;
    return storeScopedLots.filter((l) => l.category === cat).length;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Selected Store Context & Nearby Preview Strip (Exact Stitch C02) */}
      <section className="w-full bg-surface-container border-t border-outline-variant/30 py-space-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span
                className="material-symbols-outlined text-primary text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
              <span className="font-headline-md text-body-md text-on-surface font-bold">
                選択中の店舗: {selectedStore.name}（直営）
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-badge text-label-badge">
                同一店舗購入対応
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStoreModalOpen(true)}
              className="px-space-sm py-1 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-variant font-body-sm text-body-sm font-bold shadow-sm flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>店舗を変更する</span>
            </button>
          </div>
          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              type="button"
              onClick={() => setOtherStoresOpen((v) => !v)}
              className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-body-sm text-body-sm font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-secondary text-[16px]">
                compare_arrows
              </span>
              <span>他店状況プレビュー</span>
              <span className="material-symbols-outlined text-[14px]">
                {otherStoresOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin mt-1">
          <p className="font-label-caption text-label-caption text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary flex-shrink-0">
              check_circle
            </span>
            <span>
              ※ 表示中の商品価格・見切り割引・在庫状況は
              <strong>【{selectedStore.name}】の店頭限定情報</strong>
              です。別店舗の商品は混在していません（店舗間移動・他店受取不可）。
            </span>
          </p>
        </div>

        {otherStoresOpen && (
          <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin mt-space-sm pt-space-xs border-t border-outline-variant/30">
            <div className="p-space-sm bg-surface-container-lowest rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-space-xs flex-wrap gap-2">
                <span className="font-headline-md text-body-sm text-on-surface font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary text-[16px]">store</span>
                  近隣他店の見切り品状況（リアルタイム参考）
                </span>
                <span className="font-label-caption text-label-caption text-on-surface-variant">
                  ※他店舗の食材を選ぶ場合は店舗切替が必要です
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                {otherStores.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      selectStore(st.id, true);
                      setOtherStoresOpen(false);
                    }}
                    className="flex items-center justify-between p-space-xs bg-surface-container-low hover:bg-surface-container rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-body-sm text-body-sm font-bold text-on-surface">
                        {st.name}
                      </span>
                      <span className="font-label-caption text-label-caption text-on-surface-variant">
                        レスキュー対象: {st.rescueCount}件該当 (徒歩{st.walkMinutes}分・切替可能)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-badge text-label-badge">
                      {st.hours}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Top Control Bar & Live Filter Strip */}
      <section className="w-full bg-surface-container-low/70 py-space-md shadow-sm">
        <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin flex flex-col gap-space-md">
          {/* Primary Search and Store Indicator */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
            <div className="relative flex-1 max-w-2xl">
              <label className="sr-only" htmlFor="ingredient-search">
                食材・商品名で検索
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-space-md text-primary text-[22px]">
                  search
                </span>
                <input
                  id="ingredient-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="売り場のお買い得食材・食品ロス対象品を検索（例: 牛肉、刺身、野菜）"
                  className="w-full h-12 pl-12 pr-10 rounded-full bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="検索キーワード消去"
                    onClick={() => setQuery('')}
                    className="absolute right-space-sm w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-variant cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Store Selector Quick Context */}
            <button
              type="button"
              onClick={() => setStoreModalOpen(true)}
              className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container-lowest shadow-sm self-start md:self-auto hover:bg-surface-container transition-colors cursor-pointer text-left"
            >
              <span
                className="material-symbols-outlined text-primary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                storefront
              </span>
              <div className="flex flex-col">
                <span className="font-label-caption text-label-caption text-on-surface-variant uppercase tracking-wider">
                  現在のお買い物店舗
                </span>
                <span className="font-headline-md text-body-md text-on-surface flex items-center gap-1 font-bold">
                  {selectedStore.name}
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                    expand_more
                  </span>
                </span>
              </div>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar">
            {CATEGORY_PILLS.map((pill) => {
              const active = category === pill.id;
              const count = countByCategory(pill.id);
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCategory(pill.id)}
                  className={`px-space-md py-2 rounded-full font-body-sm text-body-sm whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    active
                      ? 'font-bold bg-primary text-on-primary shadow-sm'
                      : 'font-medium bg-surface-container-highest text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  {pill.icon && active && (
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {pill.icon}
                    </span>
                  )}
                  <span>
                    {pill.label} ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sorting & Refinement Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
            <div className="flex items-center gap-space-xs overflow-x-auto">
              <span className="font-label-caption text-label-caption text-on-surface-variant flex items-center gap-0.5 mr-1">
                <span className="material-symbols-outlined text-[14px]">tune</span>並び順:
              </span>
              <button
                type="button"
                onClick={() => setSortBy('discount_desc')}
                className={`px-space-sm py-1 rounded-lg font-body-sm text-body-sm flex items-center gap-1 transition-colors cursor-pointer ${
                  sortBy === 'discount_desc'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                    : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>割引率順</span>
                {sortBy === 'discount_desc' && (
                  <span className="material-symbols-outlined text-[14px]">south</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSortBy('expiry_asc')}
                className={`px-space-sm py-1 rounded-lg font-body-sm text-body-sm transition-colors cursor-pointer ${
                  sortBy === 'expiry_asc'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                    : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                }`}
              >
                期限が近い順
              </button>
              <button
                type="button"
                onClick={() => setSortBy('price_asc')}
                className={`px-space-sm py-1 rounded-lg font-body-sm text-body-sm transition-colors cursor-pointer ${
                  sortBy === 'price_asc'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                    : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                }`}
              >
                価格の安い順
              </button>
            </div>

            {/* Filter Toggle Pill */}
            <label className="flex items-center gap-2 cursor-pointer select-none bg-surface-container-lowest px-space-sm py-1 rounded-lg shadow-sm">
              <input
                type="checkbox"
                checked={rescueOnly}
                onChange={(e) => setRescueOnly(e.target.checked)}
                className="accent-primary w-4 h-4 rounded cursor-pointer"
              />
              <span className="font-body-sm text-body-sm font-medium text-secondary flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  eco
                </span>
                見切り品・レスキュー対象のみ
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Interactive Search Guidance & Recipe Inspiration Banner */}
      <section className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin pt-space-lg pb-space-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md p-space-md rounded-2xl bg-gradient-to-r from-primary/10 via-surface-container-lowest to-surface-container-low shadow-sm">
          <div className="flex items-start gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-on-primary text-[22px]">
                smart_toy
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs flex-wrap">
                <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
                  {query
                    ? `「${query}」の検索結果`
                    : category === 'すべて'
                      ? `${selectedStore.name} のお買い得・レスキュー食材`
                      : `${category}コーナーの検索結果`}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-badge text-label-badge">
                  {filteredLots.length}件該当
                </span>
                <span className="font-label-caption text-label-caption text-secondary font-bold bg-secondary-fixed px-2 py-0.5 rounded-full">
                  値下げ見切り品多数
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                店頭の気になる食材を選ぶと、AIがその食材を主役にした時短・簡単レシピと買い足し食材をご提案します。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm text-on-surface-variant bg-surface-container-lowest/80 px-space-sm py-1.5 rounded-xl text-body-sm font-body-sm self-start md:self-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span>売り場で商品をカゴに入れてレジへ</span>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-md">
        {filteredLots.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl text-center flex flex-col items-center gap-space-sm shadow-sm">
            <span className="material-symbols-outlined text-[42px] text-outline">search_off</span>
            <p className="font-headline-md text-headline-md text-on-surface">
              条件に一致する食材がありません
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              検索キーワードやカテゴリーを変更するか、近隣の他店舗をご確認ください。
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('すべて');
                setRescueOnly(false);
              }}
              className="mt-2 px-space-md py-2 rounded-xl bg-primary text-on-primary font-body-sm font-bold cursor-pointer"
            >
              条件をリセット
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {filteredLots.map((lot, idx) => {
              const taxIncluded = Math.round(lot.discountedPrice * 1.08);
              const isHeroHighlight = idx === 0 && lot.discountPercent >= 25;
              return (
                <article
                  key={lot.id}
                  className={`flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden transition-all group relative ${
                    isHeroHighlight ? 'shadow-md hover:shadow-lg' : 'shadow-sm hover:shadow-md'
                  }`}
                >
                  <Link
                    to={`/products/${lot.id}`}
                    className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden block"
                  >
                    <img
                      src={lot.imageUrl}
                      alt={lot.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                      <span
                        className={`px-2 py-0.5 rounded-md font-label-badge text-label-badge flex items-center gap-0.5 shadow-sm ${
                          lot.isUrgentToday
                            ? 'bg-secondary text-on-secondary'
                            : 'bg-surface-container-highest text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {lot.isUrgentToday ? 'alarm' : 'schedule'}
                        </span>
                        {lot.isUrgentToday ? '本日中' : lot.expiryLabel}
                      </span>
                      {lot.discountPercent > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-primary text-on-primary font-label-badge text-label-badge flex items-center gap-0.5 shadow-sm">
                          <span
                            className="material-symbols-outlined text-[13px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            eco
                          </span>
                          レスキュー対象
                        </span>
                      )}
                    </div>
                    {lot.discountPercent > 0 && (
                      <div className="absolute top-2 right-2 bg-secondary-container text-on-primary-container px-2 py-1 rounded-lg font-label-numeric-md text-label-numeric-md shadow-md">
                        -{lot.discountPercent}%
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-0.5 rounded text-on-surface font-label-caption text-label-caption flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-primary">
                        location_on
                      </span>
                      {lot.shelfShort}
                    </div>
                  </Link>

                  <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest text-primary font-label-caption text-label-caption font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">storefront</span>
                          {selectedStore.name} 限定価格・在庫
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-label-caption text-label-caption text-secondary font-bold">
                          {lot.campaignTag || lot.category}
                        </span>
                        <span
                          className={`font-label-caption text-label-caption font-medium flex items-center gap-0.5 ${
                            lot.stockQty <= 3 ? 'text-error' : 'text-on-surface-variant'
                          }`}
                        >
                          {lot.stockQty <= 3 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                          )}
                          残り約{lot.stockQty}
                          {lot.stockUnit}
                        </span>
                      </div>
                      <Link to={`/products/${lot.id}`}>
                        <h3 className="font-headline-md text-body-lg text-on-surface font-bold leading-tight group-hover:text-primary transition-colors">
                          {lot.productName}
                        </h3>
                      </Link>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-0.5">
                        {lot.aiRecipeTag || lot.shelfLocation}
                      </p>
                    </div>

                    {/* Price & Expiry Strip */}
                    <div className="pt-space-xs bg-surface-container-low/50 -mx-space-md px-space-md py-space-xs rounded-xl">
                      <div className="flex items-baseline justify-between gap-1">
                        <div>
                          {lot.discountPercent > 0 && (
                            <span className="font-body-sm text-body-sm text-outline line-through mr-1.5">
                              ¥{lot.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <span
                            className={`font-label-numeric-lg text-headline-lg font-bold ${
                              lot.discountPercent > 0 ? 'text-secondary' : 'text-on-surface'
                            }`}
                          >
                            ¥{lot.discountedPrice.toLocaleString()}
                          </span>
                          <span className="font-label-caption text-label-caption text-on-surface-variant ml-1">
                            (税込 ¥{taxIncluded.toLocaleString()})
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-label-caption text-label-caption block ${
                              lot.isUrgentToday
                                ? 'text-secondary font-bold'
                                : 'text-on-surface-variant font-medium'
                            }`}
                          >
                            消費期限: {lot.expiryLabel}
                          </span>
                        </div>
                      </div>
                      <p className="font-label-caption text-label-caption text-on-surface-variant/80 mt-1">
                        店頭参考在庫: 約{lot.stockQty}
                        {lot.stockUnit} ※お取り置きはできません
                      </p>
                    </div>

                    {/* Recipe Trigger Action */}
                    <Link
                      to={`/ai-recipes?lot=${lot.id}`}
                      className={`w-full mt-1 py-3 px-space-md rounded-xl font-headline-md text-body-md font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        isHeroHighlight
                          ? 'bg-primary hover:bg-primary-container text-on-primary shadow-sm'
                          : 'bg-surface-container-highest hover:bg-primary hover:text-on-primary text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      <span>この食材でレシピを探す</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* In-Store Shopping How-It-Works Visual Card */}
      <section className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-lg">
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs max-w-2xl">
            <span className="font-label-caption text-label-caption uppercase tracking-wider text-primary font-bold">
              店頭ショッピングの流れ
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              店舗で見つけた食材から、今夜の献立をAIが最短で組み立てます
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Food Rescueは店頭の棚にある値引き品・見切り品を手に取っていただくためのナビゲーションです。食材を選んで「この食材でレシピを探す」を押すと、店内にある他の買い足し推奨食材と調味料を自動で提案します。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-space-sm w-full md:w-auto flex-shrink-0">
            <div className="flex flex-col items-center text-center p-space-sm bg-surface-container-low rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-1">
                1
              </div>
              <span className="font-body-sm text-body-sm font-bold text-on-surface">
                棚で食材確認
              </span>
              <span className="font-label-caption text-label-caption text-on-surface-variant">
                見切り品を発見
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-space-sm bg-surface-container-low rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-1">
                2
              </div>
              <span className="font-body-sm text-body-sm font-bold text-on-surface">
                AIレシピ生成
              </span>
              <span className="font-label-caption text-label-caption text-on-surface-variant">
                買い足しリスト確認
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-space-sm bg-surface-container-low rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-1">
                3
              </div>
              <span className="font-body-sm text-body-sm font-bold text-on-surface">
                店頭レジでお会計
              </span>
              <span className="font-label-caption text-label-caption text-on-surface-variant">
                食品ロス削減完了
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
