import test from 'node:test';
import assert from 'node:assert/strict';
import {
  acquireCouponWithoutStockHold,
  calculateLotDiscountedPrice,
  calculateRecipeSetPricing,
  calculateTaxInclusivePrice,
  filterAndSortStoreLots,
  findMasterByJan,
  prioritizeStoresByAddress,
  redeemCouponAtRegister,
  validateJanCode,
  verifyCouponAtRegister,
} from './foodRescueLogic';
import type { CustomerCoupon, ProductMaster, RecipeIngredient, Store, StoreLot } from '../types';

const mockMasters: ProductMaster[] = [
  {
    id: 'prod-beef',
    janCode: '4901234567894',
    name: '国産牛肩ローススライス',
    spec: '250g',
    origin: '国産',
    category: '精肉',
    categoryCode: 'meat',
    standardPriceExclTax: 722,
    standardPriceInclTax: 780,
    taxRate: 8,
    aiRole: 'main',
    imageUrl: '',
    activeLotCount: 2,
    status: 'active',
  },
];

const mockLots: StoreLot[] = [
  {
    id: 'lot-1',
    lotCode: 'LOT-20250510-01',
    storeId: 'store-shibuya',
    productId: 'prod-beef',
    productName: '国産牛肩ローススライス 250g',
    janCode: '4901234567894',
    category: '精肉',
    imageUrl: '',
    shelfLocation: '1F 精肉コーナー奥 冷ケース',
    shelfShort: '1F 精肉 奥ケース',
    registeredAt: '本日 15:40',
    expiryDate: '2026-12-31',
    expiryTime: '21:00',
    expiryLabel: '本日 21:00',
    remainingTimeLabel: '残り 2時間15分',
    isUrgentToday: true,
    originalPrice: 780,
    discountPercent: 30,
    discountedPrice: 546,
    stockQty: 3,
    stockUnit: 'パック',
    stockBadge: '要補充目安',
    campaignTag: '牛丼セット割連動中',
    aiRecipeTag: 'AIレシピ提案: 有効',
    aiEnabled: true,
    status: 'active',
    co2ReductionKg: 1.2,
  },
  {
    id: 'lot-2',
    lotCode: 'LOT-20250510-02',
    storeId: 'store-ebisu',
    productId: 'prod-salmon',
    productName: 'サーモン刺身パック',
    janCode: '4902345678900',
    category: '鮮魚',
    imageUrl: '',
    shelfLocation: '1F 鮮魚コーナー',
    shelfShort: '1F 鮮魚',
    registeredAt: '本日 16:00',
    expiryDate: '2026-12-31',
    expiryTime: '20:00',
    expiryLabel: '本日 20:00',
    remainingTimeLabel: '残り 1時間',
    isUrgentToday: true,
    originalPrice: 598,
    discountPercent: 50,
    discountedPrice: 299,
    stockQty: 5,
    stockUnit: 'パック',
    stockBadge: '適正陳列',
    campaignTag: '鮮魚夕市',
    aiRecipeTag: 'AIレシピ提案: 有効',
    aiEnabled: true,
    status: 'active',
    co2ReductionKg: 0.8,
  },
];

test('TC-08: validateJanCode validates GS1 JAN-13 and JAN-8 check digits', () => {
  const valid13 = validateJanCode('4901234567894');
  assert.equal(valid13.valid, true);
  assert.equal(valid13.format, 'JAN-13');

  const invalidCheck = validateJanCode('4901234567890');
  assert.equal(invalidCheck.valid, false);

  const valid8 = validateJanCode('49123456');
  assert.equal(valid8.valid, true);
  assert.equal(valid8.format, 'JAN-8');
});

test('TC-08: findMasterByJan detects duplicate JAN across ProductMaster', () => {
  const hit = findMasterByJan(mockMasters, '4901234567894');
  assert.equal(hit?.id, 'prod-beef');

  const miss = findMasterByJan(mockMasters, '4909999999994');
  assert.equal(miss, undefined);
});

test('Tax inclusive and lot discount calculations match Japanese supermarket rounding', () => {
  assert.equal(calculateTaxInclusivePrice(398, 8), 430);
  const disc30 = calculateLotDiscountedPrice(780, 'percent', 30);
  assert.equal(disc30.discountedPrice, 546);
  assert.equal(disc30.savingsYen, 234);

  const discFixed = calculateLotDiscountedPrice(780, 'fixed', 200);
  assert.equal(discFixed.discountedPrice, 580);
  assert.equal(discFixed.savingsYen, 200);
});

test('C05: calculateRecipeSetPricing unlocks set coupon only when >= 3 items selected', () => {
  const ingredients: RecipeIngredient[] = [
    {
      id: 'i1',
      name: '国産牛肩ロース',
      spec: '250g',
      group: 'main',
      aisleLabel: '精肉',
      originalPrice: 780,
      price: 546,
      isDiscounted: true,
    },
    {
      id: 'i2',
      name: '北海道産たまねぎ',
      spec: '1個',
      group: 'recommended',
      aisleLabel: '青果',
      originalPrice: 88,
      price: 50,
      isDiscounted: true,
    },
    {
      id: 'i3',
      name: '刻み紅生姜',
      spec: '1パック',
      group: 'recommended',
      aisleLabel: '漬物',
      originalPrice: 98,
      price: 98,
      isDiscounted: false,
    },
  ];

  const all3 = calculateRecipeSetPricing(ingredients, ['i1', 'i2', 'i3'], 100, 3);
  assert.equal(all3.isEligibleForSetCoupon, true);
  assert.equal(all3.setCouponDiscount, 100);
  assert.equal(all3.finalTotal, 594);

  const only2 = calculateRecipeSetPricing(ingredients, ['i1', 'i2'], 100, 3);
  assert.equal(only2.isEligibleForSetCoupon, false);
  assert.equal(only2.setCouponDiscount, 0);
  assert.equal(only2.finalTotal, 596);
});

