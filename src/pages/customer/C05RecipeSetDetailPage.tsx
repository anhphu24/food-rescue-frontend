import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BarcodeSvg } from '../../components/BarcodeSvg';

const C05_IMAGES = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC44rAVBwqONEn88TX_y8yb6QIqLdMNXhL8FloSaeXz2CXsLK6ai--lBZHJJARnqdqfDYGGnNA2TrfKeLWDvz8uXtA_YocqYD4O8VjclHhc4kVJ_IlDa-GJPgbjT_r8nH6MIvWA81pJ_90RWcJ-YZGLpPIfJP_mAbNDx105iAGA_gm8n2hQu8ezqZ3BLsBfe1dnkzbZU1jMUvd5M0DZvajfApSJ5dW_IXwLLuSWzeFP',
  beef: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByv2RgbLZv2hxny4PZ3GFxLG446rZNDaiVDnKidjookg1CvwI13YUJoqxt_24A9KIJedzPff_xFaXTLue34qestm7BbcPHMDnHmsXFsVjuKSgVTZbb-IzwA4tzXIjwft-ak0weKMKLpve1g_rNtaDvu0yL98aMjkmdzBukU4b2xF0uzjHWmd0SiHvVOnwhi5AzfRbt66ihlDkDvPv8yXQIAgE7fGMM5kiptcdOwq-t',
  onion:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuArr1BaPWTLGl9wWQTwlwg7rswC-SofgTUV7NYS9yTxhYmWO18ZjHpYcheoffy3mcvTnFEp02BeEgFCTc5_cjZL95QgGn8n_2DJaQKfd_3r1Mhvh8hJyw68EBfZjxojrpnQk482mR9kBCi0a-POL3opRhCiIqtHKJUKCwleTUKIrdlyPHAP7pGz3D6TbhlrOOPuxQ8u_V_pxep9U3cNvj3jeKPwt3iw1pJLVZMmHdQc',
  ginger:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCJEjFyrj_7O5OcN-Y--gPqkixHeLwz6Wx8W1wHSK10HEJCPOFsm2oIK4iYFxH4P4kwRPmEqrCVjzbHtv-h0adjHh53IUySHWl3mSxPpw3z93DXPGeyuR5gM4VmsjmfV9yTKt7EoRRNC93fTaaks3WXqnoVrwRJlQRhr1zTRPqxaK6RTFOkfJ_IX-l2YiM5_wUC9FJPk-BgXgFTIOtdxRFtwUafZDEiQMjdK7oaTo5r',
};

