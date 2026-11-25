import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import type { CustomerCoupon } from '../../types';
import { BarcodeSvg } from '../../components/BarcodeSvg';

type CouponTab = 'ACQUIRED' | 'USED' | 'EXPIRED';

export const C07MyCouponsPage: React.FC = () => {
  const { coupons, selectedStore, setStoreModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState<CouponTab>('ACQUIRED');
  const [modalCoupon, setModalCoupon] = useState<CustomerCoupon | null>(null);

  const counts = useMemo(
    () => ({
      ACQUIRED: coupons.filter((c) => c.status === 'ACQUIRED').length,
      USED: coupons.filter((c) => c.status === 'USED').length,
      EXPIRED: coupons.filter((c) => c.status === 'EXPIRED').length,
    }),
    [coupons]
  );

  const visibleCoupons = useMemo(
    () => coupons.filter((c) => c.status === activeTab),
    [coupons, activeTab]
  );

  const totalActiveSavings = useMemo(
    () =>
      coupons
        .filter((c) => c.status === 'ACQUIRED')
        .reduce((acc, c) => acc + c.discountAmountYen, 0),
    [coupons]
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-margin-mobile lg:px-margin py-space-lg flex flex-col gap-space-lg">
      {/* Header & Store Capsule */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <span className="font-label-badge text-label-badge text-primary uppercase">
            MY COUPONS ・ 店頭レジ提示専用
          </span>
          <h1 className="font-headline-xl-mobile lg:font-headline-lg text-headline-xl-mobile lg:text-headline-lg text-on-surface mt-0.5">
            マイクーポン
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            取得済みのセット割クーポンを店頭レジでバーコード提示してご利用いただけます。
          </p>
        </div>

        <button
          type="button"
          onClick={() => setStoreModalOpen(true)}
          className="inline-flex items-center gap-2 px-space-md py-2 rounded-full bg-surface-container-lowest shadow-xs hover:bg-surface-container transition-colors self-start md:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
          <span className="font-body-sm font-bold text-on-surface">{selectedStore.name}</span>
          <span className="font-label-caption text-primary font-bold">変更</span>
        </button>
      </div>

      {/* In-store Reminder Callout + Potential Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        <div className="lg:col-span-8 bg-secondary-fixed/40 rounded-2xl p-space-md flex items-start gap-space-sm">
          <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
            info
          </span>
          <div>
            <span className="font-body-md font-bold text-on-secondary-fixed block">
              お会計前にバーコード画面をご提示ください
            </span>
            <p className="font-body-sm text-on-secondary-container mt-0.5">
              店舗を切り替えても他店舗の取得済みクーポンは消えません。各クーポンに記載された「対象店舗」の店頭レジで、対象商品をカゴに入れてご提示ください。
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 bg-primary text-on-primary rounded-2xl p-space-md shadow-sm flex items-center justify-between">
          <div>
            <span className="font-label-caption text-primary-fixed block">
              利用可能クーポンの合計割引額
            </span>
            <div className="font-headline-xl font-label-numeric-lg">
              ¥{totalActiveSavings.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-on-primary/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">confirmation_number</span>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-surface-container-lowest p-1.5 rounded-2xl shadow-xs inline-flex flex-wrap gap-1 w-full sm:w-fit">
        {(
          [
            { key: 'ACQUIRED', label: '利用可能', count: counts.ACQUIRED },
            { key: 'USED', label: '使用済み', count: counts.USED },
            { key: 'EXPIRED', label: '期限切れ', count: counts.EXPIRED },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-space-md py-2 rounded-xl font-body-sm font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-label-numeric-md ${
                  active ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-on-surface'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Coupon List */}
      {visibleCoupons.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-space-xl text-center flex flex-col items-center gap-space-sm shadow-xs">
          <span className="material-symbols-outlined text-[42px] text-outline">
            confirmation_number
          </span>
          <p className="font-headline-md text-on-surface">該当するクーポンはありません</p>
          <Link
            to="/ai-recipes"
            className="mt-2 px-space-lg py-2.5 rounded-xl bg-primary text-on-primary font-body-sm font-bold"
          >
            AIレシピからクーポンを探す
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          {visibleCoupons.map((cp) => {
            const isActive = cp.status === 'ACQUIRED';
            const isOtherStore = cp.storeId !== selectedStore.id;
            return (
              <article
                key={cp.id}
                className={`bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border transition-all ${
                  isActive
                    ? 'border-primary/20 hover:shadow-md'
                    : 'border-outline-variant/20 opacity-80'
                }`}
              >
                <div className="p-space-md lg:p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                  <div className="flex items-start gap-space-md min-w-0">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container shrink-0 relative">
                      <img
                        src={cp.imageUrl}
                        alt={cp.title}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-1.5 left-1.5 font-label-caption px-2 py-0.5 rounded font-bold ${
                          cp.status === 'ACQUIRED'
                            ? 'bg-primary text-on-primary'
                            : cp.status === 'USED'
                              ? 'bg-on-surface/80 text-surface'
                              : 'bg-error text-on-error'
                        }`}
                      >
                        {cp.status === 'ACQUIRED'
                          ? '利用可能'
                          : cp.status === 'USED'
                            ? '使用済'
                            : '期限切れ'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-surface-container-low text-on-surface font-label-badge px-2.5 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-[14px] text-primary">
                            storefront
                          </span>
                          {cp.storeName}
                        </span>
                        {isOtherStore && isActive && (
                          <span className="bg-secondary-fixed text-on-secondary-fixed font-label-caption px-2 py-0.5 rounded-full font-bold">
                            別店舗のクーポン
                          </span>
                        )}
                        <span className="font-label-caption text-outline font-label-numeric-md">
                          {cp.token}
                        </span>
                      </div>

                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        {cp.title}
                      </h2>
                      <p className="font-body-sm text-on-surface-variant">{cp.subtitle}</p>
                      <div className="flex items-center gap-3 font-label-caption text-on-surface-variant mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 font-bold text-secondary">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {cp.validUntilLabel}
                        </span>
                        <span>必須点数: {cp.minItemsRequired}点同時購入</span>
                        {cp.txNumber && <span>伝票番号: {cp.txNumber}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right Discount Value & CTA */}
                  <div className="flex sm:flex-row lg:flex-col items-center lg:items-end justify-between gap-space-sm shrink-0 border-t lg:border-t-0 pt-space-sm lg:pt-0 border-surface-container">
                    <div className="text-left lg:text-right">
                      <span className="font-label-caption text-secondary font-bold block">
                        レジにて即時値引き
                      </span>
                      <span className="font-headline-xl text-secondary font-label-numeric-lg">
                        ¥{cp.discountAmountYen}
                        <span className="text-body-sm font-bold ml-0.5">引</span>
                      </span>
                    </div>

                    {isActive ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setModalCoupon(cp)}
                          className="px-space-sm py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-bold transition-colors cursor-pointer"
                        >
                          クイック表示
                        </button>
                        <Link
                          to={`/my-coupons/${cp.id}`}
                          className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-sm font-bold shadow-sm transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                          <span>レジで提示する</span>
                        </Link>
                      </div>
                    ) : (
                      <Link
                        to={`/my-coupons/${cp.id}`}
                        className="px-space-md py-2 rounded-xl bg-surface-container text-on-surface-variant font-body-sm font-bold"
                      >
                        詳細を見る
                      </Link>
                    )}
                  </div>
                </div>

                {/* Included Items Mini Strip */}
                {cp.items.length > 0 && (
                  <div className="bg-surface-container-low/70 px-space-md lg:px-space-lg py-space-sm border-t border-surface-container flex flex-wrap items-center gap-2">
                    <span className="font-label-caption text-on-surface-variant font-bold">
                      対象商品:
                    </span>
                    {cp.items.map((it, i) => (
                      <span
                        key={i}
                        className="font-label-caption bg-surface-container-lowest text-on-surface px-2.5 py-1 rounded-lg shadow-2xs"
                      >
                        {i + 1}. {it.name}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Quick Barcode Modal */}
      {modalCoupon && (
        <div
          className="fixed inset-0 z-50 bg-on-background/60 backdrop-blur-sm flex items-center justify-center p-space-md"
          onClick={() => setModalCoupon(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-space-lg shadow-2xl flex flex-col items-center gap-space-md text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between">
              <span className="font-label-badge bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                {modalCoupon.storeName}
              </span>
              <button
                type="button"
                onClick={() => setModalCoupon(null)}
                className="p-1 rounded-full hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <h3 className="font-headline-md text-on-surface">{modalCoupon.title}</h3>
            <div className="w-full bg-surface-container-low rounded-xl p-space-md flex flex-col items-center gap-2">
              <span className="font-headline-lg text-secondary font-label-numeric-lg">
                ¥{modalCoupon.discountAmountYen} 引き
              </span>
              <BarcodeSvg code={modalCoupon.token} height={82} />
              <span className="font-label-numeric-md tracking-widest text-on-surface">
                {modalCoupon.token}
              </span>
            </div>
            <Link
              to={`/my-coupons/${modalCoupon.id}`}
              onClick={() => setModalCoupon(null)}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-body-md font-bold"
            >
              全画面レジ提示モードを開く
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
