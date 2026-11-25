export type StoreBadgeType = '直営' | '提携' | 'パートナー';

export interface Store {
  id: string;
  code: string;
  name: string;
  chainName: string;
  badge: StoreBadgeType;
  address: string;
  phone: string;
  hours: string;
  openTime: string;
  closeTime: string;
  distanceKm: number;
  walkMinutes: number;
  rescueCount: number;
  couponCount: number;
  highlightTag?: string;
  latitude: number;
  longitude: number;
  mapPinTop: string;
  mapPinLeft: string;
  posGateway: string;
  posIp: string;
}

export type ProductCategory = '精肉' | '鮮魚' | '青果' | '惣菜・弁当' | '日配・乳製品' | 'ベーカリー' | '調味料・加工品';

export interface ProductMaster {
  id: string;
  janCode: string;
  name: string;
  spec: string;
  origin: string;
  category: ProductCategory;
  categoryCode: 'meat' | 'fish' | 'produce' | 'deli' | 'processed' | 'condiment';
  standardPriceExclTax: number;
  standardPriceInclTax: number;
  taxRate: 8 | 10;
  aiRole: 'main' | 'sub' | 'seasoning';
  imageUrl: string;
  description?: string;
  allergens?: string[];
  activeLotCount: number;
  status: 'active' | 'inactive';
}

export type LotStatus = 'active' | 'paused' | 'sold_out';

export interface StoreLot {
  id: string;
  lotCode: string;
  storeId: string;
  productId: string;
  productName: string;
  janCode: string;
  category: ProductCategory;
  imageUrl: string;
  shelfLocation: string;
  shelfShort: string;
  registeredAt: string;
  expiryDate: string; // YYYY-MM-DD
  expiryTime: string; // HH:mm
  expiryLabel: string;
  remainingTimeLabel: string;
  isUrgentToday: boolean;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  stockQty: number;
  stockUnit: string;
  stockBadge: string;
  campaignTag: string;
  aiRecipeTag: string;
  aiEnabled: boolean;
  status: LotStatus;
  co2ReductionKg: number;
  isFeatured?: boolean;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  spec: string;
  group: 'main' | 'recommended' | 'seasoning';
  aisleLabel: string;
  originalPrice: number;
  price: number;
  isDiscounted: boolean;
  discountBadge?: string;
  imageUrl?: string;
  checkedByDefault?: boolean;
  stockStatus?: string;
  janCode?: string;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  mainProductId: string;
  mainIngredientName: string;
  imageUrl: string;
  cookTimeMinutes: number;
  servings: number;
  caloriesKcal: number;
  difficulty: string;
  co2ReductionKg: number;
  setDiscountYen: number;
  categoryTag: '時短' | '節約' | 'ボリューム' | 'ヘルシー';
  badgeLabel: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  saved?: boolean;
}

export type CouponStatus = 'ACQUIRED' | 'USED' | 'EXPIRED';

export interface CustomerCoupon {
  id: string;
  token: string;
  title: string;
  subtitle: string;
  storeId: string;
  storeName: string;
  recipeId?: string;
  discountAmountYen: number;
  minItemsRequired: number;
  items: Array<{
    name: string;
    spec: string;
    category: string;
    price: number;
    originalPrice?: number;
    aisle: string;
    badge?: string;
    janCode: string;
    imageUrl: string;
  }>;
  status: CouponStatus;
  acquiredAt: string;
  validUntilLabel: string;
  expiresAtIso: string;
  usedAt?: string;
  usedAtStore?: string;
  txNumber?: string;
  imageUrl: string;
  co2ReductionKg: number;
}

export interface StoreCouponCampaign {
  id: string;
  code: string;
  storeId: string;
  title: string;
  badge: string;
  tagLabel: string;
  targetSummary: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  discountPrefix: string;
  status: 'published' | 'draft' | 'ended';
  isActive: boolean;
  scheduleLabel: string;
  scheduleTag: string;
  conditionText: string;
  usedCount: number;
  dailyLimit: number;
  updatedAt: string;
  imageUrl: string;
  accentColor: 'primary' | 'secondary';
}

export interface StaffMember {
  id: string;
  empCode: string;
  name: string;
  initial: string;
  department: string;
  roleTitle: string;
  permissionLabel: string;
  permissionIcon: string;
  avatarBg: string;
  lastLogin: string;
  active: boolean;
}

export interface UserAddress {
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
  building: string;
  label: string;
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  name: string;
  email: string;
  memberId: string;
  rank: string;
  nextRankRemaining: number;
  rescuedMealsCount: number;
  co2SavedKg: number;
  totalMoneySavedYen: number;
  prioritizeNearbyByAddress: boolean;
  manualStoreSelected: boolean;
  address: UserAddress;
  isLoggedIn: boolean;
}
