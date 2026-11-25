import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IMAGES } from '../../data/seedData';
import type { StoreCouponCampaign } from '../../types';

type CampaignTab = 'published' | 'draft' | 'ended';

export const S04CouponManagementPage: React.FC = () => {
  const { campaigns, toggleCampaignActive, addCampaign, selectedStore } = useApp();

  const [tab, setTab] = useState<CampaignTab>('published');
  const [search, setSearch] = useState('');

  // Create form state
  const [recipeMode, setRecipeMode] = useState<'ai' | 'custom'>('ai');
  const [preset, setPreset] = useState(
    '【AI推奨】スタミナ豚キムチ炒め（豚こま＋白菜キムチ＋にら）'
  );
  const [title, setTitle] = useState('夕方スタミナ豚キムチ 3品一括セット割');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [dailyLimit, setDailyLimit] = useState(100);
  const [timeSlot, setTimeSlot] = useState('17:00 〜 21:00 (夜)');
  const [saveState, setSaveState] = useState<'idle' | 'syncing' | 'done'>('idle');

  const visibleCampaigns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (tab === 'published' && c.status !== 'published') return false;
      if (tab === 'draft' && c.status !== 'draft') return false;
      if (tab === 'ended' && c.status !== 'ended') return false;
      if (!q) return true;
      return `${c.title} ${c.targetSummary} ${c.code}`.toLowerCase().includes(q);
    });
  }, [campaigns, tab, search]);

  const activeCount = campaigns.filter((c) => c.status === 'published' && c.isActive).length;

  const handlePublish = (asDraft = false) => {
    setSaveState('syncing');
    setTimeout(() => {
      const next: StoreCouponCampaign = {
        id: `camp-${Date.now()}`,
        code: `CP-202505-0${campaigns.length + 1}`,
        storeId: selectedStore.id,
        title: title.trim() || '夕方スタミナ豚キムチ 3品一括セット割',
        badge: '3品セット割',
        tagLabel: recipeMode === 'ai' ? 'AIレシピ' : 'カスタム',
        targetSummary: '対象: 国産豚小間切れ200g ＋ 熟成白菜キムチ300g ＋ 高知県産にら1束',
        discountType,
        discountValue: discountType === 'fixed' ? 100 : 15,
        discountPrefix: 'レジにて一括',
        status: asDraft ? 'draft' : 'published',
        isActive: !asDraft,
        scheduleLabel: `本日 ${timeSlot}`,
        scheduleTag: '夜間タイムセール連動',
        conditionText: '適用条件: 対象3点すべてを店頭レジで同時精算 (1精算1回限り)',
        usedCount: 0,
        dailyLimit: dailyLimit || 100,
        updatedAt: '最終更新: たった今',
        imageUrl: IMAGES.tonjiru,
        accentColor: 'primary',
      };
      addCampaign(next);
      setSaveState('done');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 600);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Stats Strip (Exact Stitch S04) */}
      <div className="px-space-md lg:px-space-lg pt-space-md pb-space-xs grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-body-sm text-on-surface-variant">現在配信中クーポン</span>
            <div className="flex items-baseline gap-space-xs mt-1">
              <span className="font-headline-xl text-primary font-bold">{activeCount + 5}</span>
              <span className="font-body-sm text-on-surface-variant">/ 全12件</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined icon-filled text-[28px]">
              confirmation_number
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-body-sm text-on-surface-variant">本日レジ消込実績</span>
            <div className="flex items-baseline gap-space-xs mt-1">
              <span className="font-headline-xl text-on-surface font-bold">142</span>
              <span className="font-label-badge text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                前日比 +24%
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[28px]">point_of_sale</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-body-sm text-on-surface-variant">見切り品削減貢献額</span>
            <div className="flex items-baseline gap-space-xs mt-1">
              <span className="font-label-numeric-lg text-secondary font-bold">¥41,800</span>
              <span className="font-label-caption text-on-surface-variant">(本日推定)</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[28px]">trending_down</span>
          </div>
        </div>

        <div className="bg-primary p-space-md rounded-xl shadow-sm text-on-primary flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-container/40 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="font-label-badge uppercase tracking-wider text-primary-fixed">
              AI連携ステータス
            </span>
            <span className="material-symbols-outlined text-[20px] text-primary-fixed animate-pulse">
              auto_awesome
            </span>
          </div>
          <div className="relative z-10 mt-2">
            <div className="font-headline-md">レシピ連動 稼働中</div>
            <p className="font-label-caption text-primary-fixed-dim mt-0.5">
              夕方ピーク向け「豚汁・牛丼セット割」適用中
            </p>
          </div>
        </div>
      </div>

      {/* Main Work Area Split */}
      <div className="px-space-md lg:px-space-lg py-space-md flex flex-col lg:flex-row gap-space-lg items-start">
        {/* Left Column: Filter & Coupons List */}
        <div className="w-full lg:w-7/12 xl:w-2/3 flex flex-col gap-space-md">
          {/* Action Bar & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl shadow-sm">
            <div className="flex items-center gap-space-xs overflow-x-auto">
              {(
                [
                  { key: 'published', label: '公開中', count: campaigns.filter((c) => c.status === 'published').length },
                  { key: 'draft', label: '審査・下書き', count: campaigns.filter((c) => c.status === 'draft').length },
                  { key: 'ended', label: '終了・期限切れ', count: 4 },
                ] as const
              ).map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`px-space-md py-space-xs rounded-lg font-body-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                      active
                        ? 'font-bold bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span
                      className={`px-1.5 rounded-full text-label-caption font-bold ${
                        active ? 'bg-white/20' : 'bg-surface-container-high'
                      }`}
                    >
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-space-xs justify-end">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="クーポン名・商品検索..."
                  className="bg-surface-container-low pl-8 pr-3 py-1.5 rounded-lg text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary w-44 sm:w-56"
                />
                <span className="material-symbols-outlined text-[18px] text-outline absolute left-2 pointer-events-none">
                  search
                </span>
              </div>
            </div>
          </div>

          {/* In-Store Policy Alert Box */}
          <div className="bg-surface-container-high p-space-sm rounded-xl flex items-start gap-space-sm text-on-surface">
            <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
              info
            </span>
            <div className="flex flex-col">
              <div className="font-body-sm font-bold text-on-secondary-container">
                店舗レジ精算ルール（運用必読）
              </div>
              <p className="font-body-sm text-on-surface-variant leading-relaxed">
                本システムは
                <span className="font-bold text-on-surface underline decoration-secondary">
                  取り置き・予約機能を持たない店頭専用クーポン
                </span>
                です。お客様が対象指定商品を買い物カゴに入れ、店頭POSレジでバーコード提示した際に一括照合・値引きが行われます。
              </p>
            </div>
          </div>

          {/* Coupon Cards List */}
          <div className="flex flex-col gap-space-sm">
            {visibleCampaigns.map((camp) => {
              const pct = Math.min(100, Math.round((camp.usedCount / camp.dailyLimit) * 100));
              return (
                <div
                  key={camp.id}
                  className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      camp.accentColor === 'secondary' ? 'bg-secondary' : 'bg-primary'
                    }`}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
                    <div className="flex items-start gap-space-md min-w-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container relative">
                        <img
                          src={camp.imageUrl}
                          alt={camp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 left-1 bg-primary text-on-primary font-label-badge px-1 py-0.5 rounded shadow-sm">
                          {camp.tagLabel}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-xs flex-wrap">
                          <span className="bg-secondary-fixed text-on-secondary-fixed font-label-badge px-2 py-0.5 rounded-full font-bold">
                            {camp.badge}
                          </span>
                          <span className="font-label-badge text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                            ID: {camp.code}
                          </span>
                        </div>
                        <h3 className="font-headline-md text-on-surface mt-1 truncate">
                          {camp.title}
                        </h3>
                        <div className="flex items-center gap-space-xs mt-1 text-on-surface-variant font-body-sm">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            lunch_dining
                          </span>
                          <span className="truncate">{camp.targetSummary}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                      <div className="flex items-baseline gap-1 text-secondary font-bold">
                        <span className="font-label-caption">{camp.discountPrefix}</span>
                        <span className="font-headline-lg">
                          {camp.discountType === 'fixed'
                            ? `¥${camp.discountValue}`
                            : `${camp.discountValue}%`}
                        </span>
                        <span className="font-body-sm">
                          {camp.discountType === 'fixed' ? '引' : 'OFF'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={camp.isActive}
                          onChange={() => toggleCampaignActive(camp.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                        <span className="ml-2 font-label-badge text-primary font-bold">
                          {camp.isActive ? '配信中' : '停止中'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-space-sm pt-space-sm bg-surface-container-low/60 p-space-sm rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-space-xs font-body-sm text-on-surface flex-wrap">
                        <span className="material-symbols-outlined text-outline text-[16px]">
                          schedule
                        </span>
                        <span className="font-bold">{camp.scheduleLabel}</span>
                        <span className="font-label-caption bg-secondary/10 text-secondary px-1.5 py-0.5 rounded font-bold">
                          {camp.scheduleTag}
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs font-label-caption text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px] text-tertiary">
                          check_circle
                        </span>
                        <span>{camp.conditionText}</span>
                      </div>
                    </div>

                    <div className="flex flex-col min-w-[190px]">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-label-caption text-on-surface-variant">消化状況</span>
                        <span className="font-body-sm text-on-surface font-bold">
                          {camp.usedCount}{' '}
                          <span className="font-normal text-on-surface-variant">
                            / {camp.dailyLimit} 回
                          </span>{' '}
                          ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct > 70 ? 'bg-secondary-container' : 'bg-primary'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-space-xs flex items-center justify-between">
                    <span className="font-label-caption text-outline">{camp.updatedAt}</span>
                    <div className="flex items-center gap-space-xs">
                      <button
                        type="button"
                        onClick={() => setTitle(`${camp.title} (複製)`)}
                        className="px-space-sm py-1 rounded hover:bg-surface-container font-body-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        <span>複製</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTitle(camp.title)}
                        className="px-space-sm py-1 rounded hover:bg-surface-container font-body-sm text-primary font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>編集</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Create / Edit Coupon Panel (Exact Stitch S04) */}
        <div className="w-full lg:w-5/12 xl:w-1/3 bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md lg:sticky lg:top-20">
          <div className="flex items-center justify-between pb-space-sm bg-surface-container-low -mx-space-lg -mt-space-lg p-space-md rounded-t-2xl">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">add_box</span>
              </div>
              <div>
                <h2 className="font-headline-md text-on-surface">新規クーポン作成</h2>
                <p className="font-label-caption text-on-surface-variant">
                  店頭レジ一括精算ルール設定
                </p>
              </div>
            </div>
            <span className="font-label-badge bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
              ドラフト
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body-sm font-bold text-on-surface flex items-center justify-between">
              <span>1. レシピ連動・対象パターン</span>
              <span className="font-label-badge text-primary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI推薦あり
              </span>
            </label>
            <div className="grid grid-cols-2 gap-space-xs">
              <button
                type="button"
                onClick={() => setRecipeMode('ai')}
                className={`font-body-sm font-bold py-2 px-space-sm rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
                  recipeMode === 'ai'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                <span>AIレシピ連動</span>
              </button>
              <button
                type="button"
                onClick={() => setRecipeMode('custom')}
                className={`font-body-sm font-bold py-2 px-space-sm rounded-lg flex items-center justify-center gap-1 cursor-pointer ${
                  recipeMode === 'custom'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">category</span>
                <span>カスタム商品指定</span>
              </button>
            </div>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="mt-1 w-full bg-surface-container-low px-3 py-2 rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>【AI推奨】スタミナ豚キムチ炒め（豚こま＋白菜キムチ＋にら）</option>
              <option>【AI推奨】春野菜のミネストローネ（トマト缶＋セロリ＋ベーコン）</option>
              <option>【AI推奨】鶏むね肉のヘルシー南蛮（鶏むね＋玉ねぎ＋タルタル）</option>
              <option>カスタムセットを新規手動登録する...</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-body-sm font-bold text-on-surface">2. クーポン表示名</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="font-label-caption text-outline">
              ※ お客様アプリの「本日のレシピセット」タブに表示されます
            </span>
          </div>

          <div className="flex flex-col gap-1.5 bg-surface-container-low p-space-sm rounded-xl">
            <span className="font-body-sm font-bold text-on-surface">
              3. 必須購入条件 (店頭同時スキャン)
            </span>
            <div className="flex flex-col gap-1.5 mt-1">
              {[
                { label: '国産豚小間切れ (200g以上)', tag: '精肉' },
                { label: '熟成白菜キムチ (各社300g)', tag: '日配品' },
                { label: '高知県産 にら (1束)', tag: '青果' },
              ].map((it) => (
                <label
                  key={it.label}
                  className="flex items-center gap-2 text-body-sm text-on-surface cursor-pointer"
                >
                  <input defaultChecked type="checkbox" className="accent-primary rounded h-4 w-4" />
                  <span className="flex-1 truncate">{it.label}</span>
                  <span className="font-label-badge text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                    {it.tag}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-2 pt-2 bg-surface-container-lowest/80 p-2 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-on-secondary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  verified_user
                </span>
                <span className="font-label-caption font-bold">
                  全品スキャン必須（3品同時精算）
                </span>
              </div>
              <span className="font-label-badge text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
                有効
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body-sm font-bold text-on-surface">4. 割引額 / 種別設定</label>
            <div className="grid grid-cols-2 gap-space-sm">
              <label className="bg-surface-container-low hover:bg-surface-container p-space-sm rounded-xl cursor-pointer flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="discount-type"
                    checked={discountType === 'fixed'}
                    onChange={() => setDiscountType('fixed')}
                    className="accent-secondary"
                  />
                  <span className="font-body-sm font-bold text-on-surface">定額値引き</span>
                </div>
                <div className="flex items-baseline gap-1 mt-1 pl-5">
                  <span className="font-headline-md text-secondary font-bold">¥100</span>
                  <span className="font-label-caption text-on-surface-variant">引き</span>
                </div>
              </label>
              <label className="bg-surface-container-low hover:bg-surface-container p-space-sm rounded-xl cursor-pointer flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="discount-type"
                    checked={discountType === 'percent'}
                    onChange={() => setDiscountType('percent')}
                    className="accent-secondary"
                  />
                  <span className="font-body-sm font-bold text-on-surface">定率割引</span>
                </div>
                <div className="flex items-baseline gap-1 mt-1 pl-5">
                  <span className="font-headline-md text-outline font-bold">15</span>
                  <span className="font-label-caption text-on-surface-variant">% OFF</span>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-caption font-bold text-on-surface">店舗日別上限回数</label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full bg-surface-container-low px-3 py-1.5 rounded-lg text-body-sm text-on-surface font-bold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-caption font-bold text-on-surface">対象タイムゾーン</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-surface-container-low px-2 py-1.5 rounded-lg text-body-sm text-on-surface"
              >
                <option>17:00 〜 21:00 (夜)</option>
                <option>11:00 〜 14:00 (昼)</option>
                <option>終日 (営業時間内)</option>
              </select>
            </div>
          </div>

          <div className="bg-surface-container p-space-sm rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-outline">
              do_not_disturb_on
            </span>
            <span className="font-label-caption text-on-surface-variant leading-snug">
              取り置きや事前予約は行われません。在庫切れ時はレジにてバーコード対象外アラートが出ます。
            </span>
          </div>

          <div className="flex flex-col gap-space-xs mt-space-xs">
            <button
              type="button"
              disabled={saveState === 'syncing'}
              onClick={() => handlePublish(false)}
              className={`w-full py-3 rounded-xl font-body-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                saveState === 'done'
                  ? 'bg-tertiary-container text-on-tertiary-container'
                  : 'bg-primary hover:bg-primary-container text-on-primary'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  saveState === 'syncing' ? 'animate-spin' : ''
                }`}
              >
                {saveState === 'syncing'
                  ? 'sync'
                  : saveState === 'done'
                    ? 'task_alt'
                    : 'check_circle'}
              </span>
              <span>
                {saveState === 'syncing'
                  ? 'POS同期中...'
                  : saveState === 'done'
                    ? '店舗POS・レジに即時配信完了！'
                    : '保存して即時有効化（店頭配信）'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handlePublish(true)}
              className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface py-2 rounded-xl font-body-sm font-bold transition-colors cursor-pointer"
            >
              下書きとして一時保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
