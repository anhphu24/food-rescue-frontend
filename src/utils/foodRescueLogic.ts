import type {
  CustomerCoupon,
  ProductCategory,
  ProductMaster,
  RecipeIngredient,
  Store,
  StoreLot,
} from '../types';

export interface JanValidationResult {
  valid: boolean;
  format: 'JAN-13' | 'JAN-8' | 'INVALID';
  cleaned: string;
  reason?: string;
}

/**
 * Validates GS1 JAN-8 or JAN-13 barcode format and check digit.
 */
export function validateJanCode(raw: string): JanValidationResult {
  const cleaned = raw.replace(/\D/g, '');
  if (cleaned.length !== 13 && cleaned.length !== 8) {
    return {
      valid: false,
      format: 'INVALID',
      cleaned,
      reason: 'JANコードは8桁または13桁の数字で入力してください',
    };
  }

  const digits = cleaned.split('').map(Number);
  const checkDigit = digits[digits.length - 1];
  const payload = digits.slice(0, -1);

  let sum = 0;
  if (cleaned.length === 13) {
    // JAN-13: odd positions (0-indexed even) * 1, even positions (0-indexed odd) * 3
    for (let i = 0; i < payload.length; i++) {
      sum += payload[i] * (i % 2 === 0 ? 1 : 3);
    }
  } else {
    // JAN-8: positions from left (0-indexed even) * 3, (0-indexed odd) * 1
    for (let i = 0; i < payload.length; i++) {
      sum += payload[i] * (i % 2 === 0 ? 3 : 1);
    }
  }

  const expected = (10 - (sum % 10)) % 10;
  if (expected !== checkDigit) {
    return {
      valid: false,
      format: 'INVALID',
      cleaned,
      reason: `チェックディジット不一致（期待値: ${expected}）`,
    };
  }

  return {
    valid: true,
    format: cleaned.length === 13 ? 'JAN-13' : 'JAN-8',
    cleaned,
  };
}

/**
 * Finds an existing ProductMaster by exact JAN code match to enforce global JAN uniqueness.
 */
export function findMasterByJan(
  masters: ProductMaster[],
  janCode: string
): ProductMaster | undefined {
  const cleaned = janCode.replace(/\D/g, '');
  if (!cleaned) return undefined;
  return masters.find((m) => m.janCode.replace(/\D/g, '') === cleaned);
}

/**
 * Calculates tax-inclusive price using Japan's food reduced tax rate (8%) or standard (10%).
 */
export function calculateTaxInclusivePrice(
  exclTaxPrice: number,
  taxRate: 8 | 10 = 8
): number {
  const safe = Number.isFinite(exclTaxPrice) && exclTaxPrice > 0 ? exclTaxPrice : 0;
  return Math.round(safe * (1 + taxRate / 100));
}

/**
 * Calculates discounted retail price for a store lot.
 */
export function calculateLotDiscountedPrice(
  basePrice: number,
  mode: 'percent' | 'fixed',
  value: number
): { discountedPrice: number; savingsYen: number; effectivePercent: number } {
  const safeBase = Math.max(0, Math.round(basePrice));
  if (safeBase === 0) {
    return { discountedPrice: 0, savingsYen: 0, effectivePercent: 0 };
  }

  if (mode === 'percent') {
    const pct = Math.min(90, Math.max(0, value));
    const discountedPrice = Math.round(safeBase * (1 - pct / 100));
    return {
      discountedPrice,
      savingsYen: safeBase - discountedPrice,
      effectivePercent: pct,
    };
  }

  const fixedOff = Math.min(safeBase, Math.max(0, Math.round(value)));
  const discountedPrice = safeBase - fixedOff;
  const effectivePercent = Math.round((fixedOff / safeBase) * 100);
  return {
    discountedPrice,
    savingsYen: fixedOff,
    effectivePercent,
  };
}

