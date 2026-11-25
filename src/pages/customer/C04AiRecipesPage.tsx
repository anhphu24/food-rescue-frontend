import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

type RecipeFilterTab = 'recommended' | 'quick' | 'saving' | 'healthy';

const STITCH_RECIPES = [
  {
    id: 'recipe-gyudon',
    title: '絶品おうち牛丼',
    desc: '甘辛い特製割り下が牛肉のコクを引き出します。短時間で味染み染み、家族も大満足の時短王道レシピ。',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATsXIwwo-pAMTGHj_Y_GQWW-X0waB60Herzlu6fmJh9Il74DrrOewDQVYVkmCo7skdnsRnZtwn4NAcaa-EQUAmY1Y8T3rwALzH14aEsIcWjCtWcKbKjIdVhBX42UxcQY9SwuvnuFbhWeusKgJ0kj5t5LWrEC8UgHy84RtVnahqDwUWYdKWJvNE7bTSurES4PujTs6A899mUyn-AqPNm4b-BI3JencDn_joiuLhxCo_',
    featured: true,
    topBadges: [
      { icon: 'local_fire_department', label: 'AIイチオシ', cls: 'bg-secondary text-on-secondary' },
      { icon: 'eco', label: '食品ロス削減 ★★★', cls: 'bg-primary text-on-primary' },
    ],
    discountLabel: '¥100',
    discountCompact: false,
    discountBoxCls: 'bg-secondary-container text-on-secondary-container',
    time: '15分',
    timeMinutes: 15,
    stars: '★☆☆',
    difficulty: 'かんたん',
    addCount: '2品',
    addItems: [
      { name: '玉ねぎ (青果売場)', price: '¥78' },
      { name: '紅生姜 (日配品)', price: '¥80' },
    ],
    servingsLabel: '2人前セット参考価格',
    origPrice: '¥804',
    finalPrice: '¥704',
    discountYen: 100,
    healthy: false,
  },
  {
    id: 'recipe-nikujaga',
    title: '定番！ほくほく肉じゃが',
    desc: '出汁の香りが染み渡る家庭の味。余った肩ロースのコクがじゃがいもに浸透して深みのある一品に仕上がります。',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXwk_hu71VSFGwKGTOi1wY8CtH9RFZd1sxdq9GvPeJFOyUm1ZioHg_xpv8whUD3ABASiD4WcAvTDGUOmBWma4NKWuBFNXvgCK5g9HrpjiflgEyfFvakKdbnHA1HQckCEMpAp8LooQXdTryJc_lVQRcl7oiCsuLLcuKhuFXKoZ5WzPPDQHmt7eDHDlOMTMWgCyspUt-O3iuDhyhji9kDfFYDwXlFoQ_IvWVgDAGYOBW',
    featured: false,
    topBadges: [
      {
        icon: 'eco',
        label: '削減度 ★★☆',
        cls: 'bg-surface-container-highest/90 backdrop-blur-sm text-on-surface',
        iconCls: 'text-primary',
      },
    ],
    discountLabel: '¥120引き',
    discountCompact: true,
    discountBoxCls: 'bg-secondary-fixed text-on-secondary-fixed',
    time: '25分',
    timeMinutes: 25,
    stars: '★★☆',
    difficulty: '普通',
    addCount: '3品',
    addItems: [{ name: 'じゃがいも' }, { name: 'にんじん' }, { name: '玉ねぎ' }],
    servingsLabel: '3人前セット参考価格',
    origPrice: '¥964',
    finalPrice: '¥844',
    discountYen: 120,
    healthy: true,
  },
  {
    id: 'recipe-sukiyaki',
    title: '贅沢すき焼き風煮込み',
    desc: '手軽なワンパン調理で本格すき焼きの味。焼き豆腐と白滝が牛肉の旨みをたっぷり吸い込みます。',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBffs5VOElLKYMB7w6lWC-dWVG8W7oWpdw3tTuA-vmFlmrvNpLuRzzcn7hUl_I2BrxpV8weP0RHXN5zDuBPqH1Bk61RjS4-zHGQ_NFScRwiSWVSkRSNZaWFG4izgs6zK_FpSCS-hzISoNwxuXK9m_aTGQrrXzS2OvBFcm9GT1USFop6Fi9aVLAnnLieoWl7Gi8ckakqnMzdpXubrzapUOuCgxW2eSG3oKN0phLT445A',
    featured: false,
    topBadges: [
      {
        icon: 'star',
        label: '週末人気',
        cls: 'bg-secondary-container text-on-secondary-container',
      },
    ],
    discountLabel: '¥150引き',
    discountCompact: true,
    discountBoxCls: 'bg-secondary-container text-on-secondary-container',
    time: '20分',
    timeMinutes: 20,
    stars: '★★☆',
    difficulty: '普通',
    addCount: '3品',
    addItems: [{ name: '焼き豆腐' }, { name: '白滝' }, { name: '長ネギ' }],
    servingsLabel: '2人前セット参考価格',
    origPrice: '¥980',
    finalPrice: '¥830',
    discountYen: 150,
    healthy: true,
  },
  {
    id: 'recipe-oyster',
    title: '牛肉とアスパラのオイスター炒め',
    desc: 'シャキシャキのアスパラと牛肉を強火でさっと炒めるだけ。中華風のコクでお弁当のおかずにも最適です。',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi3uxZABfKpxj2O6xdl8p_wD3MnNWWyXcIrgzFlMzev7u2wYQtUSSnkc_ZXG-SJ7rjnGS1jwxs51CAGu30mjop5Co5bRREkrJJfuGnwVA1lUJpw3Q5j74emnmV8IsKnvvhw6tMX-cHLDl18syhmqPQFSCXAhCGNB6qVGp29_B1h0yeSSSRXCcVo9MTZ1YO2CZEtt3Ru_yMANbmOxi_flSytugVHTxrv7HhrfNh2Lyh',
    featured: false,
    topBadges: [
      {
        icon: 'bolt',
        label: '10分最速',
        cls: 'bg-primary-container text-on-primary-container',
      },
    ],
    discountLabel: '¥80引き',
    discountCompact: true,
    discountBoxCls: 'bg-secondary-fixed text-on-secondary-fixed',
    time: '10分',
    timeMinutes: 10,
    stars: '★☆☆',
    difficulty: 'かんたん',
    addCount: '2品',
    addItems: [{ name: 'アスパラガス' }, { name: 'エリンギ' }],
    servingsLabel: '2人前セット参考価格',
    origPrice: '¥864',
    finalPrice: '¥784',
    discountYen: 80,
    healthy: true,
  },
];