export const C05RecipeSetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes, selectedStore, setPendingCouponSelection } = useApp();

  const recipe = recipes.find((r) => r.id === id) || recipes[0];

  const [onionChecked, setOnionChecked] = useState(true);
  const [gingerChecked, setGingerChecked] = useState(true);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);

  const pricing = useMemo(() => {
    const baseMeatPrice = 546;
    const onionPrice = 58;
    const gingerPrice = 98;
    const setDiscount = recipe.setDiscountYen || 100;

    let currentSubtotal = baseMeatPrice;
    if (onionChecked) currentSubtotal += onionPrice;
    if (gingerChecked) currentSubtotal += gingerPrice;

    const isSetComplete = onionChecked && gingerChecked;
    const originalTotal = currentSubtotal + (isSetComplete ? 148 : 0);
    const finalPrice = isSetComplete ? currentSubtotal - setDiscount : currentSubtotal;

    return {
      isSetComplete,
      originalTotal,
      setDiscount: isSetComplete ? setDiscount : 0,
      finalPrice,
    };
  }, [onionChecked, gingerChecked, recipe.setDiscountYen]);

  const handleProceedToCouponConfirm = () => {
    const selectedIds = recipe.ingredients
      .filter((ing) => {
        if (ing.group === 'main') return true;
        if (ing.name.includes('たまねぎ')) return onionChecked;
        if (ing.name.includes('紅生姜')) return gingerChecked;
        return onionChecked && gingerChecked;
      })
      .map((i) => i.id);
    setPendingCouponSelection({ recipeId: recipe.id, selectedIngredientIds: selectedIds });
    navigate('/coupon-confirm');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Breadcrumb & Top Bar Context */}
      <div className="w-full bg-surface-container-low px-margin-mobile lg:px-margin py-space-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
          <div className="flex items-center gap-space-xs flex-wrap">
            <Link
              to="/ai-recipes"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>AIレシピ一覧</span>
            </Link>
            <span>/</span>
            <span className="text-on-surface font-medium">絶品おうち牛丼 レシピセット</span>
          </div>
          <div className="flex items-center gap-space-xs text-primary font-medium bg-surface-container-lowest px-space-sm py-0.5 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span>{selectedStore.name} 在庫連動中</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin py-space-md lg:py-space-lg">
        {/* Header Summary Block */}
        <div className="relative bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Visual Food Banner */}
            <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full">
              <img
                alt="絶品おうち牛丼 レシピセット"
                className="w-full h-full object-cover"
                src={C05_IMAGES.hero}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:hidden" />
              <div className="absolute top-space-sm left-space-sm flex flex-col gap-1">
                <span className="inline-flex items-center gap-1 bg-primary text-on-primary font-label-badge text-label-badge px-2.5 py-1 rounded-full shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">eco</span>{' '}
                  食品ロス削減レシピ
                </span>
                <span className="inline-flex items-center gap-1 bg-secondary text-on-secondary font-label-badge text-label-badge px-2.5 py-1 rounded-full shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">local_offer</span>{' '}
                  3点まとめ買いクーポン対象
                </span>
              </div>
            </div>

            {/* Recipe Meta Data */}
            <div className="lg:col-span-7 p-space-md lg:p-space-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-space-sm text-secondary font-headline-md text-body-sm mb-space-xs">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>店頭レスキュー限定・店舗特別価格セット</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-space-xs">
                  絶品おうち牛丼 レシピセット
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-md leading-relaxed">
                  見切り品の国産牛肩ロースのコクと、あまいたまねぎが絶妙に絡み合う黄金比の牛丼。必要な生鮮食材を店頭で揃えるだけで、今夜の主菜が15分でお得に完成します。
                </p>

                {/* Quick Specs Bento */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs lg:gap-space-sm bg-surface-container-low rounded-xl p-space-sm">
                  <div className="flex flex-col items-center justify-center p-space-xs bg-surface-container-lowest rounded-lg text-center">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-0.5">
                      schedule
                    </span>
                    <span className="font-label-caption text-label-caption text-on-surface-variant">
                      調理時間
                    </span>
                    <span className="font-headline-md text-body-lg text-on-surface font-bold">
                      15分
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-space-xs bg-surface-container-lowest rounded-lg text-center">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-0.5">
                      groups
                    </span>
                    <span className="font-label-caption text-label-caption text-on-surface-variant">
                      分量
                    </span>
                    <span className="font-headline-md text-body-lg text-on-surface font-bold">
                      2人前
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-space-xs bg-surface-container-lowest rounded-lg text-center">
                    <span className="material-symbols-outlined text-primary text-[20px] mb-0.5">
                      trending_up
                    </span>
                    <span className="font-label-caption text-label-caption text-on-surface-variant">
                      難易度
                    </span>
                    <span className="font-headline-md text-body-lg text-on-surface font-bold">
                      かんたん
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-space-xs bg-surface-container-lowest rounded-lg text-center">
                    <span className="material-symbols-outlined text-secondary text-[20px] mb-0.5">
                      savings
                    </span>
                    <span className="font-label-caption text-label-caption text-on-surface-variant">
                      割引額
                    </span>
                    <span className="font-headline-md text-body-lg text-secondary font-bold">
                      -¥100
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-space-md pt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    storefront
                  </span>
                  <span>
                    対象店舗：<strong className="text-on-surface">{selectedStore.name}</strong>{' '}
                    (精肉・青果コーナー)
                  </span>
                </div>
                <div className="text-label-caption text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-md self-start sm:self-auto">
                  ※本画面は店頭購入支援ツールです（事前予約・決済不可）
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left Column: 3 Distinct Ingredient Groups + Step Guide */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-label-caption font-label-caption text-primary uppercase tracking-wider font-bold">
                  In-Store Checklist
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  食材の3グループ区分
                </h2>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline-block">
                店頭でカゴに入れる品目をチェックできます
              </span>
            </div>

            {/* GROUP A */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="bg-primary/10 px-space-md py-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-headline-md text-body-sm flex items-center justify-center font-bold">
                    A
                  </span>
                  <div>
                    <span className="font-headline-md text-body-lg text-primary">
                      選択済みの主食材
                    </span>
                    <span className="text-label-caption text-on-surface-variant ml-2">
                      ※クーポン発券の必須条件
                    </span>
                  </div>
                </div>
                <span className="font-label-badge text-label-badge bg-primary text-on-primary px-2.5 py-0.5 rounded-full">
                  確定アイテム
                </span>
              </div>
              <div className="p-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center gap-space-md bg-surface-container-low/50 rounded-lg p-space-sm">
                  <div className="w-full sm:w-28 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img
                      alt="国産牛肩ローススライス 250g"
                      className="w-full h-full object-cover"
                      src={C05_IMAGES.beef}
                    />
                    <span className="absolute top-1 left-1 bg-secondary text-on-secondary font-label-badge text-label-badge px-1.5 py-0.5 rounded">
                      30% OFF
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-space-sm">
                        <h3 className="font-headline-md text-body-lg text-on-surface">
                          国産牛肩ローススライス 250g
                        </h3>
                        <div className="text-right">
                          <span className="font-label-caption text-label-caption text-on-surface-variant line-through block">
                            参考 ¥780
                          </span>
                          <span className="font-label-numeric-lg text-label-numeric-lg text-secondary">
                            ¥546
                          </span>
                          <span className="font-label-caption text-label-caption text-secondary font-normal">
                            (税抜)
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-space-xs mt-1">
                        <span className="inline-flex items-center gap-1 font-body-sm text-body-sm bg-error-container text-on-error-container px-2 py-0.5 rounded">
                          <span className="material-symbols-outlined text-[14px]">warning</span>{' '}
                          賞味期限: 本日21:00まで
                        </span>
                        <span className="inline-flex items-center gap-1 font-body-sm text-body-sm bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded">
                          <span className="material-symbols-outlined text-[14px]">inventory_2</span>{' '}
                          残り4パック
                        </span>
                      </div>
                    </div>
                    <div className="mt-space-sm pt-space-xs flex items-center justify-between font-body-sm text-body-sm">
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                        <span>
                          売り場: <strong>1F 精肉コーナー</strong> (中央平台・見切り品ワゴン)
                        </span>
                      </div>
                      <span className="text-label-caption text-on-surface-variant">選択解除不可</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GROUP B */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="bg-secondary-fixed/50 px-space-md py-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="w-7 h-7 rounded-full bg-secondary text-on-secondary font-headline-md text-body-sm flex items-center justify-center font-bold">
                    B
                  </span>
                  <div>
                    <span className="font-headline-md text-body-lg text-secondary">
                      店内で追加購入をおすすめする食材
                    </span>
                    <span className="text-label-caption text-on-surface-variant ml-2">
                      ※食品ロス削減＆見切り品優先
                    </span>
                  </div>
                </div>
                <span className="font-label-badge text-label-badge bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-bold">
                  チェックで¥100引適用
                </span>
              </div>
              <div className="p-space-md space-y-space-md">
                <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low p-2.5 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px] flex-shrink-0">
                    tips_and_updates
                  </span>
                  <span>
                    ご自宅にある食材はチェックを外して除外できます。ただし
                    <strong>「国産牛肉 ＋ たまねぎ ＋ 紅生姜」の3点をレジへ持参</strong>
                    することが¥100引きクーポンの適用条件となります。
                  </span>
                </p>

                {/* Item B1: たまねぎ */}
                <label className="flex flex-col sm:flex-row sm:items-center gap-space-md p-space-sm bg-surface-container-lowest hover:bg-surface-container-low/60 transition-colors rounded-lg cursor-pointer">
                  <div className="flex items-center gap-space-sm">
                    <input
                      checked={onionChecked}
                      onChange={(e) => setOnionChecked(e.target.checked)}
                      className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                      id="item-onion"
                      type="checkbox"
                    />
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img
                        alt="北海道産たまねぎ 1個"
                        className="w-full h-full object-cover"
                        src={C05_IMAGES.onion}
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-on-primary font-label-caption text-label-caption text-center py-0.5">
                        見切り品
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline-md text-body-lg text-on-surface font-bold">
                            北海道産たまねぎ 1個
                          </h4>
                          <span className="font-label-caption text-label-caption bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded">
                            規格外特価
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          薄切りにしてタレが染み込みやすい高糖度たまねぎ
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                          ¥58
                        </span>
                        <span className="font-label-caption text-label-caption text-on-surface-variant block">
                          (税抜)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-space-xs font-body-sm text-body-sm">
                      <div className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span>
                          売り場: <strong>2F 青果コーナー</strong> (根菜棚・エコかご)
                        </span>
                      </div>
                      <span className="text-label-caption text-primary font-medium">
                        在庫あり (20+個)
                      </span>
                    </div>
                  </div>
                </label>

                {/* Item B2: 紅生姜 */}
                <label className="flex flex-col sm:flex-row sm:items-center gap-space-md p-space-sm bg-surface-container-lowest hover:bg-surface-container-low/60 transition-colors rounded-lg cursor-pointer">
                  <div className="flex items-center gap-space-sm">
                    <input
                      checked={gingerChecked}
                      onChange={(e) => setGingerChecked(e.target.checked)}
                      className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                      id="item-ginger"
                      type="checkbox"
                    />
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img
                        alt="刻み紅生姜 1パック (50g)"
                        className="w-full h-full object-cover"
                        src={C05_IMAGES.ginger}
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline-md text-body-lg text-on-surface font-bold">
                            刻み紅生姜 1パック (50g)
                          </h4>
                          <span className="font-label-caption text-label-caption bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded">
                            定番添え物
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          牛丼の味を引き締めるさっぱりとした酸味と辛味
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-label-numeric-md text-label-numeric-md text-on-surface">
                          ¥98
                        </span>
                        <span className="font-label-caption text-label-caption text-on-surface-variant block">
                          (税抜)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-space-xs font-body-sm text-body-sm">
                      <div className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span>
                          売り場: <strong>1F 漬物・惣菜横コーナー</strong> (冷蔵棚A-3)
                        </span>
                      </div>
                      <span className="text-label-caption text-primary font-medium">
                        在庫あり (12個)
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* GROUP C */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="bg-surface-container-high px-space-md py-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="w-7 h-7 rounded-full bg-outline text-surface-container-lowest font-headline-md text-body-sm flex items-center justify-center font-bold">
                    C
                  </span>
                  <div>
                    <span className="font-headline-md text-body-lg text-on-surface">
                      ご家庭にある基本調味料
                    </span>
                    <span className="text-label-caption text-secondary font-bold ml-2">
                      購入不要・クーポン対象外
                    </span>
                  </div>
                </div>
                <span className="font-label-badge text-label-badge bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full">
                  店頭での購入不要
                </span>
              </div>
              <div className="p-space-md">
                <div className="bg-surface-container-low/70 rounded-lg p-space-sm mb-space-sm text-body-sm font-body-sm text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-[18px]">home</span>
                  <span>
                    ※調味料はセット購入条件に含まれません。ご自宅のストックをご確認ください。
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm font-body-sm text-body-sm text-on-surface">
                  {[
                    ['醤油', '大さじ 3'],
                    ['みりん', '大さじ 2'],
                    ['酒', '大さじ 2'],
                    ['砂糖', '大さじ 1'],
                    ['和風だしの素', '小さじ 1'],
                    ['水', '150 ml'],
                  ].map(([label, amount]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between bg-surface-container-lowest p-2.5 rounded-lg shadow-sm"
                    >
                      <span className="text-on-surface-variant">{label}</span>
                      <span className="font-label-numeric-md text-body-sm font-bold text-on-surface">
                        {amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RECIPE STEP GUIDE */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md lg:p-space-lg">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <span className="text-label-caption font-label-caption text-primary uppercase tracking-wider font-bold">
                    Simple 4 Steps
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    作り方ステップガイド
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant text-body-sm font-body-sm">
                  <span className="material-symbols-outlined text-[18px]">timer</span>
                  <span>目安時間: 15分</span>
                </div>
              </div>
              <div className="space-y-space-md">
                {[
                  {
                    num: 1,
                    title: 'たまねぎをカットする',
                    body: '北海道産たまねぎの皮をむき、繊維に沿って5mm幅のくし形に薄切りにします。',
                  },
                  {
                    num: 2,
                    title: '調味料と煮汁を一煮立ちさせる',
                    body: 'フライパンまたは小鍋に［グループC］の水150ml、醤油大さじ3、みりん大さじ2、酒大さじ2、砂糖大さじ1、和風だしの素小さじ1を入れ中火にかけます。煮立ったら切ったたまねぎを入れ、中火で約3分しんなりするまで煮ます。',
                  },
                  {
                    num: 3,
                    title: '牛肉を広げて加え、アクを取る',
                    body: '国産牛肩ローススライスを1枚ずつほぐしながら広げて加えます。強火にしすぎず、弱めの中火でアクをすくいながら約4〜5分煮込み、肉にタレの旨味を吸わせます。',
                  },
                  {
                    num: 4,
                    title: '盛り付け＆紅生姜を添えて完成',
                    body: 'どんぶりに温かいご飯（別売り・またはご自宅用）を盛り、たっぷりの具材と煮汁をかけます。仕上げに［グループB］の刻み紅生姜を添えて熱々をお召し上がりください！',
                  },
                ].map((step) => (
                  <div key={step.num} className="flex gap-space-md items-start">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-headline-md text-body-md flex items-center justify-center flex-shrink-0 font-bold">
                      {step.num}
                    </div>
                    <div className="flex-1 bg-surface-container-low p-space-sm rounded-lg">
                      <h4 className="font-headline-md text-body-md text-on-surface mb-1 font-bold">
                        {step.title}
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary & Coupon Action Box */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 flex flex-col gap-space-md">
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-md lg:p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center justify-between gap-2">
                <span className="font-headline-md text-body-lg text-on-surface">
                  セット割引サマリー
                </span>
                <div
                  className={`font-label-badge text-label-badge px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    pricing.isSetComplete
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {pricing.isSetComplete ? 'verified' : 'info'}
                  </span>
                  {pricing.isSetComplete ? '条件達成：¥100引き適用中' : '未達成：3品揃うと¥100引'}
                </div>
              </div>

              {/* Price Calculation Rows */}
              <div className="bg-surface-container-low rounded-lg p-space-md space-y-space-xs font-body-md text-body-md">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>単品定価 合計参考価格</span>
                  <span className="font-label-numeric-md text-body-md text-on-surface-variant line-through">
                    ¥{pricing.originalTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-secondary font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">local_offer</span>
                    <span>3点同時購入セット割引</span>
                  </span>
                  <span className="font-label-numeric-md text-body-lg font-bold text-secondary">
                    {pricing.isSetComplete ? `-¥${pricing.setDiscount}` : '¥0'}
                  </span>
                </div>
                <div className="pt-space-xs flex items-baseline justify-between">
                  <div>
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">
                      お支払い参考総額
                    </span>
                    <span className="font-label-caption text-label-caption text-on-surface-variant block">
                      ※店頭レジでの精算額 (税抜)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-numeric-lg text-headline-xl text-primary font-bold">
                      ¥{pricing.finalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coupon Eligibility Criteria Status Box */}
              <div
                className={`p-space-sm rounded-lg font-body-sm text-body-sm flex items-start gap-2 transition-colors ${
                  pricing.isSetComplete
                    ? 'bg-surface-container-low text-primary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] flex-shrink-0">
                  {pricing.isSetComplete ? 'check_circle' : 'warning'}
                </span>
                <span>
                  {pricing.isSetComplete
                    ? '対象の「国産牛肉 ＋ 青果たまねぎ ＋ 紅生姜」の3点をレジへ持参すると¥100引きクーポンがご利用可能です。'
                    : '自宅にある食材を除外中（セット割引は3点購入時のみ適用）'}
                </span>
              </div>

              {/* Environmental Impact Note */}
              <div className="bg-primary/10 rounded-lg p-space-sm flex items-center gap-space-sm text-primary font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[24px]">energy_savings_leaf</span>
                <div>
                  <span className="font-bold">この購入で約380gのCO₂削減に貢献！</span>
                  <p className="text-label-caption text-primary/80">
                    見切り食材を救うことでスーパーの廃棄削減を支援します
                  </p>
                </div>
              </div>

              {/* Main CTA Trigger */}
              <button
                type="button"
                onClick={handleProceedToCouponConfirm}
                disabled={!pricing.isSetComplete}
                className={`w-full py-3.5 px-space-md rounded-xl font-headline-md text-body-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                  pricing.isSetComplete
                    ? 'bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary'
                    : 'opacity-75 bg-outline-variant text-on-surface cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">qr_code_2</span>
                <span>
                  {pricing.isSetComplete
                    ? 'このセットの割引クーポンを取得する (-¥100)'
                    : '通常価格で確認中（クーポン条件未達成）'}
                </span>
              </button>

              {/* Crucial Store Notice */}
              <div className="bg-surface-container p-space-sm rounded-lg text-label-caption text-on-surface-variant leading-relaxed">
                <div className="flex items-center gap-1 font-bold text-secondary mb-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  <span>店頭でのお買い物に関する重要なお知らせ</span>
                </div>
                ※クーポンを取得しても
                <strong>商品の予約・取り置きは行われません。</strong>
                お客様ご自身で売り場から商品を選んでカゴに入れ、お会計時にレジにてクーポンバーコードをご提示ください。店頭在庫はリアルタイムで変動するため品切れの際はご容赦ください。
              </div>
            </div>

            {/* Aisle Guide Shortcut */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md">
              <div className="flex items-center justify-between mb-space-xs">
                <span className="font-headline-md text-body-md text-on-surface font-bold">
                  店内の売り場マップ順路ガイド
                </span>
                <button
                  type="button"
                  onClick={() => setBarcodeModalOpen(true)}
                  className="text-label-caption text-primary font-bold hover:underline cursor-pointer"
                >
                  バーコード見本
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                カゴを持って店内をスムーズに回るための推奨順路です。
              </p>
              <div className="space-y-2 font-body-sm text-body-sm">
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest text-center text-label-caption leading-5 font-bold shrink-0">
                    1
                  </span>
                  <span>
                    <strong>2F 青果コーナー:</strong> 北海道産たまねぎをピックアップ
                  </span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest text-center text-label-caption leading-5 font-bold shrink-0">
                    2
                  </span>
                  <span>
                    <strong>1F 精肉コーナー:</strong> 見切り品 国産牛肩ロースをピックアップ
                  </span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="w-5 h-5 rounded-full bg-surface-container-highest text-center text-label-caption leading-5 font-bold shrink-0">
                    3
                  </span>
                  <span>
                    <strong>1F 惣菜横:</strong> 刻み紅生姜をピックアップしレジへ直行
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Store Barcode Bottom-Sheet Modal (Exact Stitch c05 modal) */}
      {barcodeModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setBarcodeModalOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 max-w-2xl mx-auto z-50 bg-surface-container-lowest rounded-t-2xl shadow-xl p-space-lg">
            <div className="flex items-center justify-between pb-space-sm mb-space-md">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">local_activity</span>
                </span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    レジ提示用セットクーポン
                  </h3>
                  <p className="font-body-sm text-body-sm text-primary font-medium">
                    絶品おうち牛丼 ¥100 OFF
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBarcodeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center cursor-pointer"
                aria-label="閉じる"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low rounded-lg p-space-sm mb-space-md flex items-center justify-between text-body-sm font-body-sm">
              <span className="text-on-surface">
                有効店舗: <strong>{selectedStore.name}</strong>
              </span>
              <span className="bg-secondary text-on-secondary font-label-badge text-label-badge px-2 py-0.5 rounded">
                本日 23:59 まで有効
              </span>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-inner flex flex-col items-center justify-center text-center">
              <div className="text-label-caption font-bold text-on-surface-variant mb-2 tracking-wide flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  brightness_high
                </span>
                スキャナで読み取りやすいよう画面を明るくしてください
              </div>
              <div className="w-full max-w-xs py-2">
                <BarcodeSvg code="4902102883910" height={84} />
              </div>
              <div className="font-label-numeric-md tracking-widest text-on-surface mt-2 text-center text-label-numeric-md">
                4 9 0 2 1 0 2 8 8 3 9 1 0
              </div>
              <span className="text-label-caption text-on-surface-variant mt-1">
                クーポンコード: SET-GYU-100
              </span>
            </div>

            <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg text-body-sm font-body-sm text-on-surface-variant">
              <span className="font-bold text-on-surface block mb-1">レジ精算時の確認事項：</span>
              <ul className="list-disc list-inside space-y-0.5">
                <li>国産牛肩ローススライス 250g（見切り品）</li>
                <li>北海道産たまねぎ 1個</li>
                <li>刻み紅生姜 1パック</li>
              </ul>
              <span className="text-label-caption text-secondary block mt-1">
                ※3品同時にスキャンされた時点で合計から¥100が値引きされます。
              </span>
            </div>

            <div className="mt-space-md flex gap-space-sm">
              <button
                type="button"
                onClick={() => setBarcodeModalOpen(false)}
                className="flex-1 bg-surface-container-high hover:bg-surface-variant text-on-surface font-body-md text-body-md font-medium py-3 rounded-xl transition-colors cursor-pointer"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={() => {
                  setBarcodeModalOpen(false);
                  handleProceedToCouponConfirm();
                }}
                className="flex-1 bg-primary text-on-primary font-body-md text-body-md font-bold py-3 rounded-xl text-center shadow-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
                <span>マイクーポンに保存</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