export interface RecipeSetPricing {
  selectedCount: number;
  regularTotal: number;
  shelfDiscountTotal: number;
  setCouponDiscount: number;
  finalTotal: number;
  totalSavings: number;
  isEligibleForSetCoupon: boolean;
}

/**
 * Computes live pricing for C05 Recipe Set Detail based on selected checkboxes.
 * Set coupon requires at least 3 selected ingredients (1 main + 2 recommended).
 */
export function calculateRecipeSetPricing(
  ingredients: RecipeIngredient[],
  selectedIds: string[],
  setDiscountYen: number,
  minItemsForSet = 3
): RecipeSetPricing {
  const selectedSet = new Set(selectedIds);
  const picked = ingredients.filter(
    (item) => item.group === 'main' || selectedSet.has(item.id)
  );

  const selectedCount = picked.length;
  const regularTotal = picked.reduce((acc, item) => acc + item.originalPrice, 0);
  const shelfDiscountTotal = picked.reduce((acc, item) => acc + item.price, 0);
  const isEligibleForSetCoupon = selectedCount >= minItemsForSet;
  const setCouponDiscount = isEligibleForSetCoupon ? setDiscountYen : 0;
  const finalTotal = Math.max(0, shelfDiscountTotal - setCouponDiscount);
  const totalSavings = Math.max(0, regularTotal - finalTotal);

  return {
    selectedCount,
    regularTotal,
    shelfDiscountTotal,
    setCouponDiscount,
    finalTotal,
    totalSavings,
    isEligibleForSetCoupon,
  };
}

/**
 * Acquires a coupon for the customer without modifying StoreLot stock.
 * Enforces the domain invariant: NO online reservation or stock hold.
 */
export function acquireCouponWithoutStockHold(
  existingCoupons: CustomerCoupon[],
  newCoupon: CustomerCoupon,
  lots: StoreLot[]
): { coupons: CustomerCoupon[]; lots: StoreLot[]; alreadyExists: boolean } {
  const duplicate = existingCoupons.find((c) => c.token === newCoupon.token);
  if (duplicate) {
    return { coupons: existingCoupons, lots, alreadyExists: true };
  }
  return {
    coupons: [newCoupon, ...existingCoupons],
    // Strictly preserve store lot stock reference unchanged
    lots,
    alreadyExists: false,
  };
}

export type VerificationStatus =
  | 'VALID'
  | 'NOT_FOUND'
  | 'ALREADY_USED'
  | 'EXPIRED'
  | 'WRONG_STORE'
  | 'ITEMS_UNCHECKED';

export interface CouponVerificationResult {
  ok: boolean;
  status: VerificationStatus;
  message: string;
  coupon?: CustomerCoupon;
}

/**
 * Validates a scanned/entered coupon token at S05 POS Register Check.
 */
export function verifyCouponAtRegister(
  coupons: CustomerCoupon[],
  tokenInput: string,
  currentStoreId: string,
  nowIso: string = new Date().toISOString()
): CouponVerificationResult {
  const normalized = tokenInput.trim().toUpperCase();
  if (!normalized) {
    return {
      ok: false,
      status: 'NOT_FOUND',
      message: 'クーポンコードを入力してください',
    };
  }

  const found = coupons.find((c) => c.token.toUpperCase() === normalized);
  if (!found) {
    return {
      ok: false,
      status: 'NOT_FOUND',
      message: '該当するクーポンコードが見つかりません',
    };
  }

  if (found.storeId !== currentStoreId) {
    return {
      ok: false,
      status: 'WRONG_STORE',
      message: `対象店舗違いエラー（${found.storeName} 限定）`,
      coupon: found,
    };
  }

  if (found.status === 'USED') {
    return {
      ok: false,
      status: 'ALREADY_USED',
      message: `重複利用エラー（${found.usedAt || '使用済み'}）`,
      coupon: found,
    };
  }

  if (found.status === 'EXPIRED' || new Date(found.expiresAtIso).getTime() < new Date(nowIso).getTime()) {
    return {
      ok: false,
      status: 'EXPIRED',
      message: '有効期限切れエラー',
      coupon: found,
    };
  }

  return {
    ok: true,
    status: 'VALID',
    message: '有効・利用可能',
    coupon: found,
  };
}

