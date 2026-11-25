import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const S01_IMAGES = {
  beef: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNT96XaVktS2GzF-s9BZokUgc8tRlleBvIZQB2HhBEKbDo52Z_JmZNy09nAEvZmm1Nl6zBsQzSNBwt-yeUmxPv96DSl-VNbIaVDKG9ZdgM416BU7tNMNzaUmyFMRcVclNX_ey7NKcsGZLt2l4Mhmw8eoUcqMfqpq2rU6AzY0OWHZVAoe0q36prEftCB0hOYHUT2e6YrlmTmpyLDORJqjkMT7Wf7FCIQxiu3fiOrZ94',
  bream:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBdc9T4nzPqaIVHgE4yxlVp6M3tRU45Nff5YsaeeUAQFvt2mWcDKdB_7YKM8gkr0zNLSBUSGaUOSahu-1qD2__7tAhkpv5zzjkiNQ36qJzJNB72gqMO_N08tPunernkQ2ycK6_xqhNcJDVeFaMrazaLNzMe9etGtn5dfG0lNjAkOwVS0AZnRnx0vC-vCJOEe8KsqApwzZWltQ_pR-WTOZ-0LoijSYiyHAq9PUK_lswb',
  onion:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDzXHcqBMeeM5sBZDb6yJh4lQsD4IzG2g-L80g_uXmlWDkmFQt0oRvH1jhOL8owj-qE01WdboPmbY5Tszpu6wCaRp-VjpqdukaWTesR4dmq7GcD2fA91uDrKaFWG4AzX016q1znZ-xwQSo1ae1IqNoi1OlvJJWcAlMDswHIVINSZm17WDVXA5nspSzb-d8qlj4hu-t24B--gPOOioVdcFI-wiYXLOL5NHupdbKJ2vQe',
};