test('TC-03: acquireCouponWithoutStockHold adds coupon without decrementing StoreLot stock', () => {
  const coupon: CustomerCoupon = {
    id: 'cp-1',
    token: 'FR-2025-0849-5510',
    title: '絶品おうち牛丼 3品まとめ買いセット割',
    subtitle: '3品セット割',
    storeId: 'store-shibuya',
    storeName: 'ライフ 渋谷桜丘店',
    discountAmountYen: 100,
    minItemsRequired: 3,
    items: [],
    status: 'ACQUIRED',
    acquiredAt: '本日 18:30',
    validUntilLabel: '本日 21:00まで',
    expiresAtIso: '2027-01-01T21:00:00Z',
    imageUrl: '',
    co2ReductionKg: 1.2,
  };

  const { coupons, lots } = acquireCouponWithoutStockHold([], coupon, mockLots);
  assert.equal(coupons.length, 1);
  assert.equal(lots[0].stockQty, 3); // Strictly unchanged!
});

test('TC-04 & TC-05: S05 POS verification rejects wrong store and prevents double redemption', () => {
  const activeCoupon: CustomerCoupon = {
    id: 'cp-1',
    token: 'FR-2025-0849-5510',
    title: '絶品おうち牛丼 3品まとめ買いセット割',
    subtitle: '3品セット割',
    storeId: 'store-shibuya',
    storeName: 'ライフ 渋谷桜丘店',
    discountAmountYen: 100,
    minItemsRequired: 3,
    items: [],
    status: 'ACQUIRED',
    acquiredAt: '本日 18:30',
    validUntilLabel: '本日 21:00まで',
    expiresAtIso: '2027-01-01T21:00:00Z',
    imageUrl: '',
    co2ReductionKg: 1.2,
  };

  // Wrong store check
  const wrongStore = verifyCouponAtRegister([activeCoupon], 'FR-2025-0849-5510', 'store-ebisu', '2026-11-24T12:00:00Z');
  assert.equal(wrongStore.ok, false);
  assert.equal(wrongStore.status, 'WRONG_STORE');

  // Redeem at correct store
  const firstRedeem = redeemCouponAtRegister([activeCoupon], 'FR-2025-0849-5510', 'store-shibuya', true, '2026-11-24T12:00:00Z');
  assert.equal(firstRedeem.result.ok, true);
  assert.equal(firstRedeem.updatedCoupons[0].status, 'USED');

  // Double redemption attempt must fail
  const secondRedeem = redeemCouponAtRegister(firstRedeem.updatedCoupons, 'FR-2025-0849-5510', 'store-shibuya', true, '2026-11-24T12:05:00Z');
  assert.equal(secondRedeem.result.ok, false);
  assert.equal(secondRedeem.result.status, 'ALREADY_USED');
});

test('TC-01 & TC-02: filterAndSortStoreLots strictly scopes lots to selected store', () => {
  const shibuyaLots = filterAndSortStoreLots(mockLots, {
    storeId: 'store-shibuya',
    category: 'すべて',
  });
  assert.equal(shibuyaLots.length, 1);
  assert.equal(shibuyaLots[0].storeId, 'store-shibuya');

  const stores: Store[] = [
    {
      id: 's2',
      code: 'LF-095',
      name: 'ライフ 恵比寿店',
      chainName: 'ライフ',
      badge: '直営',
      address: '東京都渋谷区恵比寿',
      phone: '03-0000-0002',
      hours: '9:30 - 22:00',
      openTime: '09:30',
      closeTime: '22:00',
      distanceKm: 1.2,
      walkMinutes: 15,
      rescueCount: 18,
      couponCount: 5,
      latitude: 35.646,
      longitude: 139.71,
      mapPinTop: '50%',
      mapPinLeft: '60%',
      posGateway: 'POS-02',
      posIp: '192.168.10.43',
    },
    {
      id: 's1',
      code: 'LF-094',
      name: 'ライフ 渋谷桜丘店',
      chainName: 'ライフ',
      badge: '直営',
      address: '東京都渋谷区桜丘町 23-21',
      phone: '03-5489-0120',
      hours: '9:30 - 23:00',
      openTime: '09:30',
      closeTime: '23:00',
      distanceKm: 0.4,
      walkMinutes: 5,
      rescueCount: 24,
      couponCount: 8,
      latitude: 35.655,
      longitude: 139.701,
      mapPinTop: '38%',
      mapPinLeft: '45%',
      posGateway: 'TERAOKA POS-G7 #04',
      posIp: '192.168.10.42',
    },
  ];

  const prioritized = prioritizeStoresByAddress(stores, true);
  assert.equal(prioritized[0].id, 's1');
});
