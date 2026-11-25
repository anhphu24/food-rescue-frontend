import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BarcodeSvg } from '../../components/BarcodeSvg';

type SettingsTab = 'basic' | 'rescue' | 'staff' | 'pos';

export const S06StoreSettingsPage: React.FC = () => {
  const {
    selectedStore,
    stores,
    selectStore,
    updateStoreInfo,
    staffMembers,
    addStaffMember,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('basic');
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [saveToastVisible, setSaveToastVisible] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [testBarcodeVisible, setTestBarcodeVisible] = useState(false);

  // Editable store fields
  const [storeName, setStoreName] = useState(selectedStore.name);
  const [storeAddress, setStoreAddress] = useState(selectedStore.address);
  const [storePhone, setStorePhone] = useState(selectedStore.phone);
  const [openTime, setOpenTime] = useState(selectedStore.openTime);
  const [closeTime, setCloseTime] = useState(selectedStore.closeTime);

  // Invite staff modal form
  const [staffName, setStaffName] = useState('');
  const [staffEmp, setStaffEmp] = useState('');
  const [staffRole, setStaffRole] = useState('青果部門 チーフ');
  const [staffPerm, setStaffPerm] = useState<'lot' | 'pos'>('lot');

  const triggerSave = () => {
    updateStoreInfo(selectedStore.id, {
      name: storeName,
      address: storeAddress,
      phone: storePhone,
      openTime,
      closeTime,
      hours: `${openTime} - ${closeTime}`,
    });
    setSaveToastVisible(true);
    setTimeout(() => setSaveToastVisible(false), 3200);
  };

  const handleInviteStaff = () => {
    if (!staffName.trim()) {
      setInviteModalOpen(false);
      return;
    }
    addStaffMember({
      id: `staff-${Date.now()}`,
      empCode: `${staffEmp.trim() || 'EMP-09204'} (${selectedStore.name.slice(-4)})`,
      name: staffName.trim(),
      initial: staffName.trim().slice(0, 1),
      department: staffRole,
      roleTitle: staffRole,
      permissionLabel:
        staffPerm === 'lot' ? 'ロット・商品マスター編集' : 'クーポン確認・利用照会',
      permissionIcon: staffPerm === 'lot' ? 'inventory_2' : 'qr_code_scanner',
      avatarBg: 'bg-primary text-on-primary',
      lastLogin: '招待送信済',
      active: true,
    });
    setStaffName('');
    setStaffEmp('');
    setInviteModalOpen(false);
    triggerSave();
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Utility Context Bar (Exact Stitch S06) */}
      <div className="px-space-md lg:px-space-lg py-space-md flex flex-wrap items-center justify-between gap-space-md bg-surface-container-low">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md shrink-0">
            <span className="material-symbols-outlined icon-filled text-on-primary text-[28px]">
              store
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h1 className="font-headline-lg text-on-surface">店舗設定 ・ スタッフ権限管理</h1>
              <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-badge px-space-xs py-0.5 rounded-full">
                店舗コード: {selectedStore.code}
              </span>
            </div>
            <span className="font-body-sm text-on-surface-variant">
              店頭での食品ロス削減見切りオペレーション、タイムセール設定、担当スタッフ権限を一括管理
            </span>
          </div>
        </div>

        {/* Quick Switcher & Save Trigger */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="relative">
            <button
              type="button"
              onClick={() => setStoreDropdownOpen((v) => !v)}
              className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm hover:bg-surface transition-all text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">domain</span>
              <span className="font-body-md font-bold">{selectedStore.name}</span>
              <span className="material-symbols-outlined text-outline text-[18px]">
                expand_more
              </span>
            </button>
            {storeDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-xl p-space-xs z-30">
                <span className="font-label-caption text-outline px-space-sm py-1 block">
                  管理可能な近隣系列店
                </span>
                {stores.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      selectStore(st.id, true);
                      setStoreName(st.name);
                      setStoreAddress(st.address);
                      setStorePhone(st.phone);
                      setOpenTime(st.openTime);
                      setCloseTime(st.closeTime);
                      setStoreDropdownOpen(false);
                    }}
                    className={`w-full text-left px-space-sm py-space-xs rounded-lg font-body-sm flex items-center justify-between cursor-pointer ${
                      st.id === selectedStore.id
                        ? 'bg-surface-container text-on-surface font-bold'
                        : 'hover:bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span>{st.name}</span>
                    {st.id === selectedStore.id ? (
                      <span className="material-symbols-outlined text-primary text-[16px]">
                        check
                      </span>
                    ) : (
                      <span className="font-label-badge text-outline">{st.distanceKm}km</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={triggerSave}
            className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-body-md font-bold px-space-lg py-space-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span>設定を保存する</span>
          </button>
        </div>
      </div>

      {/* Tab Controller */}
      <div className="px-space-md lg:px-space-lg pt-space-md bg-surface-container-low flex items-center gap-space-xs overflow-x-auto">
        {(
          [
            { key: 'basic', icon: 'badge', label: '店舗基本情報' },
            { key: 'rescue', icon: 'schedule', label: '売り場・タイムセール設定', dot: true },
            {
              key: 'staff',
              icon: 'group',
              label: 'スタッフ・権限管理',
              badge: `${staffMembers.length}名`,
            },
            { key: 'pos', icon: 'point_of_sale', label: 'POS・システム連携' },
          ] as const
        ).map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-space-xs px-space-md py-space-sm rounded-t-xl font-body-md transition-all shrink-0 cursor-pointer ${
                active
                  ? 'bg-surface-container-lowest font-bold text-primary shadow-sm'
                  : 'bg-transparent font-medium text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
              <span>{t.label}</span>
              {'dot' in t && t.dot && (
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
              )}
              {'badge' in t && t.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-badge">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Save Toast Notification */}
      {saveToastVisible && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded-xl shadow-xl flex items-center gap-space-md animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[18px]">done_all</span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-md font-bold">店舗設定が正常に更新されました</span>
            <span className="font-body-sm text-outline-variant">
              店内の店頭見切りスケジュールおよびレジ同期が反映されました。
            </span>
          </div>
        </div>
      )}

      {/* Tab 1: 店舗基本情報 */}
      {activeTab === 'basic' && (
        <div className="px-space-md lg:px-space-lg py-space-xl grid grid-cols-12 gap-space-lg">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  storefront
                </span>
                <span className="font-headline-md text-on-surface">店舗プロフィール</span>
              </div>
              <span className="font-label-badge bg-primary-fixed text-on-primary-fixed px-space-sm py-1 rounded-full font-bold">
                POS連動: アクティブ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <label className="font-body-sm text-on-surface-variant font-bold">店舗正式名称</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-surface-container-low px-space-md py-space-sm rounded-xl font-body-md text-on-surface focus:outline-none focus:bg-surface-container"
                />
              </div>
              <div className="flex flex-col gap-space-xs">
                <label className="font-body-sm text-on-surface-variant font-bold">
                  店舗コード / 社内管理ID
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedStore.code}
                  className="w-full bg-surface-container-high px-space-md py-space-sm rounded-xl font-body-md text-outline cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-space-xs md:col-span-2">
                <label className="font-body-sm text-on-surface-variant font-bold">
                  所在地（お客様アプリ表示用）
                </label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full bg-surface-container-low px-space-md py-space-sm rounded-xl font-body-md text-on-surface focus:outline-none focus:bg-surface-container"
                />
              </div>
              <div className="flex flex-col gap-space-xs">
                <label className="font-body-sm text-on-surface-variant font-bold">
                  代表電話番号 (店舗代表)
                </label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full bg-surface-container-low px-space-md py-space-sm rounded-xl font-body-md text-on-surface focus:outline-none focus:bg-surface-container"
                />
              </div>
              <div className="flex flex-col gap-space-xs">
                <label className="font-body-sm text-on-surface-variant font-bold">運営法人</label>
                <input
                  type="text"
                  disabled
                  value="株式会社ライフコーポレーション"
                  className="w-full bg-surface-container-high px-space-md py-space-sm rounded-xl font-body-md text-outline cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-space-md flex flex-col gap-space-sm">
              <span className="font-body-md font-bold text-on-surface">
                営業時間・見切りオペレーション枠
              </span>
              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md">
                  <div className="p-space-sm rounded-lg bg-surface-container text-primary">
                    <span className="material-symbols-outlined text-[24px]">alarm_on</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm font-bold text-on-surface">全日通常営業</span>
                    <span className="font-label-caption text-on-surface-variant">
                      入店可能時間（深夜レジ締切 22:50）
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs">
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="bg-surface-container-lowest px-space-sm py-space-xs rounded-lg font-label-numeric-md text-on-surface"
                  />
                  <span className="text-outline">〜</span>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="bg-surface-container-lowest px-space-sm py-space-xs rounded-lg font-label-numeric-md text-on-surface"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    pin_drop
                  </span>
                  <span className="font-body-md font-bold text-on-surface">
                    店舗位置・来店検知エリア
                  </span>
                </div>
                <span className="font-label-badge bg-surface-container text-on-surface-variant px-space-xs py-0.5 rounded">
                  ビーコン有効
                </span>
              </div>

              <div className="w-full h-48 bg-surface-container-low rounded-xl relative shadow-inner overflow-hidden flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 animate-ping absolute" />
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-lg z-10">
                  <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 bg-surface/90 backdrop-blur-md px-space-sm py-space-xs rounded-lg flex items-center justify-between text-on-surface">
                  <span className="font-label-caption font-bold">半径 250m 店頭プッシュ</span>
                  <span className="font-label-badge text-primary">自動チェックインOK</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs">
                <span className="font-body-sm font-bold text-on-surface">店頭購買専用ポリシー</span>
                <p className="font-label-caption text-on-surface-variant">
                  当システムは事前取り置き・配送は非対応です。来店客が店頭の陳列棚から実商品をカゴに入れ、登録レジバーコードを提示して決済する運用ポリシーで固定されています。
                </p>
              </div>
            </div>

            <div className="bg-primary text-on-primary rounded-xl p-space-md shadow-md flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-caption text-primary-fixed">
                  本日の推定食品ロス削減実績
                </span>
                <span className="font-headline-lg font-bold">142.8 kg</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[24px]">eco</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 売り場・タイムセール設定 */}
      {activeTab === 'rescue' && (
        <div className="px-space-md lg:px-space-lg py-space-xl grid grid-cols-12 gap-space-lg">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[24px]">bolt</span>
                  <span className="font-headline-md text-on-surface">
                    見切り品・タイムセール自動プッシュ方針
                  </span>
                </div>
                <span className="font-body-sm text-on-surface-variant">
                  店頭のシール貼り替えと同時に来店客アプリへ通知する時間枠を定刻制御します
                </span>
              </div>
              <span className="font-label-badge bg-secondary-fixed text-on-secondary-fixed font-bold px-space-sm py-1 rounded-full">
                AI最適化稼働中
              </span>
            </div>

            <div className="flex flex-col gap-space-md">
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body-md font-bold text-on-surface">
                        夕方見切り品シール更新（一次ディスカウント）
                      </span>
                      <span className="px-space-xs py-0.5 rounded bg-surface-container font-label-badge text-primary">
                        20%〜30% OFF
                      </span>
                    </div>
                    <span className="font-label-caption text-on-surface-variant">
                      惣菜・鮮魚・精肉の消費期限当日分。陳列棚シール貼付と連動。
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    defaultValue="17:00"
                    className="bg-surface-container-lowest px-2 py-1 rounded-lg font-label-numeric-md"
                  />
                  <span>〜</span>
                  <input
                    type="time"
                    defaultValue="19:00"
                    className="bg-surface-container-lowest px-2 py-1 rounded-lg font-label-numeric-md"
                  />
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body-md font-bold text-on-surface">
                        夜間最終売り尽くしタイムセール（最終救済）
                      </span>
                      <span className="px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary font-label-badge">
                        50% OFF
                      </span>
                    </div>
                    <span className="font-label-caption text-on-surface-variant">
                      閉店前の最終価格。お気に入り登録客へ一斉プッシュ通知配信。
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    defaultValue="20:00"
                    className="bg-surface-container-lowest px-2 py-1 rounded-lg font-label-numeric-md"
                  />
                  <span>〜</span>
                  <input
                    type="time"
                    defaultValue="21:00"
                    className="bg-surface-container-lowest px-2 py-1 rounded-lg font-label-numeric-md"
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-space-md rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-space-sm text-center">
              {[
                { aisle: 'Aisle 01', name: '青果・有機野菜', status: '見切り台 連動済', hot: false },
                { aisle: 'Aisle 02', name: '鮮魚・刺身', status: '見切り台 連動済', hot: false },
                { aisle: 'Aisle 03', name: '精肉・ハム', status: '集中セール対象', hot: true },
                { aisle: 'Aisle 04', name: '日配・乳製品', status: '見切り台 連動済', hot: false },
              ].map((z) => (
                <div
                  key={z.aisle}
                  className={`p-space-sm rounded-lg flex flex-col items-center gap-1 ${
                    z.hot ? 'bg-secondary-fixed/50' : 'bg-surface-container-lowest'
                  }`}
                >
                  <span className="font-label-caption text-outline">{z.aisle}</span>
                  <span className="font-body-sm font-bold text-on-surface">{z.name}</span>
                  <span
                    className={`font-label-badge px-2 py-0.5 rounded ${
                      z.hot
                        ? 'bg-secondary-container text-on-secondary'
                        : 'text-primary bg-primary-fixed/40'
                    }`}
                  >
                    {z.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Donut Chart Card */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-tertiary text-[24px]">smart_toy</span>
              <div>
                <span className="font-body-md font-bold text-on-surface block">
                  AIレシピ提案の自動連動
                </span>
                <span className="font-label-caption text-on-surface-variant">
                  見切り品を使った献立を買い物客へ自動生成
                </span>
              </div>
            </div>
            <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
              <span className="font-body-sm font-bold text-on-surface">
                品目別見切り消化比率（直近7日間）
              </span>
              <div className="flex items-center justify-between gap-space-md">
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="68, 100"
                      strokeLinecap="round"
                      strokeWidth="4"
                    />
                    <path
                      className="text-secondary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="22, 100"
                      strokeDashoffset="-68"
                      strokeLinecap="round"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-label-numeric-md font-bold text-on-surface">91%</span>
                    <span className="font-label-caption text-outline">消化率</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-on-surface font-label-caption">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" /> 惣菜・精肉 (68%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> 日配・鮮魚 (23%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />{' '}
                    青果・ベーカリー (9%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: スタッフ・権限管理 */}
      {activeTab === 'staff' && (
        <div className="px-space-md lg:px-space-lg py-space-xl flex flex-col gap-space-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
            <div>
              <span className="font-headline-md text-on-surface block">
                店舗登録スタッフ一覧 &amp; ロール権限
              </span>
              <span className="font-body-sm text-on-surface-variant">
                店長、チーフ、レジ責任者の操作可能な画面とマスター編集権限を割り当てます
              </span>
            </div>
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-body-md font-bold px-space-md py-space-sm rounded-xl shadow-md self-start sm:self-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>+ 新規スタッフを招待</span>
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-caption uppercase tracking-wider">
                  <tr>
                    <th className="px-space-lg py-space-md">氏名 / 従業員番号</th>
                    <th className="px-space-md py-space-md">店舗役職</th>
                    <th className="px-space-md py-space-md">付与システム権限</th>
                    <th className="px-space-md py-space-md">最終ログイン</th>
                    <th className="px-space-md py-space-md">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-on-surface font-body-sm">
                  {staffMembers.map((st) => (
                    <tr key={st.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-space-lg py-space-md">
                        <div className="flex items-center gap-space-sm">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${st.avatarBg}`}
                          >
                            {st.initial}
                          </div>
                          <div>
                            <span className="font-body-md font-bold text-on-surface block">
                              {st.name}
                            </span>
                            <span className="font-label-caption text-outline">{st.empCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-space-md py-space-md font-medium">{st.roleTitle}</td>
                      <td className="px-space-md py-space-md">
                        <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-badge font-bold">
                          <span className="material-symbols-outlined text-[14px]">
                            {st.permissionIcon}
                          </span>
                          {st.permissionLabel}
                        </span>
                      </td>
                      <td className="px-space-md py-space-md text-on-surface-variant">
                        {st.lastLogin}
                      </td>
                      <td className="px-space-md py-space-md">
                        <span className="inline-flex items-center gap-1 text-primary font-bold font-label-badge">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          アクティブ
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-space-md bg-surface-container-low flex items-center justify-between text-on-surface-variant font-label-caption">
              <span>※ 退職または配置転換時は速やかにロール権限を無効化してください。</span>
              <span>最大登録可能アカウント数: 15 / {staffMembers.length} 使用中</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: POS・システム連携 */}
      {activeTab === 'pos' && (
        <div className="px-space-md lg:px-space-lg py-space-xl grid grid-cols-12 gap-space-lg">
          <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">terminal</span>
                <div>
                  <span className="font-headline-md text-on-surface block">
                    POSレジシステム連携ステータス
                  </span>
                  <span className="font-body-sm text-on-surface-variant">
                    店頭レジスキャナとのリアルタイム割引マスター同期設定
                  </span>
                </div>
              </div>
              <span className="bg-primary-fixed text-on-primary-fixed px-space-sm py-1 rounded-full font-label-badge font-bold">
                常時同期稼働中
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
                <span className="font-body-sm font-bold text-on-surface">POSゲートウェイ端末</span>
                <span className="font-label-numeric-md text-primary">
                  {selectedStore.posGateway}
                </span>
                <span className="font-label-caption text-outline">
                  IP: {selectedStore.posIp} (店舗専用LAN)
                </span>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
                <span className="font-body-sm font-bold text-on-surface">
                  バーコード発券フォーマット
                </span>
                <span className="font-label-numeric-md text-on-surface">
                  CODE128 / JAN-13 (共通)
                </span>
                <span className="font-label-caption text-outline">
                  店頭見切りシールスキャナ準拠
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-body-sm font-bold text-on-surface">
                レジ連携テスト（疎通確認）
              </span>
              <p className="font-body-sm text-on-surface-variant">
                テスト用ワンタイム見切りバーコードを画面表示し、セルフレジ及び有人レジでの読み取り疎通試験を実施できます。
              </p>
              <div className="pt-space-xs">
                <button
                  type="button"
                  onClick={() => setTestBarcodeVisible((v) => !v)}
                  className="bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-space-sm rounded-xl font-body-sm font-bold inline-flex items-center gap-space-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
                  <span>テスト用バーコードを生成・印字テスト</span>
                </button>
              </div>
              {testBarcodeVisible && (
                <div className="mt-2 p-space-md rounded-xl bg-surface-container-low flex flex-col items-center gap-2">
                  <BarcodeSvg code="FR-TEST-POS-0094" height={68} />
                  <span className="font-label-numeric-md text-on-surface">FR-TEST-POS-0094</span>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md h-fit">
            <span className="font-body-md font-bold text-on-surface">ネットワーク健全度</span>
            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
              <span className="font-body-sm text-on-surface-variant">API応答速度</span>
              <span className="font-label-numeric-md text-primary">48 ms</span>
            </div>
            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
              <span className="font-body-sm text-on-surface-variant">レジ割引き照会エラー率</span>
              <span className="font-label-numeric-md text-on-surface">0.00 %</span>
            </div>
            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
              <span className="font-body-sm text-on-surface-variant">前回同期タイムスタンプ</span>
              <span className="font-label-caption text-outline">18:45:12 (3分前)</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Page Footer Actions */}
      <div className="px-space-md lg:px-space-lg py-space-lg mt-space-lg bg-surface-container-lowest shadow-[0_-4px_16px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md flex-wrap">
          <Link
            to="/auth"
            className="flex items-center gap-space-xs text-error hover:bg-error-container hover:text-on-error-container px-space-md py-space-sm rounded-xl font-body-sm font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>店舗管理コンソールからログアウト</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container px-space-md py-space-sm rounded-xl font-body-sm font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">smartphone</span>
            <span>お客様向け店頭画面へ戻る</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={triggerSave}
          className="bg-primary hover:bg-primary-container text-on-primary font-body-md font-bold px-space-xl py-space-sm rounded-xl shadow-md transition-all flex items-center gap-space-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          <span>設定を保存する</span>
        </button>
      </div>

      {/* Invite Staff Modal */}
      {inviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-on-background/40 backdrop-blur-sm"
          onClick={() => setInviteModalOpen(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-2xl flex flex-col gap-space-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  person_add
                </span>
                <span className="font-headline-md text-on-surface">新規スタッフの招待</span>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-outline hover:text-on-surface p-1 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-space-sm">
              <div className="flex flex-col gap-1">
                <label className="font-body-sm text-on-surface-variant font-bold">氏名</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="例: 木村 大輔"
                  className="w-full bg-surface-container-low px-space-md py-space-sm rounded-xl font-body-md text-on-surface focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-body-sm text-on-surface-variant font-bold">
                  社員・従業員番号
                </label>
                <input
                  type="text"
                  value={staffEmp}
                  onChange={(e) => setStaffEmp(e.target.value)}
                  placeholder="例: EMP-09204"
                  className="w-full bg-surface-container-low px-space-md py-space-sm rounded-xl font-body-md text-on-surface focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-body-sm text-on-surface-variant font-bold">
                  担当売り場 / 役職
                </label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full bg-surface-container-low px-space-md py-space-sm rounded-xl font-body-md text-on-surface focus:outline-none"
                >
                  <option>青果部門 チーフ</option>
                  <option>鮮魚部門 チーフ</option>
                  <option>惣菜部門 チーフ</option>
                  <option>レジ・サービス リーダー</option>
                  <option>副店長 / フロアマネージャー</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-body-sm text-on-surface-variant font-bold">
                  割り当て権限ロール
                </label>
                <div className="flex flex-col gap-space-xs">
                  <label className="flex items-center gap-space-xs bg-surface-container-low p-space-sm rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="perm-role"
                      checked={staffPerm === 'lot'}
                      onChange={() => setStaffPerm('lot')}
                      className="accent-primary"
                    />
                    <div className="flex flex-col">
                      <span className="font-body-sm font-bold text-on-surface">
                        ロット・商品マスター編集
                      </span>
                      <span className="font-label-caption text-outline">
                        見切り品・在庫の登録とタイムセール値付けが可能
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center gap-space-xs bg-surface-container-low p-space-sm rounded-xl cursor-pointer">
                    <input
                      type="radio"
                      name="perm-role"
                      checked={staffPerm === 'pos'}
                      onChange={() => setStaffPerm('pos')}
                      className="accent-primary"
                    />
                    <div className="flex flex-col">
                      <span className="font-body-sm font-bold text-on-surface">
                        レジ・利用照会
                      </span>
                      <span className="font-label-caption text-outline">
                        顧客提示のレジバーコード確認・照会のみ可能
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-space-sm pt-space-sm">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="px-space-md py-space-sm rounded-xl font-body-md text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleInviteStaff}
                className="bg-primary hover:bg-primary-container text-on-primary font-body-md font-bold px-space-lg py-space-sm rounded-xl shadow-sm cursor-pointer"
              >
                招待メール送信・追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