export const S01DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStore, coupons } = useApp();
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);

  const toggleConfirm = (id: string) => {
    setConfirmedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const redeemedTodayCount = 84 + coupons.filter((c) => c.status === 'USED' && !c.id.startsWith('cp-used')).length;

  return (
    <div className="p-space-lg flex flex-col gap-space-lg max-w-[1600px] mx-auto w-full">
      {/* Store Welcome & Command Strip - Exact Stitch s01/code.html */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              店舗オペレーション司令塔
            </h1>
            <span className="font-label-badge text-label-badge bg-surface-container-high text-on-surface-variant px-space-sm py-0.5 rounded-full">
              店番: {selectedStore.code}
            </span>
            <span className="font-label-badge text-label-badge bg-secondary-fixed text-on-secondary-fixed-variant px-space-sm py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              デモデータ表示中
            </span>
          </div>
          <div className="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm flex-wrap">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">
                calendar_today
              </span>
              2025年10月24日 (金) 18:45 現在
            </span>
            <span className="text-outline-variant">|</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                wb_cloudy
              </span>
              天候: 曇り (19℃) / 夕刻ピーク中
            </span>
            <span className="text-outline-variant">|</span>
            <span className="text-primary font-bold">店頭セルフピックアップ運用モード</span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => navigate('/store/coupons')}
            className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-space-sm rounded-xl font-body-sm text-body-sm font-bold transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">sell</span>
            <span>+ クーポン発行</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/store/register')}
            className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-space-sm rounded-xl font-body-sm text-body-sm font-bold transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            <span>POS利用手動確認</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/store/lots')}
            className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-md py-space-sm rounded-xl font-body-sm text-body-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ 新規ロット・見切り登録</span>
          </button>
        </div>
      </div>

      {/* Core KPI Grid (4 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-surface-container-low rounded-full opacity-60 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant font-bold">
              出品中レスキュー品
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            </div>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-xl text-headline-xl text-on-surface font-bold">142</span>
            <span className="font-body-md text-body-md text-on-surface-variant">品</span>
            <span className="ml-auto font-label-badge text-label-badge bg-primary-fixed text-on-primary-fixed px-space-xs py-0.5 rounded flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>前日比 +12%
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant font-label-caption text-label-caption pt-space-xs">
            <span>陳列棚セルフピック対象</span>
            <span className="text-primary font-bold">稼働率 94%</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border-l-4 border-error group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="font-body-sm text-body-sm text-on-surface-variant font-bold">
                本日消費期限・要対応
              </span>
              <span className="w-2 h-2 rounded-full bg-error animate-ping" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[20px]">priority_high</span>
            </div>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-xl text-headline-xl text-error font-bold">28</span>
            <span className="font-body-md text-body-md text-error">品</span>
            <span className="ml-auto font-label-badge text-label-badge bg-error-container text-on-error-container px-space-xs py-0.5 rounded">
              早急な確認推奨
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-caption text-label-caption pt-space-xs">
            <span className="bg-surface-container px-1.5 py-0.5 rounded">精肉 12</span>
            <span className="bg-surface-container px-1.5 py-0.5 rounded">日配 9</span>
            <span className="bg-surface-container px-1.5 py-0.5 rounded">青果 7</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant font-bold">
              クーポン発行 / レジ利用率
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-xl text-headline-xl text-on-surface font-bold">
              26.4
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">%</span>
            <span className="ml-auto text-on-surface-variant font-body-sm text-body-sm">
              <b className="text-primary font-bold">{redeemedTodayCount}</b> / 318件
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: '26.4%' }} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant font-bold">
              本日食品ロス削減実績
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
              <span className="material-symbols-outlined text-[20px]">compost</span>
            </div>
          </div>
          <div className="my-space-sm flex items-baseline gap-space-xs">
            <span className="font-headline-xl text-headline-xl text-primary font-bold">42.6</span>
            <span className="font-body-md text-body-md text-on-surface-variant">kg</span>
            <span className="ml-auto font-label-badge text-label-badge bg-surface-container text-on-surface-variant px-space-xs py-0.5 rounded">
              CO₂換算 約128kg
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant font-label-caption text-label-caption pt-space-xs">
            <span>目標達成度: 85.2kg / 日</span>
            <span className="text-primary font-bold">進行度 50%</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (8 of 12 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Urgent Action Lots Section */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[22px]">alarm</span>
                <span className="font-headline-md text-headline-md text-on-surface">
                  期限間近・早急な対応が必要な店頭ロット
                </span>
              </div>
              <Link
                to="/store/lots"
                className="text-primary hover:text-primary-container font-body-sm text-body-sm font-bold flex items-center gap-0.5"
              >
                <span>ロット一覧 (全28件)</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </Link>
            </div>
            <div className="text-on-surface-variant font-body-sm text-body-sm">
              店頭棚札の割引シール更新および「AIレシピセット割」への追加プッシュが可能な最優先アイテムです。
            </div>

            <div className="flex flex-col gap-space-sm">
              {[
                {
                  id: 'u-1',
                  img: S01_IMAGES.beef,
                  badge: '-30%',
                  badgeClass: 'bg-secondary text-on-secondary',
                  name: '国産牛肩ローススライス 250g',
                  shelf: '精肉 (棚A-04)',
                  expiry: '本日21:00まで',
                  expiryIcon: 'schedule',
                  expiryClass: 'text-error',
                  stock: '3パック',
                  orig: '¥1,180',
                  price: '¥826',
                  priceClass: 'text-secondary',
                },
                {
                  id: 'u-2',
                  img: S01_IMAGES.bream,
                  badge: '-40%',
                  badgeClass: 'bg-secondary text-on-secondary',
                  name: '鮮魚 愛媛県産 真鯛のサク 180g',
                  shelf: '鮮魚 (冷ケースC-02)',
                  expiry: '本日20:00まで',
                  expiryIcon: 'schedule',
                  expiryClass: 'text-error',
                  stock: '2パック',
                  orig: '¥880',
                  price: '¥528',
                  priceClass: 'text-secondary',
                },
                {
                  id: 'u-3',
                  img: S01_IMAGES.onion,
                  badge: '規格外品',
                  badgeClass: 'bg-tertiary text-on-tertiary',
                  name: '北海道産 たまねぎ 1個バラ',
                  shelf: '青果 (平台01)',
                  expiry: '本日中推奨',
                  expiryIcon: 'today',
                  expiryClass: 'text-on-surface-variant',
                  stock: '8個',
                  orig: '¥78',
                  price: '¥45',
                  priceClass: 'text-primary',
                },
              ].map((item) => {
                const isDone = confirmedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-surface p-space-md rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md hover:bg-surface-container-low transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-space-md min-w-0">
                      <div className="w-16 h-16 rounded-lg bg-surface-container-high shrink-0 overflow-hidden relative">
                        <img alt={item.name} className="w-full h-full object-cover" src={item.img} />
                        <span
                          className={`absolute top-1 left-1 ${item.badgeClass} font-label-badge text-[10px] px-1 rounded font-bold`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-xs flex-wrap">
                          <span className="font-body-md text-body-md text-on-surface font-bold truncate">
                            {item.name}
                          </span>
                          <span className="font-label-badge text-label-badge bg-surface-container px-space-xs py-0.5 rounded text-on-surface-variant">
                            {item.shelf}
                          </span>
                        </div>
                        <div className="flex items-center gap-space-md mt-1 text-on-surface-variant font-body-sm text-body-sm flex-wrap">
                          <span className={`${item.expiryClass} font-bold flex items-center gap-0.5`}>
                            <span className="material-symbols-outlined text-[14px]">
                              {item.expiryIcon}
                            </span>
                            {item.expiry}
                          </span>
                          <span>
                            店頭残: <b className="text-on-surface font-bold">{item.stock}</b>
                          </span>
                          <span className="line-through text-outline">{item.orig}</span>
                          <span className={`${item.priceClass} font-bold text-headline-md`}>
                            {item.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-xs w-full md:w-auto justify-end shrink-0 pt-space-xs md:pt-0">
                      <button
                        type="button"
                        onClick={() => navigate('/store/lots')}
                        className="px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-bold transition-colors cursor-pointer"
                      >
                        価格変更
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/store/coupons')}
                        className="px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-body-sm text-body-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">soup_kitchen</span>
                        <span>レシピ連動</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleConfirm(item.id)}
                        className={`px-space-sm py-1.5 rounded-lg font-body-sm text-body-sm font-bold transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'bg-primary text-on-primary hover:bg-primary-container'
                        }`}
                      >
                        {isDone ? '✓ 確認完了' : '確認済'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Register Coupon Usage Log */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="font-headline-md text-headline-md text-on-surface">
                  直近の店頭レジクーポン利用動向
                </span>
                <span className="font-label-badge text-label-badge bg-surface-container px-space-xs py-0.5 rounded text-on-surface-variant">
                  リアルタイム受信
                </span>
              </div>
              <span className="font-label-caption text-label-caption text-on-surface-variant">
                店頭バーコードスキャン実績
              </span>
            </div>

            <div className="flex flex-col gap-space-xs">
              {[
                {
                  time: '18:42',
                  reg: 'レジ 02 (セルフレジ)',
                  title: '絶品おうち牛丼セット割 (-¥100)',
                  items: '対象: 国産牛肩ロース + 玉ねぎ + 紅生姜',
                },
                {
                  time: '18:35',
                  reg: 'レジ 05 (有人レジ)',
                  title: '具だくさん豚汁セット割 (-¥80)',
                  items: '対象: 国産豚バラ切り落とし + ごぼう',
                },
                {
                  time: '18:18',
                  reg: 'レジ 01 (セルフレジ)',
                  title: '絶品おうち牛丼セット割 (-¥100)',
                  items: '対象: 国産牛肩ロース + 玉ねぎ',
                },
                {
                  time: '17:54',
                  reg: 'レジ 04 (セルフレジ)',
                  title: '夕方レスキュー青果単品クーポン (-¥30)',
                  items: '対象: カットキャベツ',
                },
              ].map((log, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-space-sm rounded-lg bg-surface hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-space-md flex-wrap">
                    <span className="font-label-numeric-md text-label-numeric-md text-outline font-bold">
                      {log.time}
                    </span>
                    <span className="font-label-badge text-label-badge bg-surface-container px-2 py-1 rounded font-bold text-on-surface">
                      {log.reg}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-body-sm text-body-sm text-on-surface font-bold">
                        {log.title}
                      </span>
                      <span className="font-label-caption text-label-caption text-on-surface-variant">
                        {log.items}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0">
                    <span className="font-label-badge text-label-badge bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded font-bold">
                      割引適用済
                    </span>
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      check_circle
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-space-xs text-center">
              <button
                type="button"
                onClick={() => navigate('/store/register')}
                className="text-primary hover:text-primary-container font-body-sm text-body-sm font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <span>すべてのPOS利用ログを閲覧 (本日全{redeemedTodayCount}件)</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 of 12 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Recipe Synergy Ranking */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  auto_awesome
                </span>
                <span className="font-headline-md text-headline-md text-on-surface">
                  人気AIレシピ連動
                </span>
              </div>
              <span className="font-label-badge text-label-badge bg-primary-fixed text-on-primary-fixed px-space-xs py-0.5 rounded">
                本日集計
              </span>
            </div>
            <div className="text-on-surface-variant font-body-sm text-body-sm">
              店頭見切り品と通常棚商品のまとめ買いを促進するセット割クーポンの利用上位ランキングです。
            </div>

            <div className="flex flex-col gap-space-md pt-space-xs">
              {/* Rank 1 */}
              <div className="flex flex-col gap-space-xs bg-surface p-space-md rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary font-label-badge text-center leading-5 font-bold shrink-0">
                      1
                    </span>
                    <span className="font-body-md text-body-md text-on-surface font-bold">
                      絶品おうち牛丼セット
                    </span>
                  </div>
                  <span className="font-label-numeric-md text-label-numeric-md text-secondary font-bold shrink-0">
                    利用率 42%
                  </span>
                </div>
                <div className="text-on-surface-variant font-body-sm text-body-sm">
                  牛肉スライス（見切り）+ 玉ねぎ + つゆ
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '42%' }} />
                </div>
                <span className="font-label-caption text-label-caption text-outline">
                  本日レジ適用: 35件 / 関連売上推計 ¥41,200
                </span>
              </div>

              {/* Rank 2 */}
              <div className="flex flex-col gap-space-xs bg-surface p-space-md rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <span className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface font-label-badge text-center leading-5 font-bold shrink-0">
                      2
                    </span>
                    <span className="font-body-md text-body-md text-on-surface font-bold">
                      ヘルシー具だくさん豚汁
                    </span>
                  </div>
                  <span className="font-label-numeric-md text-label-numeric-md text-primary font-bold shrink-0">
                    利用率 28%
                  </span>
                </div>
                <div className="text-on-surface-variant font-body-sm text-body-sm">
                  豚コマ（見切り）+ ごぼう + こんにゃく
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-primary h-full rounded-full" style={{ width: '28%' }} />
                </div>
                <span className="font-label-caption text-label-caption text-outline">
                  本日レジ適用: 24件 / 関連売上推計 ¥22,800
                </span>
              </div>

              {/* Rank 3 */}
              <div className="flex flex-col gap-space-xs bg-surface p-space-md rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <span className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface font-label-badge text-center leading-5 font-bold shrink-0">
                      3
                    </span>
                    <span className="font-body-md text-body-md text-on-surface font-bold">
                      贅沢すき焼き風煮込み
                    </span>
                  </div>
                  <span className="font-label-numeric-md text-label-numeric-md text-on-surface font-bold shrink-0">
                    利用率 18%
                  </span>
                </div>
                <div className="text-on-surface-variant font-body-sm text-body-sm">
                  牛肉肩ロース + 焼き豆腐 + 白ネギ
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-outline h-full rounded-full" style={{ width: '18%' }} />
                </div>
                <span className="font-label-caption text-label-caption text-outline">
                  本日レジ適用: 15件 / 関連売上推計 ¥19,400
                </span>
              </div>
            </div>
          </div>

          {/* POS & System Status Panel */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[22px]">dns</span>
                <span className="font-headline-md text-headline-md text-on-surface">
                  システム連携ステータス
                </span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            </div>

            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between p-space-sm bg-surface rounded-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    point_of_sale
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">POSレジ端末連携</span>
                </div>
                <span className="font-label-badge text-label-badge bg-primary-fixed text-on-primary-fixed px-space-xs py-0.5 rounded font-bold">
                  8台中 8台 正常稼働
                </span>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface rounded-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">sync</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    最終在庫自動同期
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant font-bold">
                  18:40 (5分前)
                </span>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface rounded-lg">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    trending_up
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    夕方ピーク来店予測
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-secondary font-bold">
                  +15% (通常金曜比)
                </span>
              </div>
            </div>

            <div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                tips_and_updates
              </span>
              <span className="font-label-caption text-label-caption leading-relaxed">
                19:00前後に精肉・鮮魚コーナーの集中見切りシール更新を推奨します。連動クーポンが即時にお客様アプリ側へ配信されます。
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
