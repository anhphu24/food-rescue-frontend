import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BarcodeSvg } from '../../components/BarcodeSvg';

const ITEM_ICONS = ['set_meal', 'nutrition', 'ramen_dining', 'local_dining'];

export const C08CouponBarcodePage: React.FC = () => {
  const { id } = useParams();
  const { coupons, redeemCoupon } = useApp();
  const [isHighlit, setIsHighlit] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const coupon = coupons.find((c) => c.id === id) || coupons[0];
  const isUsed = coupon.status === 'USED';
  const isAvailable = coupon.status === 'ACQUIRED';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(coupon.token)
        .then(() => showToast(`クーポンコードをクリップボードにコピーしました: ${coupon.token}`))
        .catch(() => showToast(`コード: ${coupon.token}`));
    } else {
      showToast(`コード: ${coupon.token}`);
    }
  };

  const handleToggleHighlight = () => {
    setIsHighlit((prev) => {
      const next = !prev;
      if (next) {
        showToast('スキャナー読み取り用ハイコントラスト表示中');
      }
      return next;
    });
  };

  const handleStaffComplete = () => {
    if (!isAvailable) return;
    const { result } = redeemCoupon(coupon.token, true);
    if (result.ok) {
      showToast(`レジ確認が完了しました (¥${coupon.discountAmountYen}引き適用済み)`);
    } else {
      showToast(result.message);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Interactive Brightness Flash Notification Toast */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
          toastMessage
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-6 pointer-events-none'
        }`}
      >
        <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-full shadow-xl flex items-center gap-space-xs font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-primary-fixed text-[18px]">
            check_circle
          </span>
          <span>{toastMessage || 'クーポン番号をコピーしました'}</span>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-margin-mobile lg:px-margin py-space-lg space-y-space-lg">
        {/* Back to My Coupons Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-space-sm">
          <Link
            to="/my-coupons"
            className="inline-flex items-center gap-space-xs text-primary hover:text-primary-container font-body-md text-body-md transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span className="font-medium">マイクーポン一覧に戻る</span>
          </Link>
          <div className="flex items-center gap-space-xs bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">storefront</span>
            <span>{coupon.storeName} 専用</span>
          </div>
        </div>

        {/* Presentation Ticket Hero Container (Exact Stitch C08) */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden relative">
          {/* Upper Header Ribbon / Alert Bar */}
          <div className="bg-primary text-on-primary px-space-md lg:px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs font-body-md text-body-md font-bold">
              <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
              <span>レジ提示用クーポン画面</span>
            </div>
            <div
              className={`flex items-center gap-space-xs px-space-sm py-0.5 rounded-full text-label-badge font-label-badge backdrop-blur-sm ${
                isAvailable ? 'bg-surface-container-lowest/15' : 'bg-error/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAvailable ? 'bg-primary-fixed animate-pulse' : 'bg-error-container'
                }`}
              />
              <span>
                {isAvailable
                  ? '利用可能 (未スキャン)'
                  : isUsed
                    ? '使用済み (レジ照合完了)'
                    : '有効期限切れ'}
              </span>
            </div>
          </div>

          {/* Core Voucher Content */}
          <div className="p-space-md lg:p-space-xl space-y-space-lg">
            {/* Title & Huge Discount Callout */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
              <div className="space-y-space-xs flex-1">
                <div className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-badge text-label-badge">
                  <span className="material-symbols-outlined text-[14px]">local_offer</span>
                  <span>{coupon.items.length}点まとめ買いセット割</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">
                  {coupon.title}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  お会計の際、こちらのバーコードまたはクーポン番号を店員（またはセルフレジスキャナー）にご提示ください。
                </p>
              </div>
              {/* Big Discount Number Badge */}
              <div className="flex md:flex-col items-baseline md:items-end justify-between bg-surface-container-low md:bg-transparent p-space-sm md:p-0 rounded-lg shrink-0">
                <span className="font-body-sm text-body-sm text-secondary font-bold">
                  レジにて即時割引
                </span>
                <div className="flex items-baseline gap-1 text-secondary">
                  <span className="font-label-numeric-lg text-label-numeric-lg">¥</span>
                  <span className="font-label-numeric-lg text-[42px] leading-none tracking-tight">
                    {coupon.discountAmountYen}
                  </span>
                  <span className="font-headline-md text-headline-md font-bold">引き</span>
                </div>
              </div>
            </div>

            {/* High-Contrast Register Scanner Box */}
            <div
              className={`bg-surface-container-lowest p-space-md lg:p-space-lg rounded-xl shadow-md space-y-space-md relative overflow-hidden transition-all duration-300 ${
                isHighlit ? 'ring-4 ring-secondary-container scale-[1.01]' : ''
              } ${!isAvailable ? 'opacity-60 grayscale' : ''}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs text-secondary font-body-sm text-body-sm font-bold bg-secondary-fixed/50 px-space-sm py-1 rounded-md">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  <span>画面の明るさを最大にしてスキャンしてください</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    schedule
                  </span>
                  <span>
                    有効期限: <strong className="text-on-surface">{coupon.validUntilLabel}</strong>
                  </span>
                  {isAvailable && (
                    <span className="font-label-numeric-md text-label-numeric-md text-error ml-1">
                      (残り 2時間12分)
                    </span>
                  )}
                </div>
              </div>

              {/* Crisp 1D High-Density Barcode */}
              <div className="bg-surface-container-lowest py-space-md px-space-sm flex flex-col items-center justify-center rounded-lg">
                <div
                  aria-label={`Barcode: ${coupon.token}`}
                  className="w-full max-w-md h-28 flex items-center justify-center overflow-hidden select-none"
                >
                  <BarcodeSvg code={coupon.token} height={108} className="w-full max-w-md" />
                </div>

                {/* Numeric Code with Quick Copy Utility */}
                <div className="mt-space-sm flex flex-wrap items-center justify-center gap-space-sm">
                  <span className="font-label-numeric-lg text-label-numeric-lg tracking-widest text-on-surface font-mono select-all">
                    {coupon.token}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-space-sm py-1 rounded-md bg-surface-container-high hover:bg-surface-variant text-on-surface text-body-sm font-body-sm transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span>コードをコピー</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleHighlight}
                    className="inline-flex items-center gap-1 px-space-sm py-1 rounded-md bg-secondary-fixed hover:bg-secondary-fixed-dim text-on-secondary-fixed text-body-sm font-body-sm transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isHighlit ? 'close' : 'brightness_high'}
                    </span>
                    <span>{isHighlit ? '通常表示に戻す' : '画面ハイライト表示'}</span>
                  </button>
                </div>
                <p className="text-label-caption font-label-caption text-outline mt-1">
                  ※スキャナーで読み取れない場合は、上記の英数字番号を直接レジへご入力ください。
                </p>
              </div>
            </div>

            {/* Cashier & Shopper Item Validation Checklist */}
            <div className="bg-surface-container-low rounded-xl p-space-md lg:p-space-lg space-y-space-md">
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[22px] flex-shrink-0 mt-0.5">
                  fact_check
                </span>
                <div className="space-y-0.5">
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    【レジスタッフ様・お客様確認用】対象商品チェック
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    買い物カゴに以下の
                    <strong>対象{coupon.items.length}商品</strong>
                    が入っているかご確認ください（{coupon.items.length}点同時購入時のみ
                    {coupon.discountAmountYen}円割引が適用されます）。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                {coupon.items.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="bg-surface-container-lowest rounded-lg p-space-sm flex flex-col justify-between shadow-sm relative overflow-hidden group"
                  >
                    {idx === 0 && (
                      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-error text-on-error font-label-badge text-label-badge">
                          見切り品
                        </span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mb-space-xs">
                        <span className="material-symbols-outlined text-[24px]">
                          {ITEM_ICONS[idx % ITEM_ICONS.length]}
                        </span>
                      </div>
                      <span className="font-label-badge text-label-badge text-primary font-bold">
                        {idx + 1}. {item.aisle}
                      </span>
                      <p className="font-body-md text-body-md font-bold text-on-surface leading-snug">
                        {item.name}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {item.spec || item.category}
                      </p>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between text-label-badge font-label-badge text-primary">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>{' '}
                        対象確認済
                      </span>
                      <span className="text-on-surface font-label-numeric-md text-body-sm">
                        参考: 約¥{item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* POS Rules & Operational Disclaimers */}
            <div className="bg-surface-container rounded-lg p-space-md space-y-space-xs text-on-surface-variant">
              <div className="flex items-center gap-space-xs font-body-sm text-body-sm font-bold text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-secondary">info</span>
                <span>ご利用上の注意・店頭オペレーション規約</span>
              </div>
              <ul className="space-y-1 text-body-sm font-body-sm">
                <li className="flex items-start gap-1.5">
                  <span className="text-secondary font-bold">・</span>
                  <span>
                    <strong>事前確保・お取り置き不可：</strong>
                    本サービスは商品の在庫確保や予約を行うものではありません。店頭売り場に対象在庫がない場合はご利用いただけません。
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-secondary font-bold">・</span>
                  <span>
                    <strong>1回限り有効：</strong>
                    本クーポンは1回のお会計につき1回のみ有効です。スキャン完了後は再利用できません。
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-secondary font-bold">・</span>
                  <span>
                    <strong>店頭POS連携：</strong>
                    レジ端末でのスキャン読み取り、または
                    <Link
                      to={`/store/register?token=${encodeURIComponent(coupon.token)}`}
                      className="text-primary underline hover:text-primary-container ml-1 font-medium"
                    >
                      店舗側レジ確認 (S05)
                    </Link>
                    でのコード照合・消込に対応します。
                  </span>
                </li>
              </ul>
            </div>

            {/* Cashier Staff Action / Simulation Controls */}
            <div className="pt-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="text-label-caption font-label-caption text-outline">
                POS端末照会番号: 202505-LF09-TK001 / レーン自動照合可
              </div>
              <button
                type="button"
                disabled={!isAvailable}
                onClick={handleStaffComplete}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-highest text-on-surface font-body-md text-body-md font-medium transition-all shadow-sm ${
                  isAvailable
                    ? 'hover:bg-surface-variant active:scale-95 cursor-pointer'
                    : 'opacity-60 pointer-events-none'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isAvailable ? 'text-secondary' : 'text-primary'
                  }`}
                >
                  {isAvailable ? 'verified_user' : 'check'}
                </span>
                <span>
                  {isAvailable
                    ? '【店舗スタッフ用】スキャン・確認完了 (使用済みにする)'
                    : '会計適用完了済み'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Related In-Store Recipe Inspiration Quick-Card */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex-shrink-0 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[32px]">soup_kitchen</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-label-badge font-label-badge text-primary">
                この{coupon.items.length}点で作れるレスキューAIレシピ
              </span>
              <p className="font-headline-md text-headline-md text-on-surface">
                「玉ねぎシャキ甘！極上つゆだく牛丼」の手順を見る
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                調理目安 12分 / ロス削減CO₂推定: {coupon.co2ReductionKg || 1.4}kg削減貢献
              </p>
            </div>
          </div>
          <Link
            to={coupon.recipeId ? `/recipe-set/${coupon.recipeId}` : '/ai-recipes'}
            className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-medium transition-colors whitespace-nowrap shadow-sm"
          >
            <span>レシピを見る</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
