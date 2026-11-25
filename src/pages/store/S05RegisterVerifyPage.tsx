import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { IMAGES } from '../../data/seedData';
import { verifyCouponAtRegister } from '../../utils/foodRescueLogic';

export const S05RegisterVerifyPage: React.FC = () => {
  const { coupons, selectedStore, redeemCoupon } = useApp();
  const [searchParams] = useSearchParams();

  const initialToken = searchParams.get('token') || 'FR-2025-0849-5510';
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [lookedUpToken, setLookedUpToken] = useState(initialToken);
  const [checks, setChecks] = useState<[boolean, boolean, boolean]>([true, true, true]);
  const [redeemedTx, setRedeemedTx] = useState<{ txNumber: string; discount: number } | null>(null);
  const [callHelpToast, setCallHelpToast] = useState(false);

  const verification = useMemo(
    () => verifyCouponAtRegister(coupons, lookedUpToken, selectedStore.id),
    [coupons, lookedUpToken, selectedStore.id]
  );

  const allChecked = checks[0] && checks[1] && checks[2];
  const missingNums = [!checks[0] ? '①' : '', !checks[1] ? '②' : '', !checks[2] ? '③' : '']
    .filter(Boolean)
    .join(' ');

  const displayCoupon = verification.coupon || coupons[0];

  const handleLookup = (e?: React.FormEvent) => {
    e?.preventDefault();
    setRedeemedTx(null);
    setLookedUpToken(tokenInput.trim());
  };

  const simulatePreset = (code: string) => {
    setRedeemedTx(null);
    setTokenInput(code);
    setLookedUpToken(code);
    setChecks([true, true, true]);
  };

  const handleReset = () => {
    setRedeemedTx(null);
    setTokenInput('FR-2025-0849-5510');
    setLookedUpToken('FR-2025-0849-5510');
    setChecks([true, true, true]);
  };

  const handleCommitRedeem = () => {
    if (!verification.ok || !allChecked) return;
    const { result, txNumber } = redeemCoupon(lookedUpToken, allChecked);
    if (result.ok && txNumber) {
      setRedeemedTx({
        txNumber,
        discount: result.coupon?.discountAmountYen || 100,
      });
    }
  };

  const badgeStyle = (() => {
    switch (verification.status) {
      case 'VALID':
        return {
          cls: 'bg-tertiary-fixed text-on-tertiary-fixed',
          icon: 'check_circle',
          text: '有効・利用可能',
        };
      case 'ALREADY_USED':
        return {
          cls: 'bg-error-container text-on-error-container',
          icon: 'cancel',
          text: '重複利用エラー（使用済み）',
        };
      case 'EXPIRED':
        return {
          cls: 'bg-secondary-fixed text-on-secondary-fixed',
          icon: 'schedule',
          text: '有効期限切れエラー',
        };
      case 'WRONG_STORE':
        return {
          cls: 'bg-surface-variant text-on-surface-variant',
          icon: 'store',
          text: '対象店舗違いエラー',
        };
      default:
        return {
          cls: 'bg-error-container text-on-error-container',
          icon: 'error',
          text: '該当クーポンなし',
        };
    }
  })();

  const checklistItems = [
    {
      idx: 0,
      badge: '見切りシール貼付確認',
      badgeCls: 'bg-secondary-container text-on-secondary-container',
      jan: '4901234567890',
      title: '① 国産牛肩ローススライス 250g',
      dept: '精肉コーナー / レスキュー対象品',
      orig: '¥680',
      price: '¥476',
      img: IMAGES.beefPos,
    },
    {
      idx: 1,
      badge: '規格外エコ品',
      badgeCls: 'bg-tertiary/10 text-tertiary',
      jan: '4909876543210',
      title: '② 北海道産たまねぎ 1個（規格外品）',
      dept: '青果コーナー / 特設レスキューワゴン',
      orig: '¥88',
      price: '¥50',
      img: IMAGES.onion,
    },
    {
      idx: 2,
      badge: '通常棚対象品',
      badgeCls: 'bg-surface-container-highest text-on-surface-variant',
      jan: '4905555123456',
      title: '③ 刻み紅生姜 1パック',
      dept: '調味料・漬物コーナー',
      orig: '',
      price: '¥98',
      img: IMAGES.ginger,
    },
  ];

  return (
    <div className="p-space-md lg:p-space-lg max-w-7xl mx-auto w-full flex flex-col gap-space-lg">
      {/* Top Status Banner & Operational Header (Exact Stitch S05) */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">クーポン利用確認</h1>
            <span className="font-label-badge bg-primary text-on-primary px-space-sm py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary animate-ping" />
              レジ・サービスカウンター専用
            </span>
            <span className="font-body-sm bg-surface-container text-on-surface-variant px-space-sm py-0.5 rounded font-label-numeric-md">
              端末: REG-02（東口レジ）
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant">
            お客様が提示されたスマートフォンのバーコードをスキャンするか、16桁のクーポンコードを手動入力してください。
          </p>
        </div>

        <div className="flex items-center gap-space-md shrink-0 bg-surface-container-low px-space-md py-space-sm rounded-xl">
          <div className="flex flex-col">
            <span className="font-label-caption text-on-surface-variant">現在対応店舗</span>
            <span className="font-body-md font-bold text-on-surface">{selectedStore.name}</span>
          </div>
          <div className="h-8 w-px bg-outline-variant" />
          <div className="flex flex-col">
            <span className="font-label-caption text-on-surface-variant">担当スタッフ</span>
            <span className="font-body-md font-bold text-on-surface">田中 健一 (1042)</span>
          </div>
        </div>
      </div>

      {/* Scanner / Search Panel */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-space-md">
        <div className="flex items-center justify-between flex-wrap gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[28px]">
              barcode_scanner
            </span>
            <span className="font-headline-md text-on-surface">バーコード読取 または コード入力</span>
          </div>
          <div className="flex items-center gap-space-xs bg-tertiary/10 text-tertiary px-space-sm py-1 rounded-full font-body-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
            <span>USB / Bluetooth スキャナー待機完了</span>
          </div>
        </div>

        <form
          onSubmit={handleLookup}
          className="flex flex-col md:flex-row items-stretch gap-space-sm"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined">qr_code</span>
            </div>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="クーポンコード入力 (例: FR-2025-0849-5510)"
              className="w-full pl-12 pr-space-md py-3.5 bg-surface-container-low text-on-surface rounded-xl font-label-numeric-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-container text-on-primary px-space-xl py-3.5 rounded-xl font-body-lg font-bold shadow-[0_4px_12px_rgba(0,105,72,0.25)] flex items-center justify-center gap-space-xs transition-transform active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined">search</span>
            <span>照会する</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface-variant px-space-md py-3.5 rounded-xl font-body-md transition-colors cursor-pointer"
          >
            クリア
          </button>
        </form>

        <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between text-on-surface-variant font-body-sm flex-wrap gap-2">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">sensors</span>
            <span>スキャナー照射で自動入力・自動照会されます (Enterキー送信対応)</span>
          </div>
          <span className="font-label-caption text-outline">
            POS端末モード: 連動照会プロトタイプ
          </span>
        </div>
      </div>

      {/* Main Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {redeemedTx ? (
            <div className="bg-tertiary-container text-on-tertiary-container rounded-xl p-space-lg shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md animate-fadeIn">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-full bg-on-tertiary-container/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-tertiary-container text-[28px]">
                    done_all
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md font-bold">クーポン適用を確定しました</span>
                  <span className="font-body-sm">
                    伝票番号: {redeemedTx.txNumber} / レジ値引き ¥{redeemedTx.discount} 反映完了
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="bg-surface-container-lowest text-on-surface px-space-md py-space-xs rounded-lg font-body-sm font-bold shadow-sm cursor-pointer"
              >
                次の対応へ
              </button>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col gap-space-md">
              {/* Card Header & Verification Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm">
                <div className="flex flex-col">
                  <span className="font-label-caption text-outline uppercase tracking-wider">
                    Coupon Verification
                  </span>
                  <h2 className="font-headline-lg text-on-surface">
                    {displayCoupon?.title || '絶品おうち牛丼 3品まとめ買いセット割'}
                  </h2>
                  <span className="font-body-sm text-on-surface-variant mt-0.5">
                    コード: <strong className="font-label-numeric-md">{lookedUpToken}</strong>（
                    {verification.message}）
                  </span>
                </div>
                <span
                  className={`${badgeStyle.cls} font-headline-md px-space-md py-1.5 rounded-xl flex items-center gap-1 shadow-sm self-start sm:self-center shrink-0`}
                >
                  <span className="material-symbols-outlined text-[20px]">{badgeStyle.icon}</span>
                  <span>{badgeStyle.text}</span>
                </span>
              </div>

              {/* Discount Amount Callout Banner */}
              <div className="bg-surface-container-high rounded-xl p-space-md flex items-center justify-between">
                <div className="flex items-center gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shadow-md">
                    <span className="material-symbols-outlined text-[28px]">payments</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-caption text-on-surface-variant font-bold">
                      レジ値引き適用内容
                    </span>
                    <span className="font-body-sm text-on-surface">合計会計小計より即時値引き</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-caption text-secondary font-bold">適用割引額</span>
                  <div className="font-headline-xl text-secondary flex items-baseline justify-end gap-0.5">
                    <span className="text-body-lg font-bold">¥</span>
                    <span className="font-label-numeric-lg text-3xl font-extrabold tracking-tight">
                      {displayCoupon?.discountAmountYen || 100}
                    </span>
                    <span className="font-body-md">引き</span>
                  </div>
                </div>
              </div>

              {/* Physical Product Verification Checklist */}
              <div className="flex flex-col gap-space-sm mt-space-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[22px]">
                      fact_check
                    </span>
                    <h3 className="font-headline-md text-on-surface">
                      【レジスタッフ目視確認】対象商品チェック
                    </h3>
                  </div>
                  <span className="font-label-caption text-secondary font-bold bg-secondary-fixed px-space-sm py-0.5 rounded">
                    必須: 3点すべてチェック
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant">
                  お客様の買物カゴに対象商品が3点揃っているかを確認し、チェックを入れてください。
                </p>

                <div className="flex flex-col gap-space-sm mt-space-xs">
                  {checklistItems.map((it) => (
                    <label
                      key={it.idx}
                      className="group relative flex items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors select-none"
                    >
                      <div className="flex items-center gap-space-md min-w-0">
                        <input
                          type="checkbox"
                          checked={checks[it.idx]}
                          disabled={!verification.ok}
                          onChange={(e) => {
                            const next: [boolean, boolean, boolean] = [...checks];
                            next[it.idx] = e.target.checked;
                            setChecks(next);
                          }}
                          className="w-6 h-6 rounded text-primary accent-primary shrink-0 cursor-pointer"
                        />
                        <div className="w-16 h-16 rounded-lg bg-surface-container shrink-0 overflow-hidden">
                          <img src={it.img} alt={it.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-space-xs flex-wrap">
                            <span
                              className={`font-label-badge px-1.5 py-0.5 rounded font-bold ${it.badgeCls}`}
                            >
                              {it.badge}
                            </span>
                            <span className="font-label-caption text-outline">JAN: {it.jan}</span>
                          </div>
                          <span className="font-body-lg font-bold text-on-surface truncate">
                            {it.title}
                          </span>
                          <span className="font-body-sm text-on-surface-variant">{it.dept}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-space-sm">
                        {it.orig && (
                          <span className="font-body-sm text-outline line-through">{it.orig}</span>
                        )}
                        <span className="font-headline-md text-on-surface block">{it.price}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Register Operator Instructions */}
              <div className="bg-primary/5 rounded-xl p-space-md flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
                  info
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-body-md font-bold text-primary">レジ操作手順</span>
                  <p className="font-body-sm text-on-surface">
                    3点すべてがカゴにあることを確認のうえ、POSレジの
                    <strong>「小計値引き（¥{displayCoupon?.discountAmountYen || 100}）」</strong>
                    キーを押してください。値引き反映後、下記ボタンを押してクーポンを使用済みに確定します。
                  </p>
                </div>
              </div>

              {/* Primary Commit Action Button */}
              <div className="pt-space-xs">
                <button
                  type="button"
                  disabled={!verification.ok || !allChecked}
                  onClick={handleCommitRedeem}
                  className="w-full bg-primary hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed text-on-primary py-4 px-space-lg rounded-xl font-headline-md shadow-[0_4px_16px_rgba(0,105,72,0.3)] flex items-center justify-center gap-space-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {!verification.ok ? 'block' : allChecked ? 'verified' : 'warning'}
                  </span>
                  <span>
                    {!verification.ok
                      ? verification.message
                      : allChecked
                        ? '適用を確定する（使用済みにする）'
                        : `未チェック商品があります (${missingNums})`}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-space-xs mt-space-xs text-on-surface-variant font-label-caption">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span>確定後は取り消しできません。確実に対象商品現物を確認してください。</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Exception State Simulator & POS Policy (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs text-on-surface">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                bug_report
              </span>
              <span className="font-headline-md">例外状態シミュレーション</span>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              レジスタッフ研修および例外パターン確認用。タップして状態を切り替えてテストできます。
            </p>
            <div className="flex flex-col gap-space-xs">
              <button
                type="button"
                onClick={() => simulatePreset('FR-2025-0849-5510')}
                className="w-full text-left p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                  <span className="font-body-md font-bold text-on-surface">
                    ① 正常: 有効・利用可能
                  </span>
                </div>
                <span className="font-label-caption text-outline">通常時</span>
              </button>
              <button
                type="button"
                onClick={() => simulatePreset('FR-2025-9999-0001')}
                className="w-full text-left p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-error" />
                  <span className="font-body-md font-bold text-on-surface">② 重複利用エラー</span>
                </div>
                <span className="font-label-caption text-error font-bold">使用済み</span>
              </button>
              <button
                type="button"
                onClick={() => simulatePreset('FR-2025-7721-1020')}
                className="w-full text-left p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <span className="font-body-md font-bold text-on-surface">
                    ③ 有効期限切れエラー
                  </span>
                </div>
                <span className="font-label-caption text-secondary font-bold">本日18:00終了</span>
              </button>
              <button
                type="button"
                onClick={() => simulatePreset('FR-2025-3301-4412')}
                className="w-full text-left p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline" />
                  <span className="font-body-md font-bold text-on-surface">④ 他店専用エラー</span>
                </div>
                <span className="font-label-caption text-outline">恵比寿店限定</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
              <span className="font-body-lg font-bold">スタンドアローン動作仕様</span>
            </div>
            <div className="flex flex-col gap-space-sm font-body-sm text-on-surface-variant">
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-tertiary shrink-0 mt-0.5">
                  check
                </span>
                <span>
                  <strong>予約・取り置き機能はありません:</strong>{' '}
                  お客様が店頭で自らカゴに入れた現物のみが割引対象です。
                </span>
              </div>
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-tertiary shrink-0 mt-0.5">
                  check
                </span>
                <span>
                  <strong>POSオフライン時:</strong>{' '}
                  クラウド通信が途絶えた場合でも本画面の目視チェック基準に基づき、レジキー手動割引の適用を継続してください。
                </span>
              </div>
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-tertiary shrink-0 mt-0.5">
                  check
                </span>
                <span>
                  <strong>バーコード破損時:</strong>{' '}
                  スマートフォンの画面輝度不足や割れがある場合は、画面上部の16桁コードを手入力してください。
                </span>
              </div>
            </div>
            <div className="p-space-sm bg-surface-container-lowest rounded-lg flex items-center justify-between">
              <span className="font-label-caption text-on-surface-variant">
                店舗管理システム同期待ち
              </span>
              <span className="font-label-numeric-md font-bold text-primary">0 件</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-outline">support_agent</span>
              <span className="font-body-sm text-on-surface font-bold">
                内線: サービスカウンター (204)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setCallHelpToast(true);
                setTimeout(() => setCallHelpToast(false), 2400);
              }}
              className="font-body-sm text-primary font-bold hover:underline cursor-pointer"
            >
              {callHelpToast ? '呼出中...' : '呼出'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
