import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const C06_IMAGES = {
  beef: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD6duvvefBAQAnS80o9MyL_aazdgwIYK4XwCKK6MVgY2yP-o-Kb9aVluVP-GtP1t1l9pJvLgbOrrUh9n3BQAMavMG6iH4spL1MOvM0rE3vt0smWtZRBMZRMC8vhAIxRJkoyizu6m5tNQDYOqohNaXaqpfSzCZ09acORJ5YNik68gKJbsS19OiSNoHParLCWyXJlXZsEbt0SmtGTx5MTXXLT0tdDfhwo5yr3r4bYqnj',
  onion:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCR1JHRQCCIQtbVWb7qLWEARDPqfl3HwmdTc5Ozc5DkN-YGw_EpG6LCj1ooc4pQOdhjgpr7ju38NcG6D_GfdryJcm6OCokyNwzk0NhPJTrWMCQHgZT23qj6z1MqBHjAhLqrqzDgZ8fdt46lDKarkh5EBmorGl9HfE7OpX5jKn7dfHVJKj7xGfiiDnN06_az-kTDPzj1sgTR7DnKyniRRgcuAxW2yXJsGca5oVd204Ts',
  ginger:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAngc-eWh3VmSxscM8x5whHWW6sBdHRoFIE9HfkI2Nryf8PlU0e7UrEuKHbGjpnAjiNUP1cdOc7qYhj-CO62gA-tjnv9ecHVyolfT8ZRCZPiaiMNoGhQbPgTXR_H2rE-AyQl-4xDXkjA_KrOZ0tDin1CG0dIVFUhtz3gPzyQA1IPeA3o21Cf_GZzwm2Hq4c0HxEF1tPSwgia4RScy28Ac8YRpaZOLbUjqzo03QUr-8p',
};

