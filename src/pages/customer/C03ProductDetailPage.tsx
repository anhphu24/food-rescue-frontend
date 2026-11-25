import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const C03ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const { storeLots, activeStoreLots, selectedStore, recipes, productMasters } = useApp();
  const [shelfModalOpen, setShelfModalOpen] = useState(false);

  const lot =
    storeLots.find((l) => l.id === id) || activeStoreLots[0] || storeLots[0];
  const master = productMasters.find((m) => m.id === lot.productId);
  const relatedRecipes = recipes.slice(0, 4);
  const crossSellLots = activeStoreLots.filter((l) => l.id !== lot.id).slice(0, 3);

  const savingsYen = Math.max(0, lot.originalPrice - lot.discountedPrice);

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col gap-space-lg">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant flex-wrap"
        aria-label="パンくずリスト"
      >
        <Link to="/" className="hover:text-primary transition-colors">
          ホーム
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link to="/products" className="hover:text-primary transition-colors">
          {selectedStore.name} の食材
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-bold truncate">{lot.productName}</span>
      </nav>

      {/* In-store Rule Ribbon */}
      <div className="bg-secondary-fixed/50 text-on-secondary-fixed rounded-xl px-space-md py-2.5 flex items-center justify-between gap-space-sm flex-wrap">
        <div className="flex items-center gap-2 font-body-sm text-body-sm font-bold">
          <span className="material-symbols-outlined text-secondary text-[20px]">info</span>
          <span>店頭直接購入専用（取り置き・オンライン決済不可 / レジにて見切り価格＆セット割適用）</span>
        </div>
        <span className="font-label-badge text-label-badge bg-secondary text-on-secondary px-2 py-0.5 rounded-full">
          {lot.remainingTimeLabel}
        </span>
      </div>

      {/* Main 2-Column Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left: Product Photo + Shelf Banner + Specs */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="relative rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm aspect-[4/3]">
            <img
              src={lot.imageUrl}
              alt={lot.productName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="bg-secondary text-on-secondary font-headline-md text-body-lg font-bold px-3.5 py-1 rounded-full shadow-md">
                {lot.discountPercent}% OFF 見切り品
              </span>
              <span className="bg-surface/95 backdrop-blur-sm text-on-surface font-label-badge text-label-badge px-3 py-1 rounded-full shadow-sm">
                消費期限 {lot.expiryLabel}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-on-surface/85 backdrop-blur-md text-surface rounded-xl px-space-md py-2.5 flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-[20px]">
                  inventory_2
                </span>
                <span className="font-body-sm text-body-sm">
                  店頭現品目安:{' '}
                  <strong className="text-primary-fixed text-body-lg">
                    残り {lot.stockQty}
                    {lot.stockUnit}
                  </strong>
                </span>
              </div>
              <span className="font-label-caption text-label-caption text-surface/80">
                最終確認 18:45
              </span>
            </div>
          </div>

          {/* Shelf Location Banner with Map Modal Trigger */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">pin_drop</span>
              </div>
              <div>
                <span className="font-label-caption text-label-caption text-on-surface-variant">
                  売り場ロケーション（{selectedStore.name}）
                </span>
                <div className="font-body-lg text-body-lg font-bold text-on-surface">
                  {lot.shelfLocation}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShelfModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-space-md py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-body-sm text-body-sm font-bold transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              <span>売り場マップを見る</span>
            </button>
          </div>

          {/* Product Details & CO2 Impact Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              商品情報・食品ロス削減インパクト
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {master?.description ||
                '店頭で見切りシールが貼付された新鮮な食品ロス削減対象商品です。本日中のお召し上がり・調理におすすめです。'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm bg-surface-container-low p-space-md rounded-xl">
              <div>
                <span className="font-label-caption text-label-caption text-outline block">
                  カテゴリー
                </span>
                <span className="font-body-sm font-bold text-on-surface">{lot.category}</span>
              </div>
              <div>
                <span className="font-label-caption text-label-caption text-outline block">
                  産地・製造
                </span>
                <span className="font-body-sm font-bold text-on-surface">
                  {master?.origin || '国産'}
                </span>
              </div>
              <div>
                <span className="font-label-caption text-label-caption text-outline block">
                  規格・容量
                </span>
                <span className="font-body-sm font-bold text-on-surface">
                  {master?.spec || '1パック'}
                </span>
              </div>
              <div>
                <span className="font-label-caption text-label-caption text-outline block">
                  JANコード
                </span>
                <span className="font-label-numeric-md text-body-sm text-on-surface">
                  {lot.janCode}
                </span>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-space-md flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[28px]">eco</span>
                <div>
                  <span className="font-body-sm font-bold text-primary block">
                    この1パックを救うと CO2 約 {lot.co2ReductionKg}kg 削減
                  </span>
                  <span className="font-label-caption text-label-caption text-on-surface-variant">
                    杉の木が約1ヶ月かけて吸収するCO2量に相当します
                  </span>
                </div>
              </div>
              <span className="font-label-numeric-md text-primary bg-primary-fixed px-3 py-1 rounded-full shrink-0">
                -{lot.co2ReductionKg}kg
              </span>
            </div>
          </div>
        </div>

        {/* Right: Dual Price Card + AI Recipe CTA + Store Card */}
        <div className="lg:col-span-5 flex flex-col gap-space-md lg:sticky lg:top-20">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-badge text-label-badge bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                {lot.category}
              </span>
              <span className="font-label-badge text-label-badge bg-tertiary-container text-on-tertiary-container px-2.5 py-0.5 rounded-full">
                {lot.campaignTag}
              </span>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {lot.productName}
            </h1>

            {/* Price Comparison Box */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex items-end justify-between">
              <div>
                <span className="font-label-caption text-label-caption text-on-surface-variant block">
                  店頭見切り価格（税込）
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-headline-xl text-headline-xl text-secondary font-label-numeric-lg">
                    ¥{lot.discountedPrice.toLocaleString()}
                  </span>
                  <span className="font-body-md text-body-md text-outline line-through">
                    ¥{lot.originalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-secondary-fixed text-on-secondary-fixed font-label-badge text-label-badge px-2.5 py-1 rounded-lg">
                  ¥{savingsYen} お得
                </span>
              </div>
            </div>

            {/* Extra AI Set Discount Highlight */}
            <div className="bg-gradient-to-r from-primary/10 to-tertiary-fixed/25 rounded-xl p-space-md flex flex-col gap-space-sm">
              <div className="flex items-center gap-2 text-primary font-body-md font-bold">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                <span>AIレシピまとめ買いセット割 対象品</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                この食材を使ったAIレシピの対象食材（計3品）を一緒に店頭レジで購入すると、見切り価格から<strong>さらに¥100引き</strong>になります。
              </p>
              <Link
                to="/ai-recipes"
                className="w-full py-3.5 px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-lg text-body-lg font-bold shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
                <span>この食材のAIレシピ＆セット割を見る</span>
              </Link>
              <Link
                to="/recipe-set/recipe-gyudon"
                className="w-full py-2.5 px-space-md rounded-xl bg-surface-container-lowest hover:bg-surface-container text-primary font-body-sm text-body-sm font-bold text-center transition-colors"
              >
                おすすめ「絶品おうち牛丼セット」へ直接進む →
              </Link>
            </div>

            {/* Store Info Summary */}
            <div className="pt-space-sm border-t border-surface-container flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-primary text-[22px]">store</span>
                <div className="min-w-0">
                  <div className="font-body-md font-bold text-on-surface truncate">
                    {selectedStore.name}
                  </div>
                  <div className="font-label-caption text-label-caption text-on-surface-variant">
                    {selectedStore.address} ・ 営業 {selectedStore.hours}
                  </div>
                </div>
              </div>
              <span className="font-label-badge text-label-badge text-primary shrink-0">
                徒歩{selectedStore.walkMinutes}分
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Teaser AI Recipes Section */}
      <section className="flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            この店舗の見切り品で作れるAIレシピ
          </h2>
          <Link to="/ai-recipes" className="font-body-sm text-primary font-bold hover:underline">
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {relatedRecipes.map((rec) => (
            <Link
              key={rec.id}
              to={`/recipe-set/${rec.id}`}
              className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-36 bg-surface-container">
                <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-primary text-on-primary font-label-caption text-label-caption px-2 py-0.5 rounded-full font-bold">
                  セット割 -¥{rec.setDiscountYen}
                </span>
              </div>
              <div className="p-space-sm flex flex-col gap-1">
                <span className="font-label-caption text-label-caption text-on-surface-variant">
                  調理 {rec.cookTimeMinutes}分 ・ {rec.difficulty}
                </span>
                <h3 className="font-body-md font-bold text-on-surface line-clamp-2">{rec.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cross-sell In-Store Items */}
      <section className="flex flex-col gap-space-md">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          同じ店舗の他の見切り品
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
          {crossSellLots.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.id}`}
              className="bg-surface-container-lowest rounded-xl p-space-sm shadow-xs hover:shadow-sm transition-all flex items-center gap-space-sm"
            >
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="font-label-caption text-secondary font-bold">
                  {item.discountPercent}% OFF
                </span>
                <div className="font-body-sm font-bold text-on-surface truncate">
                  {item.productName}
                </div>
                <div className="font-label-numeric-md text-secondary">
                  ¥{item.discountedPrice}
                  <span className="text-outline line-through text-body-sm font-normal ml-1.5">
                    ¥{item.originalPrice}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Shelf Map Modal (Preserved from Stitch C03) */}
      {shelfModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-on-background/50 backdrop-blur-sm flex items-center justify-center p-space-md"
          onClick={() => setShelfModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl flex flex-col gap-space-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">map</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  {selectedStore.name} 売り場案内マップ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShelfModalOpen(false)}
                className="p-1 rounded-full text-outline hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low rounded-xl p-space-md grid grid-cols-2 gap-space-sm">
              {[
                { zone: 'Aisle 01', label: '青果・特設ワゴン', active: lot.category === '青果' },
                { zone: 'Aisle 02', label: '鮮魚・氷台ワゴン', active: lot.category === '鮮魚' },
                { zone: 'Aisle 03', label: '精肉・奥冷ケース', active: lot.category === '精肉' },
                {
                  zone: 'Aisle 04',
                  label: '惣菜・ベーカリー・日配',
                  active: !['青果', '鮮魚', '精肉'].includes(lot.category),
                },
              ].map((z) => (
                <div
                  key={z.zone}
                  className={`p-space-md rounded-xl flex flex-col items-center text-center gap-1 ${
                    z.active
                      ? 'bg-primary text-on-primary ring-4 ring-primary/20 shadow-md'
                      : 'bg-surface-container-lowest text-on-surface'
                  }`}
                >
                  <span className="font-label-caption text-label-caption opacity-80">{z.zone}</span>
                  <span className="font-body-md font-bold">{z.label}</span>
                  {z.active && (
                    <span className="mt-1 bg-secondary-container text-on-secondary font-label-caption px-2 py-0.5 rounded-full font-bold">
                      現在お探しの売り場
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              対象場所: <strong className="text-on-surface">{lot.shelfLocation}</strong>
            </p>

            <button
              type="button"
              onClick={() => setShelfModalOpen(false)}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-headline-md text-body-md font-bold cursor-pointer hover:bg-primary-container transition-colors text-center"
            >
              閉じてお買い物を続ける
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
