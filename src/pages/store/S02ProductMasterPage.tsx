import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { IMAGES } from '../../data/seedData';
import type { ProductCategory, ProductMaster } from '../../types';
import { calculateTaxInclusivePrice } from '../../utils/foodRescueLogic';

const CATEGORY_MAP: Record<ProductMaster['categoryCode'], ProductCategory> = {
  meat: '精肉',
  fish: '鮮魚',
  produce: '青果',
  deli: '惣菜・弁当',
  processed: '日配・乳製品',
  condiment: '調味料・加工品',
};

export const S02ProductMasterPage: React.FC = () => {
  const { productMasters, addProductMaster } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('すべて');
  const [modalOpen, setModalOpen] = useState(false);

  // Slide-over quick create form state
  const [janCode, setJanCode] = useState('');
  const [categoryCode, setCategoryCode] = useState<ProductMaster['categoryCode']>('meat');
  const [name, setName] = useState('');
  const [spec, setSpec] = useState('');
  const [origin, setOrigin] = useState('');
  const [priceExcl, setPriceExcl] = useState('780');
  const [taxRate, setTaxRate] = useState<8 | 10>(8);
  const [aiRole, setAiRole] = useState<ProductMaster['aiRole']>('main');
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const filteredMasters = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productMasters.filter((m) => {
      if (catFilter !== 'すべて' && m.category !== catFilter) return false;
      if (!q) return true;
      return `${m.name} ${m.janCode} ${m.origin} ${m.category}`.toLowerCase().includes(q);
    });
  }, [productMasters, search, catFilter]);

  const handleSaveMaster = () => {
    if (!janCode.trim() || !name.trim()) return;
    const excl = Number(priceExcl) || 0;
    const newMaster: ProductMaster = {
      id: `prod-${Date.now()}`,
      janCode: janCode.trim(),
      name: name.trim(),
      spec: spec.trim() || '1パック',
      origin: origin.trim() || '国産',
      category: CATEGORY_MAP[categoryCode],
      categoryCode,
      standardPriceExclTax: excl,
      standardPriceInclTax: calculateTaxInclusivePrice(excl, taxRate),
      taxRate,
      aiRole,
      imageUrl: IMAGES.beefMaster,
      description: notes.trim(),
      activeLotCount: 0,
      status: 'active',
    };
    addProductMaster(newMaster);
    setModalOpen(false);
    setJanCode('');
    setName('');
    setSpec('');
    setOrigin('');
    setNotes('');
    setToast(`商品マスター「${newMaster.name}」を登録しました`);
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <div className="w-full p-space-md lg:p-space-lg flex flex-col gap-space-lg">
      {/* Top Action Header */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              商品マスター管理（チェーン共通カタログ）
            </h1>
            <span className="font-label-badge bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              全 {productMasters.length} SKU 登録済
            </span>
          </div>
          <p className="font-body-sm text-on-surface-variant mt-1">
            恒久的な商品基本情報（JANコード・標準価格・AI献立ロール）を管理します。賞味期限や見切り割引率はS03ロット管理で設定します。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm shrink-0">
          <Link
            to="/store/products/new"
            className="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-sm font-bold shadow-md transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
            <span>JANスキャン / 新規登録 (S02-B)</span>
          </Link>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">add</span>
            <span>クイック追加</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="bg-tertiary-container text-on-tertiary-container px-space-md py-space-sm rounded-xl shadow-md flex items-center gap-2 font-body-sm font-bold animate-fadeIn">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Search & Category Filter Strip */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['すべて', '精肉', '鮮魚', '青果', '惣菜・弁当', 'ベーカリー', '日配・乳製品', '調味料・加工品'].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCatFilter(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-lg font-body-sm font-bold transition-colors cursor-pointer ${
                  catFilter === cat
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        <div className="relative min-w-[260px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="JANコード・商品名・産地で検索..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container-low text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
        </div>
      </div>

      {/* Product Master Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm">
            <thead className="bg-surface-container text-on-surface-variant font-label-badge uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">商品マスター / JANコード</th>
                <th className="py-3.5 px-4">カテゴリー</th>
                <th className="py-3.5 px-4">規格・産地</th>
                <th className="py-3.5 px-4">標準価格 (税込 / 税抜)</th>
                <th className="py-3.5 px-4">AI献立ロール</th>
                <th className="py-3.5 px-4 text-center">稼働ロット</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredMasters.map((m) => (
                <tr key={m.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3.5 px-4 min-w-[240px]">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.imageUrl}
                        alt={m.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-on-surface truncate">{m.name}</div>
                        <div className="font-label-numeric-md text-[11px] text-outline">
                          JAN: {m.janCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-surface-container text-on-surface-variant font-label-badge px-2 py-0.5 rounded-full">
                      {m.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">
                    <div className="font-medium text-on-surface">{m.spec}</div>
                    <div className="font-label-caption text-outline">{m.origin}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-label-numeric-md font-bold text-on-surface">
                      ¥{m.standardPriceInclTax.toLocaleString()}
                    </div>
                    <div className="font-label-caption text-outline">
                      税抜 ¥{m.standardPriceExclTax.toLocaleString()} ({m.taxRate}%)
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-label-caption font-bold ${
                        m.aiRole === 'main'
                          ? 'bg-primary/10 text-primary'
                          : m.aiRole === 'sub'
                            ? 'bg-tertiary-fixed/50 text-on-tertiary-fixed'
                            : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">psychology</span>
                      {m.aiRole === 'main'
                        ? '主食材 (メイン)'
                        : m.aiRole === 'sub'
                          ? '買い足し推奨'
                          : '調味料・付け合わせ'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-label-numeric-md font-bold text-primary">
                      {m.activeLotCount}
                    </span>
                    <span className="text-[11px] text-on-surface-variant ml-0.5">件</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to={`/store/lots?jan=${encodeURIComponent(m.janCode)}`}
                        className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary hover:text-on-primary text-primary font-bold text-[12px] transition-colors"
                      >
                        ロット追加
                      </Link>
                      <button
                        type="button"
                        title="詳細"
                        className="p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Create Modal (Exact Stitch S02 Modal Structure) */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-on-background/40 backdrop-blur-xs flex justify-end"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-xl h-full bg-surface-container-lowest shadow-2xl flex flex-col justify-between overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-space-lg bg-surface-container-low flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  inventory_2
                </span>
                <div>
                  <h2 className="font-headline-md text-on-surface">新規商品マスター登録</h2>
                  <p className="font-label-caption text-on-surface-variant">
                    チェーン共通SKUカタログへ登録
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-outline hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-space-lg overflow-y-auto flex-1 flex flex-col gap-space-md">
              <div className="bg-surface-container-low p-space-sm rounded-xl text-on-surface-variant font-body-sm flex gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                  help_outline
                </span>
                <span>
                  ここでは恒久的な商品の属性のみを設定します。賞味期限や値引きシール率などの日次・時間帯変動要素はロット登録画面で付与されます。
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-badge text-on-surface font-bold">
                    JANコード (13桁 / 8桁) <span className="text-error">*必須</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={janCode}
                      onChange={(e) => setJanCode(e.target.value)}
                      placeholder="例: 4901234567890"
                      className="w-full bg-surface-container-low px-space-sm py-2 rounded-xl font-label-numeric-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container"
                    />
                    <button
                      type="button"
                      onClick={() => setJanCode('4902345678999')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-primary font-label-caption font-bold px-2 py-1 rounded bg-surface-container cursor-pointer"
                    >
                      POS読込
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-badge text-on-surface font-bold">
                    商品カテゴリー <span className="text-error">*必須</span>
                  </label>
                  <select
                    value={categoryCode}
                    onChange={(e) =>
                      setCategoryCode(e.target.value as ProductMaster['categoryCode'])
                    }
                    className="w-full bg-surface-container-low px-space-sm py-2 rounded-xl font-body-md text-on-surface focus:outline-none focus:bg-surface-container"
                  >
                    <option value="meat">精肉 (チルド)</option>
                    <option value="fish">鮮魚 (チルド)</option>
                    <option value="produce">青果 (野菜・果物)</option>
                    <option value="deli">日配・惣菜</option>
                    <option value="processed">加工食品</option>
                    <option value="condiment">調味料・スパイス</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-badge text-on-surface font-bold">
                  商品正式名称 <span className="text-error">*必須</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 国産牛肩ローススライス"
                  className="w-full bg-surface-container-low px-space-sm py-2 rounded-xl font-body-md text-on-surface focus:outline-none focus:bg-surface-container"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-badge text-on-surface font-bold">規格・容量</label>
                  <input
                    type="text"
                    value={spec}
                    onChange={(e) => setSpec(e.target.value)}
                    placeholder="例: 250g, 1パック, 1個"
                    className="w-full bg-surface-container-low px-space-sm py-2 rounded-xl font-body-md text-on-surface focus:outline-none focus:bg-surface-container"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-badge text-on-surface font-bold">
                    産地 / 製造元
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="例: 熊本県産, 自社製造"
                    className="w-full bg-surface-container-low px-space-sm py-2 rounded-xl font-body-md text-on-surface focus:outline-none focus:bg-surface-container"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-badge text-on-surface font-bold">
                    標準税抜価格 (本体価格) <span className="text-error">*必須</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">
                      ¥
                    </span>
                    <input
                      type="number"
                      value={priceExcl}
                      onChange={(e) => setPriceExcl(e.target.value)}
                      className="w-full bg-surface-container-low pl-8 pr-space-sm py-2 rounded-xl font-label-numeric-md text-on-surface focus:outline-none focus:bg-surface-container"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-badge text-on-surface font-bold">税率区分</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) as 8 | 10)}
                    className="w-full bg-surface-container-low px-space-sm py-2 rounded-xl font-body-md text-on-surface focus:outline-none focus:bg-surface-container"
                  >
                    <option value={8}>軽減税率 8% (食品)</option>
                    <option value={10}>標準税率 10% (雑貨・酒類等)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-space-xs">
                <label className="font-label-badge text-on-surface font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[16px]">
                    psychology
                  </span>
                  AIレシピ自動提案用タグ
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: 'main', label: '主食材 (メイン素材)' },
                      { value: 'sub', label: '買い足し推奨食材 (野菜・具材)' },
                      { value: 'seasoning', label: '調味料・付け合わせ' },
                    ] as const
                  ).map((role) => (
                    <label
                      key={role.value}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer font-body-sm transition-colors"
                    >
                      <input
                        type="radio"
                        name="ai_role"
                        value={role.value}
                        checked={aiRole === role.value}
                        onChange={() => setAiRole(role.value)}
                        className="accent-primary"
                      />
                      <span className={aiRole === role.value ? 'font-bold' : ''}>{role.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-badge text-on-surface font-bold">
                  商品補足メモ / アレルゲン等
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="原材料や売り場担当者向けの特記事項を入力..."
                  className="w-full bg-surface-container-low px-space-sm py-2 rounded-xl font-body-md text-on-surface focus:outline-none focus:bg-surface-container"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-space-lg bg-surface-container-low flex items-center justify-end gap-space-sm shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-space-md py-space-sm rounded-xl font-body-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveMaster}
                className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-lg py-space-sm rounded-xl font-body-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>商品マスターに保存</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