export const C06CouponConfirmPage: React.FC = () => {
  const { selectedStore, recipes, pendingCouponSelection, acquireCouponFromRecipe } = useApp();
  const [claiming, setClaiming] = useState(false);
  const [claimedCouponId, setClaimedCouponId] = useState<string | null>(null);

  const recipe =
    recipes.find((r) => r.id === pendingCouponSelection?.recipeId) || recipes[0];

  const handleClaim = () => {
    if (claiming || claimedCouponId) return;
    setClaiming(true);
    setTimeout(() => {
      const ids =
        pendingCouponSelection?.selectedIngredientIds ||
        recipe.ingredients.filter((i) => i.group !== 'seasoning').map((i) => i.id);
      const created = acquireCouponFromRecipe(recipe.id, ids);
      setClaiming(false);
      setClaimedCouponId(created?.id || 'cp-active-1');
    }, 350);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-margin-mobile lg:px-margin py-space-md">
      {/* Top Navigation & Branch Status */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
        <Link
          to={`/recipe-set/${recipe.id}`}
          className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-primary transition-colors font-body-sm text-body-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>レシピセット詳細へ戻る</span>
        </Link>
        <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-body-sm text-body-sm font-medium">
            {selectedStore.name} リアルタイム在庫連動中
          </span>
          <span className="text-label-caption text-on-surface-variant font-label-caption">
            18:42 更新
          </span>
        </div>
      </div>

      {/* Stepper Tracker */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-md mb-space-lg shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm relative">
          <div className="flex items-center gap-space-xs">
            <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-numeric-md text-label-numeric-md">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
            <div className="min-w-0">
              <p className="font-label-caption text-label-caption text-primary">STEP 1 完了</p>
              <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                食材選択
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-numeric-md text-label-numeric-md">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </div>
            <div className="min-w-0">
              <p className="font-label-caption text-label-caption text-primary">STEP 2 完了</p>
              <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                レシピ決定
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-numeric-md text-label-numeric-md shadow-sm">
              <span>3</span>
            </div>
            <div className="min-w-0">
              <p className="font-label-caption text-label-caption text-secondary font-bold">
                STEP 3 現在地
              </p>
              <p className="font-headline-md text-body-md text-on-surface truncate">クーポン確認</p>
            </div>
          </div>
          <div className="flex items-center gap-space-xs opacity-60">
            <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-numeric-md text-label-numeric-md">
              <span>4</span>
            </div>
            <div className="min-w-0">
              <p className="font-label-caption text-label-caption text-on-surface-variant">
                STEP 4 次のステップ
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                店頭レジでお会計
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Intro */}
      <div className="mb-space-lg">
        <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed mb-space-xs">
          <span className="material-symbols-outlined text-[16px] text-secondary">eco</span>
          <span className="font-label-badge text-label-badge font-bold">
            食品ロス救済セット割
          </span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
          レシピセット割引クーポンの取得確認
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
          対象の食材3点を店内の各売り場でお選びいただき、レジでバーコードを提示することで、お会計時に
          <strong className="text-secondary font-bold">一括 ¥100 引き</strong>が適用されます。
        </p>
      </div>

      {/* Main Content Layout: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {/* Physical Ticket Style Coupon Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden relative">
            <div className="h-2 bg-gradient-to-r from-primary via-tertiary to-secondary-container" />
            <div className="p-space-lg">
              <div className="flex items-start justify-between gap-space-sm mb-space-sm flex-wrap">
                <span className="px-space-sm py-1 rounded-md bg-secondary text-on-secondary font-label-badge text-label-badge font-bold inline-flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[14px]">confirmation_number</span>
                  <span>店頭レスキュー限定 3点まとめ買いセット割</span>
                </span>
                <span className="px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-caption text-label-caption font-bold">
                  CO₂ 約380g削減
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface leading-tight mb-space-xs">
                絶品おうち牛丼 セット割引きクーポン
              </h2>

              <div className="my-space-md p-space-md rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-caption text-label-caption text-on-surface-variant">
                    お会計時レジ提示で
                  </span>
                  <span className="font-headline-md text-headline-md text-secondary">
                    合計金額から割引
                  </span>
                </div>
                <div className="flex items-baseline text-secondary">
                  <span className="font-headline-md text-headline-md font-bold">-¥</span>
                  <span className="font-label-numeric-lg text-[40px] leading-none font-bold tracking-tight">
                    100
                  </span>
                  <span className="font-label-badge text-label-badge ml-1 text-on-secondary-container font-bold">
                    （税込相当）
                  </span>
                </div>
              </div>

              <div className="space-y-space-xs text-body-sm font-body-sm bg-surface-container-lowest rounded-lg">
                <div className="flex items-center gap-space-sm text-on-surface-variant flex-wrap">
                  <span className="material-symbols-outlined text-[18px] text-primary">store</span>
                  <span className="text-on-surface font-medium">対象店舗:</span>
                  <span className="font-bold text-on-surface">{selectedStore.name} 限定</span>
                </div>
                <div className="flex items-center gap-space-sm text-on-surface-variant flex-wrap">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    schedule
                  </span>
                  <span className="text-on-surface font-medium">有効期限:</span>
                  <span className="font-bold text-secondary">本日 21:00 まで有効</span>
                  <span className="text-label-caption text-on-surface-variant">
                    （精肉売り場の当日消費期限に準ずる）
                  </span>
                </div>
                <div className="flex items-center gap-space-sm text-on-surface-variant flex-wrap">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    receipt_long
                  </span>
                  <span className="text-on-surface font-medium">提示方法:</span>
                  <span>会計時にマイクーポン内のバーコードをレジでスキャン</span>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-between px-space-md bg-surface-container-low py-space-xs">
              <span className="text-label-caption font-label-caption text-on-surface-variant tracking-widest uppercase">
                FOOD RESCUE VERIFIED SET COUPON
              </span>
              <span className="font-label-numeric-md text-label-caption text-on-surface-variant">
                ID: RCP-2025-0549
              </span>
            </div>
          </div>

          {/* Target Products Checklist */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  shopping_basket
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  対象商品チェックリスト (合計3点)
                </h3>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                店内でご自身でカゴへ投入
              </span>
            </div>

            <div className="space-y-space-sm">
              <div className="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <img
                  alt="国産牛肩ローススライス 250g"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  src={C06_IMAGES.beef}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-space-xs mb-0.5">
                    <span className="px-space-xs py-0.5 rounded bg-error text-on-error font-label-badge text-label-caption font-bold">
                      見切り品 30% OFF
                    </span>
                    <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-caption text-label-caption">
                      1F 精肉コーナー
                    </span>
                  </div>
                  <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                    国産牛肩ローススライス 250g
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    消費期限: 本日22:00まで / 店頭在庫 残り5点
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="block line-through text-outline font-label-numeric-md text-body-sm">
                    ¥780
                  </span>
                  <span className="font-label-numeric-md text-label-numeric-md text-on-surface font-bold">
                    ¥546
                  </span>
                  <span className="text-label-caption text-on-surface-variant font-label-caption block">
                    税抜
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <img
                  alt="北海道産たまねぎ 1個"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  src={C06_IMAGES.onion}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-space-xs mb-0.5">
                    <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-badge text-label-caption font-bold">
                      規格外特価
                    </span>
                    <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-caption text-label-caption">
                      2F 青果コーナー
                    </span>
                  </div>
                  <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                    北海道産たまねぎ 1個
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    表面微キズあり（品質良好・完熟）
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="block line-through text-outline font-label-numeric-md text-body-sm">
                    ¥88
                  </span>
                  <span className="font-label-numeric-md text-label-numeric-md text-on-surface font-bold">
                    ¥58
                  </span>
                  <span className="text-label-caption text-on-surface-variant font-label-caption block">
                    税抜
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-space-md p-space-sm rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low transition-colors">
                <img
                  alt="刻み紅生姜 1パック (60g)"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  src={C06_IMAGES.ginger}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-space-xs mb-0.5">
                    <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-on-surface font-label-caption text-label-caption font-medium">
                      定番添え物
                    </span>
                    <span className="px-space-xs py-0.5 rounded bg-surface-container text-on-surface font-label-caption text-label-caption">
                      1F 漬物・惣菜コーナー
                    </span>
                  </div>
                  <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                    刻み紅生姜 1パック (60g)
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    牛丼を劇的においしく引き立てるアクセント
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-label-numeric-md text-label-numeric-md text-on-surface font-bold">
                    ¥98
                  </span>
                  <span className="text-label-caption text-on-surface-variant font-label-caption block">
                    税抜
                  </span>
                </div>
              </div>
            </div>

            {/* Price Calculation Summary */}
            <div className="mt-space-md pt-space-sm bg-surface-container-low/30 rounded-lg p-space-sm space-y-space-xs">
              <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
                <span>対象3点 単品通常合計</span>
                <span className="line-through">¥966 (税抜)</span>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm text-on-surface">
                <span>見切り・特価適用後 合計</span>
                <span className="font-label-numeric-md font-bold">¥702 (税抜)</span>
              </div>
              <div className="flex justify-between items-center text-body-sm font-body-sm text-secondary font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">local_offer</span>
                  <span>レシピセットまとめ買い割引</span>
                </span>
                <span className="font-label-numeric-md font-bold">-¥100</span>
              </div>
              <div className="h-px bg-outline-variant/40 my-space-xs" />
              <div className="flex justify-between items-baseline pt-space-xs">
                <div>
                  <span className="font-headline-md text-headline-md text-on-surface">
                    クーポン適用後 目安価格
                  </span>
                  <span className="text-label-caption text-on-surface-variant block">
                    ※店頭レジにて精算（参考税込: ¥650）
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-headline-xl text-headline-xl text-primary font-bold">
                    ¥602
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant ml-1 font-normal">
                    （税抜）
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          {/* Critical Notice Card */}
          <div className="bg-surface-container-highest rounded-xl p-space-md shadow-sm">
            <div className="flex items-start gap-space-sm mb-space-sm">
              <span className="material-symbols-outlined text-secondary text-[24px] flex-shrink-0">
                warning
              </span>
              <div>
                <h3 className="font-headline-md text-body-lg font-bold text-on-secondary-container">
                  【重要】本サービスはお取り置き・商品確保サービスではありません
                </h3>
                <p className="font-label-caption text-label-caption text-on-surface-variant mt-0.5">
                  店頭の食品ロス低減のためのセルフお買い物支援システムです
                </p>
              </div>
            </div>
            <div className="space-y-space-xs text-body-sm font-body-sm text-on-surface">
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[16px] flex-shrink-0 mt-0.5">
                  check_circle
                </span>
                <p>
                  <strong>クーポンの取得では、商品の在庫は確保・予約されません。</strong>
                </p>
              </div>
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[16px] flex-shrink-0 mt-0.5">
                  check_circle
                </span>
                <p>
                  店内の売り場でご自身で商品をカゴに入れ、通常のお会計時にレジにてバーコードを提示してください。
                </p>
              </div>
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[16px] flex-shrink-0 mt-0.5">
                  check_circle
                </span>
                <p>
                  実店舗の在庫状況は流動的なため、
                  <strong>売り場への移動中に売り切れとなる場合がございます</strong>
                  。あらかじめご了承ください。
                </p>
              </div>
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[16px] flex-shrink-0 mt-0.5">
                  check_circle
                </span>
                <p>
                  基本調味料（醤油、みりん、酒、砂糖など）はご家庭の調味料をご利用いただく想定のため、セット割引対象商品には含まれません。
                </p>
              </div>
            </div>

            <div className="mt-space-md p-space-sm bg-surface-container-lowest rounded-lg">
              <p className="font-label-badge text-label-badge text-on-surface-variant mb-space-xs">
                店舗でのお買い物ステップ
              </p>
              <div className="grid grid-cols-3 gap-space-xs text-center">
                <div className="p-space-xs rounded bg-surface-container-low">
                  <span className="material-symbols-outlined text-primary text-[20px] block mx-auto">
                    touch_app
                  </span>
                  <span className="font-label-caption text-label-caption block font-bold mt-1">
                    1. クーポン保存
                  </span>
                </div>
                <div className="p-space-xs rounded bg-surface-container-low">
                  <span className="material-symbols-outlined text-primary text-[20px] block mx-auto">
                    shopping_cart
                  </span>
                  <span className="font-label-caption text-label-caption block font-bold mt-1">
                    2. 売り場で選ぶ
                  </span>
                </div>
                <div className="p-space-xs rounded bg-surface-container-low">
                  <span className="material-symbols-outlined text-secondary text-[20px] block mx-auto">
                    qr_code_scanner
                  </span>
                  <span className="font-label-caption text-label-caption block font-bold mt-1">
                    3. レジで提示
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Cooking Reference Quick Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-tertiary text-[22px]">restaurant</span>
              <div>
                <p className="font-headline-md text-body-md text-on-surface">
                  調理の目安: 絶品おうち牛丼
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  調理時間 15分 / 2人前 / 難易度 かんたん
                </p>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
              クーポン取得完了後、いつでも「AIレシピ」タブから詳しい作り方手順と火加減のコツを確認できます。
            </p>
          </div>

          {/* Primary Action Area */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
            {!claimedCouponId ? (
              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming}
                className={`w-full py-space-md px-space-lg rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary font-headline-md text-body-lg font-bold flex items-center justify-center gap-space-xs shadow-md transition-all active:scale-[0.99] cursor-pointer ${
                  claiming ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    claiming ? 'animate-spin' : ''
                  }`}
                >
                  {claiming ? 'progress_activity' : 'bookmark_add'}
                </span>
                <span>
                  {claiming ? '処理中...' : 'このクーポンを取得してマイクーポンへ保存する'}
                </span>
              </button>
            ) : (
              <div className="p-space-md rounded-xl bg-primary-container text-on-primary-container animate-fadeIn">
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                  <span className="font-headline-md text-body-md font-bold">
                    クーポンをマイクーポンに保存しました！
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-primary-container/90 mb-space-sm">
                  {selectedStore.name}のレジにて「マイクーポン」のバーコードをご提示ください。
                </p>
                <div className="flex gap-space-xs">
                  <Link
                    to={`/my-coupons/${claimedCouponId}`}
                    className="flex-1 text-center py-2 px-space-sm rounded-lg bg-surface-container-lowest text-primary font-body-sm text-body-sm font-bold shadow-sm hover:bg-surface-container-low transition-colors"
                  >
                    マイクーポンを開く
                  </Link>
                  <Link
                    to={`/recipe-set/${recipe.id}`}
                    className="flex-1 text-center py-2 px-space-sm rounded-lg bg-primary-fixed text-on-primary-fixed font-body-sm text-body-sm font-bold hover:bg-primary-fixed-dim transition-colors"
                  >
                    レシピ詳細を見る
                  </Link>
                </div>
              </div>
            )}

            <div className="text-center pt-space-xs">
              <Link
                to={`/recipe-set/${recipe.id}`}
                className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary font-body-sm text-body-sm transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>レシピ詳細に戻って食材を変更する</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Trust Footnote */}
      <div className="mt-space-lg py-space-sm px-space-md bg-surface-container-low/50 rounded-lg flex flex-wrap items-center justify-between gap-2 text-label-caption text-on-surface-variant">
        <span>
          ※クーポンの重複取得・転売は固くお断りいたします。1回のお会計につき1回のみ有効です。
        </span>
        <span className="font-label-numeric-md">Food Rescue System ver 2.4.0</span>
      </div>
    </div>
  );
};