/**
 * Atomically marks an ACQUIRED coupon as USED if all required items are verified.
 */
export function redeemCouponAtRegister(
  coupons: CustomerCoupon[],
  tokenInput: string,
  currentStoreId: string,
  allItemsChecked: boolean,
  nowIso: string = new Date().toISOString()
): {
  result: CouponVerificationResult;
  updatedCoupons: CustomerCoupon[];
  txNumber?: string;
} {
  const check = verifyCouponAtRegister(coupons, tokenInput, currentStoreId, nowIso);
  if (!check.ok || !check.coupon) {
    return { result: check, updatedCoupons: coupons };
  }

  if (!allItemsChecked) {
    return {
      result: {
        ok: false,
        status: 'ITEMS_UNCHECKED',
        message: '対象商品すべてを目視チェックしてください',
        coupon: check.coupon,
      },
      updatedCoupons: coupons,
    };
  }

  const txNumber = `TX-${Math.floor(90000 + Math.random() * 9999)}`;
  const usedAtLabel = '本日 ' + new Date(nowIso).toTimeString().slice(0, 5);
  const updatedCoupons = coupons.map((c) =>
    c.id === check.coupon!.id
      ? {
          ...c,
          status: 'USED' as const,
          usedAt: usedAtLabel,
          txNumber,
        }
      : c
  );

  return {
    result: {
      ok: true,
      status: 'VALID',
      message: 'クーポン適用を確定しました',
      coupon: {
        ...check.coupon,
        status: 'USED',
        usedAt: usedAtLabel,
        txNumber,
      },
    },
    updatedCoupons,
    txNumber,
  };
}

export type ProductSortKey = 'recommended' | 'discount_desc' | 'expiry_asc' | 'price_asc';

/**
 * Filters and sorts store lots for C02 Product Search strictly within the selected store.
 */
export function filterAndSortStoreLots(
  lots: StoreLot[],
  options: {
    storeId: string;
    query?: string;
    category?: ProductCategory | 'すべて';
    rescueOnly?: boolean;
    sortBy?: ProductSortKey;
  }
): StoreLot[] {
  const q = (options.query || '').trim().toLowerCase();
  const filtered = lots.filter((lot) => {
    if (lot.storeId !== options.storeId) return false;
    if (lot.status === 'sold_out') return false;
    if (options.category && options.category !== 'すべて' && lot.category !== options.category) {
      return false;
    }
    if (options.rescueOnly && lot.discountPercent <= 0) {
      return false;
    }
    if (q) {
      const hay = `${lot.productName} ${lot.category} ${lot.shelfLocation} ${lot.janCode}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (options.sortBy) {
    case 'discount_desc':
      sorted.sort((a, b) => b.discountPercent - a.discountPercent);
      break;
    case 'expiry_asc':
      sorted.sort((a, b) =>
        `${a.expiryDate}T${a.expiryTime}`.localeCompare(`${b.expiryDate}T${b.expiryTime}`)
      );
      break;
    case 'price_asc':
      sorted.sort((a, b) => a.discountedPrice - b.discountedPrice);
      break;
    default:
      sorted.sort((a, b) => Number(b.isUrgentToday) - Number(a.isUrgentToday) || b.discountPercent - a.discountPercent);
  }
  return sorted;
}

/**
 * Sorts stores by distance while keeping manually selected store intact.
 */
export function prioritizeStoresByAddress(
  stores: Store[],
  prioritizeNearby: boolean
): Store[] {
  if (!prioritizeNearby) return stores;
  return [...stores].sort((a, b) => a.distanceKm - b.distanceKm);
}