export const C04AiRecipesPage: React.FC = () => {
  const { selectedStore, recipes, toggleSaveRecipe } = useApp();
  const savedRecipeIds = recipes.filter((r) => r.saved).map((r) => r.id);
  const [activeTab, setActiveTab] = useState<RecipeFilterTab>('recommended');
  const [refreshing, setRefreshing] = useState(false);

  const visibleRecipes = [...STITCH_RECIPES].sort((a, b) => {
    if (activeTab === 'quick') return a.timeMinutes - b.timeMinutes;
    if (activeTab === 'saving') return b.discountYen - a.discountYen;
    if (activeTab === 'healthy') return Number(b.healthy) - Number(a.healthy);
    return 0;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Active Ingredient Context Bar */}
      <aside
        aria-label="選択中食材"
        className="w-full bg-surface-container-high/70 backdrop-blur-md px-margin-mobile lg:px-margin py-3 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          <div className="flex items-center gap-space-sm min-w-0">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-on-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
              <span className="font-label-badge text-label-badge px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed uppercase tracking-wider shrink-0">
                起点食材
              </span>
              <p className="font-body-md text-body-md font-bold text-on-surface truncate">
                国産牛肩ローススライス 250g
              </p>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">
                  storefront
                </span>
                {selectedStore.name}
                <span className="text-outline-variant">/</span>
                <strong className="font-label-numeric-md text-label-numeric-md text-secondary">
                  ¥546
                </strong>
                <span className="font-label-caption text-label-caption px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-bold">
                  -35% 見切り品
                </span>
              </span>
            </div>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 font-body-sm text-body-sm font-medium text-primary hover:text-primary-container px-3 py-1 rounded-full bg-surface-container-lowest shadow-sm hover:shadow transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>食材を変更する</span>
          </Link>
        </div>
      </aside>

      {/* Main Hero Context & Question Module */}
      <section className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin pt-6 lg:pt-10 pb-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container p-6 lg:p-10 shadow-sm">
          <div className="pointer-events-none absolute -right-20 -top-24 w-80 h-80 rounded-full bg-tertiary-fixed/30 blur-3xl" />
          <div className="pointer-events-none absolute right-1/4 -bottom-20 w-64 h-64 rounded-full bg-secondary-fixed/40 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-badge text-label-badge mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[16px] animate-pulse">
                auto_awesome
              </span>
              <span>FOOD RESCUE AI CHEF ENGINE v2.4</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-3">
              この牛肉で、今日何を作りますか？
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              AIがおすすめする4つの料理です。選んだ料理に合わせて、店内で買い足すべき食材を自動提案します。店頭の割引シール商品と組み合わせれば、今夜の食費も賢く削減できます。
            </p>

            {/* Metric highlights pill row */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-container-lowest/90 px-3.5 py-1.5 rounded-xl shadow-xs">
                <span className="material-symbols-outlined text-primary text-[20px] icon-filled">
                  eco
                </span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">
                  削減推定CO₂:{' '}
                  <strong className="font-label-numeric-md text-label-numeric-md text-primary">
                    820g
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-lowest/90 px-3.5 py-1.5 rounded-xl shadow-xs">
                <span className="material-symbols-outlined text-secondary text-[20px] icon-filled">
                  confirmation_number
                </span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">
                  対象セット割:{' '}
                  <strong className="font-label-numeric-md text-label-numeric-md text-secondary">
                    最大¥150引き
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-lowest/90 px-3.5 py-1.5 rounded-xl shadow-xs">
                <span className="material-symbols-outlined text-tertiary text-[20px]">shelves</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">
                  売場連動:{' '}
                  <span className="text-on-surface-variant">青果・日配コーナーの在庫反映中</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Preset Switcher Row */}
      <section className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-low p-2 rounded-2xl">
          <div
            aria-label="レシピフィルター"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1"
            role="tablist"
          >
            {[
              { id: 'recommended' as const, icon: 'psychology', label: 'AIおすすめ', iconCls: '' },
              {
                id: 'quick' as const,
                icon: 'timer',
                label: '時短レシピ (15分以内)',
                iconCls: 'text-outline',
              },
              {
                id: 'saving' as const,
                icon: 'savings',
                label: '節約・高割引レシピ',
                iconCls: 'text-secondary',
              },
              {
                id: 'healthy' as const,
                icon: 'nutrition',
                label: 'ヘルシー野菜たっぷり',
                iconCls: 'text-tertiary',
              },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-body-sm text-body-sm whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-medium hover:bg-surface-variant'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isSelected ? '' : tab.iconCls
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end px-1">
            <button
              type="button"
              onClick={handleRefresh}
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-variant text-on-surface transition-all text-left cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-[18px] text-primary transition-transform duration-500 ${
                  refreshing ? 'animate-spin' : 'group-hover:rotate-180'
                }`}
              >
                autorenew
              </span>
              <span className="font-body-sm text-body-sm font-medium">AIに再提案してもらう</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Recipe Suggestions Bento Grid */}
      <section className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {visibleRecipes.map((rec) => {
            const isSaved = savedRecipeIds.includes(rec.id);
            return (
              <article
                key={rec.id}
                className={`flex flex-col rounded-2xl bg-surface-container-lowest ${
                  rec.featured ? 'shadow-md hover:shadow-xl' : 'shadow-sm hover:shadow-md'
                } overflow-hidden relative group transition-all duration-300`}
              >
                <div className="relative w-full h-52 overflow-hidden bg-surface-container">
                  <img
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={rec.img}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {rec.topBadges.map((b, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-badge text-label-badge shadow-sm ${b.cls}`}
                      >
                        <span
                          className={`material-symbols-outlined text-[14px] ${'iconCls' in b && b.iconCls ? b.iconCls : ''}`}
                        >
                          {b.icon}
                        </span>
                        <span>{b.label}</span>
                      </span>
                    ))}
                  </div>

                  {rec.discountCompact ? (
                    <div
                      className={`absolute bottom-3 right-3 ${rec.discountBoxCls} font-headline-md text-headline-md px-2.5 py-0.5 rounded-lg shadow-sm flex items-baseline gap-1`}
                    >
                      <span className="font-label-caption text-label-caption font-bold">
                        セット割
                      </span>
                      <span className="font-label-numeric-md text-label-numeric-md">
                        {rec.discountLabel}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`absolute bottom-3 right-3 ${rec.discountBoxCls} font-headline-md text-headline-md px-3 py-1 rounded-xl shadow-md flex items-baseline gap-1`}
                    >
                      <span className="font-label-caption text-label-caption uppercase tracking-wider font-bold">
                        セット割
                      </span>
                      <span className="font-label-numeric-lg text-label-numeric-lg">
                        {rec.discountLabel}
                      </span>
                      <span className="font-body-sm text-body-sm">引き</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-inverse-surface/70 backdrop-blur-sm text-inverse-on-surface font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[15px] text-tertiary-fixed">
                        schedule
                      </span>
                      <span>{rec.time}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-inverse-surface/70 backdrop-blur-sm text-inverse-on-surface font-body-sm text-body-sm">
                      <span className="text-tertiary-fixed">{rec.stars}</span>
                      <span>{rec.difficulty}</span>
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        {rec.title}
                      </h2>
                      <button
                        type="button"
                        onClick={() => toggleSaveRecipe(rec.id)}
                        className={`material-symbols-outlined cursor-pointer transition-colors ${
                          isSaved
                            ? 'text-secondary icon-filled'
                            : 'text-outline-variant hover:text-secondary'
                        }`}
                        title="お気に入りに保存"
                        aria-label={`${rec.title}をお気に入りに保存`}
                      >
                        bookmark
                      </button>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-4">
                      {rec.desc}
                    </p>

                    <div className="bg-surface-container-low rounded-xl p-3 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="font-body-sm font-medium text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary text-[17px]">
                            add_shopping_cart
                          </span>
                          店内で買い足す食材
                        </span>
                        <span
                          className={`font-label-badge text-label-badge px-2 py-0.5 rounded-full font-bold ${
                            rec.featured
                              ? 'bg-primary-container text-on-primary-container'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {rec.addCount}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.addItems.map((it, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm"
                          >
                            <span>{it.name}</span>
                            {'price' in it && it.price ? (
                              <span className="font-label-caption text-label-caption text-secondary font-bold">
                                {it.price}
                              </span>
                            ) : null}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-1 pb-3">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {rec.servingsLabel}
                      </span>
                      <div className="text-right">
                        <span className="line-through font-body-sm text-body-sm text-outline-variant mr-1.5">
                          {rec.origPrice}
                        </span>
                        <span className="font-label-numeric-lg text-label-numeric-lg text-secondary">
                          {rec.finalPrice}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface">(税込)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/recipe-set/${rec.id === 'recipe-gyudon' ? 'recipe-gyudon' : 'recipe-gyudon'}`}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-body-md text-body-md font-bold transition-all ${
                        rec.featured
                          ? 'bg-primary hover:bg-primary-container text-on-primary shadow-md hover:shadow-lg group-hover:translate-y-[-1px]'
                          : 'bg-surface-container-highest hover:bg-surface-variant text-on-surface'
                      }`}
                    >
                      <span>この料理の食材セットを見る</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it Works / In-Store Guide Notice Callout */}
      <section className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin pt-4 pb-8">
        <div className="bg-surface-container-low rounded-2xl p-5 lg:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">checklist</span>
            </div>
            <div>
              <h3 className="font-body-lg text-body-lg font-bold text-on-surface">
                店内での買い回りとクーポンの使い方
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                料理を選択すると、店内で追加購入をおすすめする食材リストと、店頭レジで使えるセット割引クーポンの条件が表示されます。売り場の在庫を確認しながらカゴに入れ、お会計時にバーコードを提示してください。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-body-sm text-body-sm font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">help_outline</span>
              <span>お買い物ルールを確認</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
