import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { IMAGES } from '../../data/seedData';
import type { ProductCategory, ProductMaster } from '../../types';
import {
  calculateTaxInclusivePrice,
  findMasterByJan,
  validateJanCode,
} from '../../utils/foodRescueLogic';

type ScanState = 'waiting' | 'duplicate' | 'success_new' | 'error';

const CATEGORY_MAP: Record<ProductMaster['categoryCode'], ProductCategory> = {
  meat: '精肉',
  fish: '鮮魚',
  produce: '青果',
  deli: '惣菜・弁当',
  processed: '日配・乳製品',
  condiment: '調味料・加工品',
};

export const S02BProductRegisterPage: React.FC = () => {
  const { selectedStore, productMasters, addProductMaster } = useApp();
  const navigate = useNavigate();

  const [inputMode, setInputMode] = useState<'scan' | 'manual'>('scan');
  const [torchActive, setTorchActive] = useState(false);
  const [scannerPaused, setScannerPaused] = useState(false);
  const [scanState, setScanState] = useState<ScanState>('waiting');

  const [janCode, setJanCode] = useState('4902345678999');
  const [productName, setProductName] = useState('国産豚ロースうす切り (しゃぶしゃぶ用)');
  const [spec, setSpec] = useState('220g');
  const [origin, setOrigin] = useState('千葉県産');
  const [categoryCode, setCategoryCode] = useState<ProductMaster['categoryCode']>('meat');
  const [priceExclTax, setPriceExclTax] = useState('398');
  const [aiRole, setAiRole] = useState<ProductMaster['aiRole']>('main');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const duplicateMaster = useMemo(
    () => findMasterByJan(productMasters, janCode),
    [productMasters, janCode]
  );

  const janValidation = useMemo(() => validateJanCode(janCode), [janCode]);
  const priceInclTax = useMemo(
    () => calculateTaxInclusivePrice(Number(priceExclTax) || 0, 8),
    [priceExclTax]
  );

  const simulateScan = (state: ScanState) => {
    setScanState(state);
    if (state === 'duplicate') {
      setJanCode('4901234567890');
    } else if (state === 'success_new') {
      setJanCode('4902345678999');
    }
  };

  const handleConfirmRegister = () => {
    const newMaster: ProductMaster = {
      id: `prod-${Date.now()}`,
      janCode: janCode.trim() || '4902345678999',
      name: productName.trim() || '国産豚ロースうす切り (しゃぶしゃぶ用)',
      spec: spec.trim() || '220g',
      origin: origin.trim() || '国産',
      category: CATEGORY_MAP[categoryCode],
      categoryCode,
      standardPriceExclTax: Number(priceExclTax) || 398,
      standardPriceInclTax: priceInclTax,
      taxRate: 8,
      aiRole,
      imageUrl: IMAGES.beefMaster,
      activeLotCount: 0,
      status: 'active',
    };
    addProductMaster(newMaster);
    setConfirmModalOpen(false);
    navigate(`/store/lots?jan=${encodeURIComponent(newMaster.janCode)}`);
  };

  return (
    <div className="w-full p-space-md lg:p-space-lg flex flex-col gap-space-lg max-w-7xl mx-auto">
      {/* Top Breadcrumb & Mode Switcher */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-1.5 font-label-caption text-on-surface-variant mb-1">
            <Link to="/store/products" className="hover:text-primary font-bold">
              S02 商品マスター一覧
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">S02-B JANスキャン・新規登録</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            商品新規登録（JANスキャン / 手入力）
          </h1>
          <p className="font-body-sm text-on-surface-variant mt-0.5">
            バーコードをスキャンしてチェーン共通マスターを即時照合。未登録商品のみ新規作成し、そのまま S03 ロット設定へ進みます。
          </p>
        </div>

        <div className="inline-flex bg-surface-container-low p-1 rounded-xl self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setInputMode('scan')}
            className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-body-sm font-bold transition-all cursor-pointer ${
              inputMode === 'scan'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
            <span>JANスキャン優先</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-body-sm font-bold transition-all cursor-pointer ${
              inputMode === 'manual'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>手動フォーム入力</span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left 5 cols: Camera Scanner & Edge-Case Simulator */}
        <section
          className={`lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md transition-opacity ${
            inputMode === 'manual' ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">
                photo_camera
              </span>
              <h2 className="font-headline-md text-on-surface">JAN / EAN バーコード読取</h2>
            </div>
            <span className="font-label-badge bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              GS1準拠
            </span>
          </div>

          {/* Camera Preview Box */}
          <div className="relative h-56 rounded-2xl bg-inverse-surface overflow-hidden flex items-center justify-center p-space-md">
            <div className="w-64 h-28 border-2 border-primary-fixed/80 rounded-xl relative flex items-center justify-center">
              {!scannerPaused && (
                <div className="absolute left-2 right-2 h-0.5 bg-secondary-container shadow-[0_0_10px_#fd761a] animate-scan-laser" />
              )}
              <span className="font-label-caption text-inverse-on-surface/80 bg-on-surface/60 px-2.5 py-1 rounded">
                {scannerPaused
                  ? 'スキャン一時停止中'
                  : 'バーコードを枠内に合わせてください'}
              </span>
            </div>

            {torchActive && (
              <div className="absolute inset-0 bg-white/10 pointer-events-none" />
            )}
          </div>

          {/* Camera Control Buttons */}
          <div className="grid grid-cols-2 gap-space-sm">
            <button
              type="button"
              onClick={() => setTorchActive((v) => !v)}
              className={`py-2 px-space-sm rounded-xl font-body-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                torchActive
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {torchActive ? 'flash_off' : 'flash_on'}
              </span>
              <span>{torchActive ? 'ライト消灯' : 'ライト点灯'}</span>
            </button>
            <button
              type="button"
              onClick={() => setScannerPaused((v) => !v)}
              className="py-2 px-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {scannerPaused ? 'play_arrow' : 'pause'}
              </span>
              <span>{scannerPaused ? 'スキャン再開' : '一時停止'}</span>
            </button>
          </div>

          {/* Scan State Simulation Buttons (Exact Stitch S02-B States) */}
          <div className="bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-2">
            <span className="font-label-caption font-bold text-on-surface-variant">
              スキャン状態テスト（プロトタイプ動作切替）
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => simulateScan('waiting')}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container font-label-caption font-bold text-on-surface cursor-pointer"
              >
                ① スキャン待機
              </button>
              <button
                type="button"
                onClick={() => simulateScan('duplicate')}
                className="px-2.5 py-1.5 rounded-lg bg-secondary-fixed hover:bg-secondary-fixed-dim font-label-caption font-bold text-on-secondary-fixed cursor-pointer"
              >
                ② 既存JAN重複検知
              </button>
              <button
                type="button"
                onClick={() => simulateScan('success_new')}
                className="px-2.5 py-1.5 rounded-lg bg-primary-fixed hover:bg-primary-fixed-dim font-label-caption font-bold text-on-primary-fixed cursor-pointer"
              >
                ③ 新規JAN読取成功
              </button>
              <button
                type="button"
                onClick={() => simulateScan('error')}
                className="px-2.5 py-1.5 rounded-lg bg-error-container font-label-caption font-bold text-on-error-container cursor-pointer"
              >
                ④ 読取エラー
              </button>
            </div>
          </div>

          {/* Dynamic Feedback Panels */}
          {scanState === 'waiting' && !duplicateMaster && (
            <div className="p-space-sm rounded-xl bg-surface-container text-on-surface-variant font-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">sensors</span>
              <span>スキャナー待機中：商品パッケージのJANコードを読み取ってください</span>
            </div>
          )}

          {(scanState === 'duplicate' || duplicateMaster) && (
            <div className="p-space-md rounded-xl bg-secondary-fixed/60 border border-secondary/30 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-on-secondary-fixed font-body-sm font-bold">
                <span className="material-symbols-outlined text-secondary">warning</span>
                <span>既存のチェーン商品マスターを検出しました！</span>
              </div>
              <p className="font-label-caption text-on-secondary-container">
                JAN: <strong>{duplicateMaster?.janCode || '4901234567890'}</strong>（
                {duplicateMaster?.name || '国産牛肩ローススライス'}
                ）は既に登録済みです。重複作成は不要です。
              </p>
              <Link
                to={`/store/lots?jan=${encodeURIComponent(
                  duplicateMaster?.janCode || '4901234567890'
                )}`}
                className="w-full py-2 rounded-lg bg-secondary text-on-secondary font-body-sm font-bold text-center hover:bg-on-secondary-fixed-variant transition-colors"
              >
                既存マスターを利用して S03 ロット登録へ進む →
              </Link>
            </div>
          )}

          {scanState === 'success_new' && !duplicateMaster && (
            <div className="p-space-sm rounded-xl bg-tertiary-fixed/50 text-on-tertiary-fixed font-body-sm flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-tertiary">check_circle</span>
              <span>未登録JANを認識しました。右フォームで詳細を確認して登録してください。</span>
            </div>
          )}

          {scanState === 'error' && (
            <div className="p-space-sm rounded-xl bg-error-container text-on-error-container font-body-sm flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-error">error</span>
              <span>バーコードを読み取れませんでした。ライト点灯または手入力をご利用ください。</span>
            </div>
          )}
        </section>

        {/* Right 7 cols: Product Master Registration Form */}
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
            <h2 className="font-headline-md text-on-surface">恒久商品マスター情報入力</h2>
            <span className="font-label-caption text-on-surface-variant">
              対象店舗: <strong>{selectedStore.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-badge text-on-surface font-bold">
                JANコード (13桁 / 8桁) <span className="text-error">*必須</span>
              </label>
              <input
                type="text"
                value={janCode}
                onChange={(e) => setJanCode(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl font-label-numeric-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span
                className={`font-label-caption ${
                  janValidation.valid ? 'text-primary font-bold' : 'text-on-surface-variant'
                }`}
              >
                {janValidation.valid
                  ? `✓ ${janValidation.format} 形式確認済`
                  : janValidation.reason || '数字8桁または13桁'}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-badge text-on-surface font-bold">
                商品カテゴリー <span className="text-error">*必須</span>
              </label>
              <select
                value={categoryCode}
                onChange={(e) => setCategoryCode(e.target.value as ProductMaster['categoryCode'])}
                className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="meat">精肉 (チルド)</option>
                <option value="fish">鮮魚 (チルド)</option>
                <option value="produce">青果 (野菜・果物)</option>
                <option value="deli">惣菜・弁当・ベーカリー</option>
                <option value="processed">日配・乳製品</option>
                <option value="condiment">調味料・加工品</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-badge text-on-surface font-bold">
              商品正式名称 <span className="text-error">*必須</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-badge text-on-surface font-bold">規格・内容量</label>
              <input
                type="text"
                value={spec}
                onChange={(e) => setSpec(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-badge text-on-surface font-bold">産地 / 製造元</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2.5 rounded-xl font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Price + 8% Tax Auto Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md bg-surface-container-low p-space-md rounded-xl">
            <div className="flex flex-col gap-1">
              <label className="font-label-badge text-on-surface font-bold">
                標準税抜価格 (本体価格)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-outline">
                  ¥
                </span>
                <input
                  type="number"
                  value={priceExclTax}
                  onChange={(e) => setPriceExclTax(e.target.value)}
                  className="w-full bg-surface-container-lowest pl-8 pr-3 py-2 rounded-lg font-label-numeric-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-label-caption text-on-surface-variant">
                自動計算 税込参考価格（軽減税率 8%）
              </span>
              <span className="font-headline-lg font-label-numeric-lg text-primary">
                ¥{priceInclTax.toLocaleString()}
              </span>
            </div>
          </div>

          {/* AI Role Radio Buttons */}
          <div className="flex flex-col gap-2">
            <label className="font-label-badge text-on-surface font-bold">
              AIレシピ自動提案用ロール
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { v: 'main', label: '主食材 (メイン素材)' },
                  { v: 'sub', label: '買い足し推奨食材' },
                  { v: 'seasoning', label: '調味料・付け合わせ' },
                ] as const
              ).map((r) => (
                <label
                  key={r.v}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low cursor-pointer font-body-sm"
                >
                  <input
                    type="radio"
                    name="s02b_ai_role"
                    checked={aiRole === r.v}
                    onChange={() => setAiRole(r.v)}
                    className="accent-primary"
                  />
                  <span className={aiRole === r.v ? 'font-bold text-primary' : ''}>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Footer (Exact Stitch S02-B Footer) */}
          <div className="pt-space-md border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            <div className="flex items-center gap-1.5 font-label-caption text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">cloud_done</span>
              <span>登録内容はチェーン商品データベースに即時同期されます</span>
            </div>
            <div className="flex items-center gap-space-sm w-full sm:w-auto">
              <Link
                to="/store/products"
                className="w-1/2 sm:w-auto px-space-md py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-bold text-center transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                className="w-1/2 sm:w-auto flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span>商品マスターを登録してロット設定へ進む</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modal (Exact Stitch S02-B Confirm Modal) */}
      {confirmModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-space-md"
          onClick={() => setConfirmModalOpen(false)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-md rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-space-xs text-primary font-bold">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  check_circle
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-on-surface">商品マスター登録完了</h3>
                <span className="font-label-caption text-on-surface-variant">
                  チェーン共通データベースに即時反映
                </span>
              </div>
            </div>

            <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col gap-1">
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">商品名:</span>
                <span className="font-bold text-on-surface">{productName}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">JANコード:</span>
                <span className="font-label-numeric-md text-on-surface">{janCode}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">標準価格 (税込):</span>
                <span className="font-bold text-primary">
                  ¥{priceInclTax.toLocaleString()} (税抜 ¥{Number(priceExclTax || 0).toLocaleString()})
                </span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">対象店舗:</span>
                <span className="text-on-surface">{selectedStore.name}</span>
              </div>
            </div>

            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              恒久マスターが作成されました。このまま直ちに本店舗での消費期限・割引率・実在庫数の設定画面へ直行します。
            </p>

            <div className="flex flex-col gap-space-xs pt-space-xs">
              <button
                type="button"
                onClick={handleConfirmRegister}
                className="w-full py-space-sm px-space-md bg-primary hover:bg-primary-container text-on-primary font-body-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-space-xs transition-all cursor-pointer"
              >
                <span>マスター登録完了 ➔ S03 ロット・在庫管理へ直行</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="w-full py-space-xs px-space-md bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm rounded-xl transition-colors cursor-pointer"
              >
                入力内容を再確認・編集
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
