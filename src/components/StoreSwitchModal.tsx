import React from 'react';
import { useApp } from '../context/AppContext';
import { prioritizeStoresByAddress } from '../utils/foodRescueLogic';

interface StoreSwitchModalProps {
  open: boolean;
  onClose: () => void;
}

export const StoreSwitchModal: React.FC<StoreSwitchModalProps> = ({ open, onClose }) => {
  const { stores, selectedStoreId, selectStore, user } = useApp();

  if (!open) return null;

  const orderedStores = prioritizeStoresByAddress(stores, user.prioritizeNearbyByAddress);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/50 backdrop-blur-sm p-space-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="利用店舗の切り替え"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-space-lg shadow-2xl flex flex-col gap-space-md animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">storefront</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                ご利用店舗を選択
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                選択した店舗のリアルタイム見切り品・AIレシピ・クーポンを表示します
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="閉じる"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="bg-surface-container-low rounded-xl px-space-md py-space-sm flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs text-body-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">home_pin</span>
            <span>
              基準エリア: <strong className="text-on-surface">{user.address.prefecture}{user.address.city}{user.address.street}</strong>
            </span>
          </div>
          {user.prioritizeNearbyByAddress && (
            <span className="font-label-badge text-label-badge bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full shrink-0">
              距離順
            </span>
          )}
        </div>

        <div className="flex flex-col gap-space-sm">
          {orderedStores.map((store) => {
            const isSelected = store.id === selectedStoreId;
            return (
              <button
                key={store.id}
                type="button"
                onClick={() => {
                  selectStore(store.id, true);
                  onClose();
                }}
                className={`w-full text-left p-space-md rounded-xl transition-all cursor-pointer flex items-center justify-between gap-space-md ${
                  isSelected
                    ? 'bg-primary/10 ring-2 ring-primary'
                    : 'bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="font-body-lg text-body-lg font-bold text-on-surface">
                      {store.name}
                    </span>
                    <span className="font-label-badge text-label-badge bg-primary text-on-primary px-1.5 py-0.5 rounded">
                      {store.badge}
                    </span>
                    {store.highlightTag && (
                      <span className="font-label-caption text-label-caption bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full font-bold">
                        {store.highlightTag}
                      </span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {store.address} ・ 営業 {store.hours}
                  </p>
                  <div className="flex items-center gap-space-md font-label-caption text-label-caption text-on-surface-variant mt-0.5">
                    <span className="flex items-center gap-1 text-primary font-bold">
                      <span className="material-symbols-outlined text-[14px]">directions_walk</span>
                      {store.distanceKm}km (徒歩{store.walkMinutes}分)
                    </span>
                    <span>見切り品 {store.rescueCount}点</span>
                    <span>クーポン {store.couponCount}件</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 bg-primary text-on-primary px-space-sm py-1 rounded-full font-label-badge text-label-badge">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      選択中
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-surface-container-lowest text-primary px-space-sm py-1 rounded-full font-label-badge text-label-badge shadow-xs">
                      切替
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="font-label-caption text-label-caption text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-secondary">info</span>
          取得済みの他店舗クーポンは店舗を切り替えても「マイクーポン」に保持されます。
        </p>
      </div>
    </div>
  );
};
