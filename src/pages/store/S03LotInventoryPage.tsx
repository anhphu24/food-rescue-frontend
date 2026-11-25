import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { IMAGES } from '../../data/seedData';
import type { LotStatus, StoreLot } from '../../types';
import { calculateLotDiscountedPrice } from '../../utils/foodRescueLogic';

type LotFilter = 'all' | 'today' | 'tomorrow' | 'discounted' | 'low_stock';

export const S03LotInventoryPage: React.FC = () => {
  const {
    selectedStore,
    activeStoreLots,
    productMasters,
    addOrUpdateStoreLot,
    updateLotStatus,
    bulkApply50PercentUrgent,
  } = useApp();
  const [searchParams] = useSearchParams();
  const initialJan = searchParams.get('jan') || '';

  const matchedMaster = useMemo(
    () =>
      (initialJan && productMasters.find((m) => m.janCode === initialJan)) || productMasters[0],
    [initialJan, productMasters]
  );

  // Filter & Search State
  const [filter, setFilter] = useState<LotFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('売り場: 全ゾーン');

  // Right Workbench Form State
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [masterQuery, setMasterQuery] = useState(
    `${matchedMaster.name} ${matchedMaster.spec}`.trim()
  );
  const [selectedMasterId, setSelectedMasterId] = useState(matchedMaster.id);
  const [stockQty, setStockQty] = useState(4);
  const [expiryDate, setExpiryDate] = useState('2025-05-10');
  const [expiryTime, setExpiryTime] = useState('21:00');
  const [basePrice, setBasePrice] = useState(matchedMaster.standardPriceInclTax || 780);
  const [discountMode, setDiscountMode] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState(30);
  const [shelfLocation, setShelfLocation] = useState('1F 精肉コーナー奥 冷ケース 見切り品ワゴン');
  const [lotStatus, setLotStatus] = useState<LotStatus>('active');
  const [aiEnabled, setAiEnabled] = useState(true);

  // Simulation UI States (Exact Stitch S03 controls)
  const [simError, setSimError] = useState(false);
  const [simPreview, setSimPreview] = useState(false);
  const [simToast, setSimToast] = useState<string | null>(null);

  const selectedMaster = useMemo(
    () => productMasters.find((m) => m.id === selectedMasterId) || productMasters[0],
    [productMasters, selectedMasterId]
  );

  const pricePreview = useMemo(
    () => calculateLotDiscountedPrice(basePrice, discountMode, discountValue),
    [basePrice, discountMode, discountValue]
  );

  const filteredLots = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activeStoreLots.filter((lot) => {
      if (filter === 'today' && !lot.isUrgentToday) return false;
      if (filter === 'tomorrow' && lot.isUrgentToday) return false;
      if (filter === 'discounted' && lot.discountPercent <= 0) return false;
      if (filter === 'low_stock' && lot.stockQty > 3) return false;
      if (zoneFilter !== '売り場: 全ゾーン' && !lot.shelfLocation.includes(zoneFilter.slice(3, 5))) {
        return false;
      }
      if (q) {
        return `${lot.lotCode} ${lot.productName} ${lot.janCode} ${lot.shelfLocation}`
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
  }, [activeStoreLots, filter, searchQuery, zoneFilter]);

  const handleEditLot = (lot: StoreLot) => {
    setEditingLotId(lot.id);
    setMasterQuery(lot.productName);
    setSelectedMasterId(lot.productId);
    setStockQty(lot.stockQty);
    setExpiryDate(lot.expiryDate);
    setExpiryTime(lot.expiryTime);
    setBasePrice(lot.originalPrice);
    setDiscountMode('percent');
    setDiscountValue(lot.discountPercent);
    setShelfLocation(lot.shelfLocation);
    setLotStatus(lot.status);
    setAiEnabled(lot.aiEnabled);
    setSimError(false);
  };

  const handleResetForm = () => {
    setEditingLotId(null);
    setStockQty(4);
    setDiscountMode('percent');
    setDiscountValue(30);
    setLotStatus('active');
    setSimError(false);
  };

  const handleSubmitLot = () => {
    if (stockQty <= 0) {
      setSimError(true);
      return;
    }
    setSimError(false);
    const nextLot: StoreLot = {
      id: editingLotId || `lot-${Date.now()}`,
      lotCode: editingLotId
        ? activeStoreLots.find((l) => l.id === editingLotId)?.lotCode || 'LOT-20250510-NEW'
        : `LOT-20250510-${String(activeStoreLots.length + 1).padStart(2, '0')}`,
      storeId: selectedStore.id,
      productId: selectedMaster.id,
      productName: `${selectedMaster.name} ${selectedMaster.spec}`.trim(),
      janCode: selectedMaster.janCode,
      category: selectedMaster.category,
      imageUrl: selectedMaster.imageUrl || IMAGES.beefTray,
      shelfLocation,
      shelfShort: shelfLocation.slice(0, 14),
      registeredAt: 'たった今 登録',
      expiryDate,
      expiryTime,
      expiryLabel: `本日 ${expiryTime}`,
      remainingTimeLabel: '残り 2時間',
      isUrgentToday: true,
      originalPrice: basePrice,
      discountPercent: pricePreview.effectivePercent,
      discountedPrice: pricePreview.discountedPrice,
      stockQty,
      stockUnit: 'パック',
      stockBadge: stockQty <= 3 ? '品薄' : '適正陳列',
      campaignTag: aiEnabled ? 'AIセット割連動中' : '店頭見切り品',
      aiRecipeTag: aiEnabled ? 'AIレシピ提案: 有効' : 'AIレシピ提案: OFF',
      aiEnabled,
      status: lotStatus,
      co2ReductionKg: 1.0,
    };
    addOrUpdateStoreLot(nextLot);
    setSimToast('ロット情報を保存し、店頭・アプリへ即時反映しました');
    setTimeout(() => setSimToast(null), 3200);
  };

  const handleBulk50 = () => {
    const count = bulkApply50PercentUrgent();
    setSimToast(`本日消費期限ロット ${count}件 を一括50%引へ更新しました`);
    setTimeout(() => setSimToast(null), 3200);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Command & Action Bar (Exact Stitch S03) */}
      <div className="px-space-md lg:px-space-lg py-space-md bg-surface-container-lowest shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                ロット・店頭在庫管理
              </h1>
              <span className="font-label-badge text-label-badge bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                現物在庫リアルタイム同期中
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              商品マスターに紐づく賞味・消費期限、店頭見切りシール割引率、棚卸在庫数をロット単位で即時反映できます。
            </p>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSimToast('見切りシール印刷キュー (6件) を店舗プリンタへ送信しました');
                setTimeout(() => setSimToast(null), 2600);
              }}
              className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-2.5 rounded-xl font-body-sm font-bold transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>見切りシール一括印刷 (6件)</span>
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-md py-2.5 rounded-xl font-body-sm font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>+ 新規ロット登録（見切り品）</span>
            </button>
          </div>
        </div>

        {/* Filter Strip & Quick Counter Matrix */}
        <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low/60 p-space-sm rounded-xl">
          <div className="flex flex-wrap items-center gap-space-xs">
            {(
              [
                { key: 'all', label: 'すべて表示', count: activeStoreLots.length },
                {
                  key: 'today',
                  label: '本日中消費期限',
                  count: activeStoreLots.filter((l) => l.isUrgentToday).length,
                  dot: 'bg-secondary',
                },
                {
                  key: 'tomorrow',
                  label: '明日以降',
                  count: activeStoreLots.filter((l) => !l.isUrgentToday).length,
                },
                {
                  key: 'discounted',
                  label: '見切り割引中',
                  count: activeStoreLots.filter((l) => l.discountPercent > 0).length,
                },
                {
                  key: 'low_stock',
                  label: '残り僅か (3個以下)',
                  count: activeStoreLots.filter((l) => l.stockQty <= 3).length,
                },
              ] as const
            ).map((btn) => {
              const active = filter === btn.key;
              return (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => setFilter(btn.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body-sm font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container font-medium'
                  }`}
                >
                  {'dot' in btn && btn.dot && <span className={`w-2 h-2 rounded-full ${btn.dot}`} />}
                  <span>{btn.label}</span>
                  <span
                    className={`text-[11px] px-1.5 rounded-full font-label-numeric-md ${
                      active
                        ? 'bg-on-primary/20 text-on-primary'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {btn.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-space-xs flex-1 max-w-md min-w-[240px]">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ロット番号、JAN、商品名、売り場コード..."
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-sm pl-9 pr-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
              />
            </div>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="bg-surface-container-lowest text-on-surface font-body-sm px-3 py-2 rounded-lg outline-none cursor-pointer hover:bg-surface-container transition-colors"
            >
              <option>売り場: 全ゾーン</option>
              <option>1F 精肉コーナー</option>
              <option>1F 鮮魚コーナー</option>
              <option>1F 惣菜・弁当コーナー</option>
              <option>1F 青果・デイリー</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workspace Grid: Left Lots Table (8 cols) & Right Workbench (4 cols) */}
      <div className="px-space-md lg:px-space-lg py-space-md grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">
        <div className="xl:col-span-8 flex flex-col gap-space-md">
          {/* Real-time Shelf Warning Banner */}
          <div className="bg-gradient-to-r from-secondary/15 via-secondary/5 to-transparent p-space-md rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-headline-md text-on-surface">
                    夜間タイムセール準備 (20:00~21:00 消費期限)
                  </span>
                  <span className="bg-secondary text-on-secondary font-label-badge px-2 py-0.5 rounded-full">
                    優先処理 4品
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  本日21:00前後に期限を迎える精肉・惣菜ロットです。見切りシール貼付または割引率を50%へ切り替えることで売り切りが期待できます。
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleBulk50}
              className="shrink-0 bg-secondary hover:bg-on-secondary-fixed-variant text-on-secondary px-space-md py-2 rounded-lg font-body-sm font-bold transition-colors cursor-pointer"
            >
              対象ロットを一括50%引
            </button>
          </div>

          {/* High Precision Lot Table */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="px-space-md py-3 bg-surface-container-low flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-on-surface">ロット一覧</span>
                <span className="font-body-sm text-outline">（登録順: 最新ロット優先）</span>
              </div>
              <div className="flex items-center gap-space-sm text-body-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> 本日21時前
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary" /> 通常見切り
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline" /> 正常在庫
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-badge uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">ロットID / 登録時刻</th>
                    <th className="py-3 px-4 font-bold">対象商品（マスター連携）</th>
                    <th className="py-3 px-4 font-bold">売り場ロケーション</th>
                    <th className="py-3 px-4 font-bold">期限ステータス</th>
                    <th className="py-3 px-4 font-bold">店頭価格 / 割引</th>
                    <th className="py-3 px-4 font-bold text-center">店頭在庫数</th>
                    <th className="py-3 px-4 font-bold">施策連携</th>
                    <th className="py-3 px-4 font-bold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="text-on-surface divide-y divide-surface-container/60">
                  {filteredLots.map((lot, idx) => (
                    <tr
                      key={lot.id}
                      className={`${
                        idx === 0 && lot.isUrgentToday
                          ? 'bg-secondary-fixed/20 hover:bg-secondary-fixed/30'
                          : 'hover:bg-surface-container-low'
                      } transition-colors ${lot.status === 'sold_out' ? 'opacity-50' : ''}`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-label-numeric-md font-bold text-on-surface">
                            {lot.lotCode}
                          </span>
                          <span className="text-on-surface-variant text-[11px] font-label-caption">
                            {lot.registeredAt}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={lot.imageUrl}
                            alt={lot.productName}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 shadow-sm"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-on-surface truncate">
                              {lot.productName}
                            </span>
                            <span className="text-outline text-[11px] font-label-caption">
                              JAN: {lot.janCode}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            pin_drop
                          </span>
                          <span
                            className="font-medium text-on-surface truncate max-w-[130px]"
                            title={lot.shelfLocation}
                          >
                            {lot.shelfShort}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full font-label-badge font-bold inline-flex items-center gap-0.5 w-fit ${
                              lot.isUrgentToday
                                ? 'bg-secondary text-on-secondary'
                                : 'bg-surface-container-high text-on-surface'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {lot.isUrgentToday ? 'alarm' : 'calendar_today'}
                            </span>
                            {lot.expiryLabel}
                          </span>
                          <span
                            className={`text-[11px] ${
                              lot.isUrgentToday ? 'text-secondary font-bold' : 'text-outline'
                            }`}
                          >
                            {lot.remainingTimeLabel}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-outline line-through text-[12px]">
                              ¥{lot.originalPrice.toLocaleString()}
                            </span>
                            <span className="font-label-numeric-md text-secondary font-bold">
                              ¥{lot.discountedPrice.toLocaleString()}
                            </span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold w-fit mt-0.5 ${
                              lot.discountPercent >= 50
                                ? 'text-on-secondary bg-secondary'
                                : 'text-on-secondary-container bg-secondary-fixed'
                            }`}
                          >
                            {lot.discountPercent >= 50
                              ? '50% 半額'
                              : `${lot.discountPercent}% OFF`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-label-numeric-lg font-bold text-on-surface">
                            {lot.stockQty}
                            <span className="text-body-sm font-normal text-on-surface-variant ml-0.5">
                              {lot.stockUnit}
                            </span>
                          </span>
                          <span className="bg-surface-container text-on-surface-variant px-2 rounded-full text-[10px] font-bold">
                            {lot.status === 'sold_out' ? '完売' : lot.stockBadge}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-tertiary-container text-on-tertiary-container font-label-caption font-bold w-fit">
                            <span className="material-symbols-outlined text-[12px]">eco</span>
                            {lot.campaignTag}
                          </span>
                          <span className="text-outline text-[10px]">{lot.aiRecipeTag}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditLot(lot)}
                            className="p-1.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container text-primary transition-colors cursor-pointer"
                            title="ロット編集"
                          >
                            <span className="material-symbols-outlined text-[18px]">tune</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateLotStatus(lot.id, 'sold_out')}
                            className="p-1.5 rounded-lg hover:bg-error-container text-outline hover:text-error transition-colors cursor-pointer"
                            title="売り切り・販売終了"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-space-md py-3 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm font-body-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>物理POSスキャナー連携：正常稼働 (レジ通過数 124点 / 本日)</span>
              </div>
              <span className="text-[12px] font-label-caption text-outline">
                全 {filteredLots.length} ロットを表示中
              </span>
            </div>
          </div>

          {/* In-Store Visual Shelf Layout Guide */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">map</span>
              </div>
              <div>
                <div className="font-headline-md text-on-surface">
                  売り場ロケーション別 見切り在庫分布
                </div>
                <p className="font-body-sm text-on-surface-variant mt-0.5">
                  各冷ケース・見切り品ワゴンのシール貼付状況とアプリ来訪者の回遊ホットスポット。
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-label-numeric-md font-bold text-on-surface">24 / 28 ロット</div>
              <div className="font-label-caption text-outline">見切りシール貼付完了率 85%</div>
            </div>
          </div>
        </div>

        {/* Right Auxiliary: Real-time Lot Editor & Creator Workbench (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-secondary" />
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">edit_note</span>
                <div>
                  <h2 className="font-headline-md text-on-surface">
                    {editingLotId ? 'ロット編集・見切り調整' : '新規ロット登録・見切り設定'}
                  </h2>
                  <span className="font-label-caption text-outline">
                    店舗現物在庫のみ（予約・取置なし）
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-primary/10 text-primary font-label-badge px-2 py-0.5 rounded-full font-bold">
                  {editingLotId ? '編集中' : '新規登録'}
                </span>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="p-1 text-outline hover:text-on-surface rounded-lg cursor-pointer"
                  title="リセット"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-space-md mt-3">
              {/* Target Store Indicator */}
              <div className="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    storefront
                  </span>
                  <span className="font-body-sm font-bold text-on-surface">
                    対象店舗: {selectedStore.name}
                  </span>
                </div>
                <span className="font-label-caption bg-surface-container-lowest px-2 py-0.5 rounded text-on-surface-variant font-medium">
                  直営店舗固定
                </span>
              </div>

              {/* Master Product Selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-badge text-on-surface-variant font-bold">
                    対象商品マスター選択
                  </label>
                  <span className="font-label-caption text-primary font-bold">JAN連携</span>
                </div>
                <select
                  value={selectedMasterId}
                  onChange={(e) => {
                    const m = productMasters.find((x) => x.id === e.target.value);
                    if (m) {
                      setSelectedMasterId(m.id);
                      setMasterQuery(m.name);
                      setBasePrice(m.standardPriceInclTax);
                    }
                  }}
                  className="w-full bg-surface-container-low text-on-surface text-body-sm px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {productMasters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.spec} ({m.janCode})
                    </option>
                  ))}
                </select>

                {/* Fallback Link to S02-B */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-container-low border border-dashed border-outline-variant text-[11px] font-label-caption">
                  <span className="text-on-surface-variant">登録のない新規商品ですか？</span>
                  <Link
                    to="/store/products/new"
                    className="text-primary hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">add_circle</span>
                    S02-B 商品新規登録へ進む
                  </Link>
                </div>
              </div>

              {/* Physical In-Store Stock Counter */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-badge text-on-surface-variant font-bold">
                    店頭現品 在庫数量 (現物のみ)
                  </label>
                  <span className="font-label-caption text-error font-bold">※取置・予約枠なし</span>
                </div>
                <div className="flex items-center justify-between bg-surface-container-low p-2 rounded-xl">
                  <div className="flex items-center gap-2 pl-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      shelves
                    </span>
                    <span className="font-body-sm text-on-surface font-bold">現品パック数:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStockQty((q) => Math.max(0, q - 1))}
                      className="w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center font-bold text-[18px] shadow-sm cursor-pointer"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={stockQty}
                      onChange={(e) => setStockQty(Math.max(0, Number(e.target.value)))}
                      className="w-14 text-center bg-transparent font-label-numeric-lg text-headline-md text-on-surface font-bold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setStockQty((q) => q + 1)}
                      className="w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container flex items-center justify-center font-bold text-[18px] shadow-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Expiry Date & Time */}
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-badge text-on-surface-variant font-bold">
                    消費・賞味期限 日付
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-body-sm px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-badge text-on-surface-variant font-bold">
                    期限 時刻 (24H)
                  </label>
                  <input
                    type="time"
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface text-body-sm px-3 py-2 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Base Price & Discount Calculator */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-badge text-on-surface-variant font-bold">
                  見切り価格・割引率設定（通常 ¥{basePrice}）
                </label>
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountMode('percent');
                      setDiscountValue(30);
                    }}
                    className={`py-1.5 rounded-lg text-body-sm transition-all cursor-pointer ${
                      discountMode === 'percent'
                        ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    割引率指定 (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountMode('fixed');
                      setDiscountValue(200);
                    }}
                    className={`py-1.5 rounded-lg text-body-sm transition-all cursor-pointer ${
                      discountMode === 'fixed'
                        ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    固定値引き額 (¥)
                  </button>
                </div>

                {discountMode === 'percent' ? (
                  <div className="grid grid-cols-4 gap-1.5">
                    {[10, 20, 30, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountValue(pct)}
                        className={`py-1.5 rounded-lg font-bold text-[12px] transition-colors cursor-pointer ${
                          discountValue === pct
                            ? 'bg-secondary text-on-secondary shadow-sm'
                            : 'bg-surface-container text-on-surface hover:bg-secondary-fixed'
                        }`}
                      >
                        {pct === 50 ? '半額(50%)' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-lg font-label-numeric-md text-on-surface"
                  />
                )}

                <div className="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between border border-surface-container-high">
                  <div>
                    <span className="text-on-surface-variant text-[11px] font-label-caption block">
                      改定後 店頭見切り販売価格
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-headline-lg text-secondary font-label-numeric-lg">
                        ¥{pricePreview.discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-outline text-body-sm line-through">
                        ¥{basePrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-md font-bold text-[12px] font-label-numeric-md">
                    -¥{pricePreview.savingsYen} ({pricePreview.effectivePercent}%引)
                  </span>
                </div>
              </div>

              {/* Shelf Location */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-badge text-on-surface-variant font-bold">
                  売場位置・陳列什器
                </label>
                <input
                  type="text"
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-body-sm px-3 py-2 rounded-lg outline-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: '冷ケース', val: '1F 精肉 奥ケース' },
                    { label: '特設ワゴン', val: '1F 精肉 特設見切りワゴン' },
                    { label: 'エンド棚', val: '1F 精肉 エンド陳列棚' },
                    { label: '平台ワゴン', val: '1F 平台ワゴン' },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setShelfLocation(chip.val)}
                      className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface text-[11px] font-label-caption cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sales Status Switch */}
              <div className="grid grid-cols-3 gap-1.5 bg-surface-container-low p-1 rounded-xl">
                {(
                  [
                    { key: 'active', label: '販売中', dot: 'bg-primary' },
                    { key: 'paused', label: '一時停止', dot: 'bg-outline' },
                    { key: 'sold_out', label: '完売', dot: 'bg-error' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setLotStatus(st.key)}
                    className={`py-1.5 rounded-lg text-[12px] flex items-center justify-center gap-1 cursor-pointer ${
                      lotStatus === st.key
                        ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                        : 'text-on-surface-variant font-medium'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                    {st.label}
                  </button>
                ))}
              </div>

              {/* AI Recipe Toggle */}
              <div className="flex items-center justify-between bg-primary/5 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    psychology
                  </span>
                  <span className="font-body-sm font-bold text-on-surface">
                    AIレシピ・献立連動
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Simulation UI Controls */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label-caption font-bold text-on-surface-variant">
                    状態シミュレーションUI
                  </span>
                  <span className="text-[10px] text-outline">動作検証</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSimError((v) => !v)}
                    className="flex-1 py-1 px-1.5 rounded bg-surface-container hover:bg-error-container text-on-surface-variant font-label-caption text-[11px] cursor-pointer"
                  >
                    入力エラー
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimPreview((v) => !v)}
                    className="flex-1 py-1 px-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-caption text-[11px] cursor-pointer"
                  >
                    確認プレビュー
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimToast('ロット情報を保存し、店頭・アプリへ即時反映しました');
                      setTimeout(() => setSimToast(null), 2600);
                    }}
                    className="flex-1 py-1 px-1.5 rounded bg-surface-container hover:bg-primary/20 text-on-surface-variant font-label-caption text-[11px] cursor-pointer"
                  >
                    保存完了
                  </button>
                </div>

                {simError && (
                  <div className="bg-error-container text-on-error-container p-2 rounded-lg text-[11px] font-label-caption flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-error shrink-0">
                      error
                    </span>
                    <div>
                      <strong className="block font-bold">入力内容をご確認ください</strong>
                      <span>消費期限が過去時刻または在庫数量が0個に設定されています。</span>
                    </div>
                  </div>
                )}

                {simPreview && (
                  <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-primary/30 text-[11px] font-label-caption flex flex-col gap-1">
                    <span className="font-bold text-primary">登録内容プレビュー</span>
                    <div className="grid grid-cols-2 gap-1 text-on-surface">
                      <span>品名: {masterQuery}</span>
                      <span>数量: {stockQty}パック</span>
                      <span>販売価格: ¥{pricePreview.discountedPrice}</span>
                      <span>期限: 本日 {expiryTime}</span>
                    </div>
                  </div>
                )}

                {simToast && (
                  <div className="bg-tertiary text-on-tertiary p-2 rounded-lg text-[11px] font-label-caption flex items-center justify-between shadow-md">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      {simToast}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSubmitLot}
                  className="w-full bg-primary hover:bg-primary-container text-on-primary py-3 rounded-xl font-body-sm font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  <span>ロット情報を店頭へ即時反映</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">
              lightbulb
            </span>
            <div>
              <span className="font-bold text-on-surface text-body-sm block">
                現場オペレーションのポイント
              </span>
              <p className="font-label-caption text-on-surface-variant mt-1 leading-relaxed">
                見切りシールを貼付した直後に本画面で在庫数を更新すると、半径2km圏内のアプリ利用者に即座に通知されます。実店舗での過剰な滞留を防ぐため、売り切れた際は「完売」へ速やかに切り替えてください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
