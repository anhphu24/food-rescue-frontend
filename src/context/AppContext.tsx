import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_CUSTOMER_COUPONS,
  INITIAL_PRODUCT_MASTERS,
  INITIAL_RECIPES,
  INITIAL_STAFF_MEMBERS,
  INITIAL_STORES,
  INITIAL_STORE_CAMPAIGNS,
  INITIAL_STORE_LOTS,
  INITIAL_USER_PROFILE,
} from '../data/seedData';
import type {
  CustomerCoupon,
  ProductMaster,
  Recipe,
  StaffMember,
  Store,
  StoreCouponCampaign,
  StoreLot,
  UserAddress,
  UserProfile,
} from '../types';
import {
  acquireCouponWithoutStockHold,
  redeemCouponAtRegister,
  type CouponVerificationResult,
} from '../utils/foodRescueLogic';

interface AppContextValue {
  stores: Store[];
  selectedStoreId: string;
  selectedStore: Store;
  selectStore: (storeId: string, manual?: boolean) => void;
  updateStoreInfo: (storeId: string, patch: Partial<Store>) => void;

  productMasters: ProductMaster[];
  addProductMaster: (master: ProductMaster) => void;

  storeLots: StoreLot[];
  activeStoreLots: StoreLot[];
  addOrUpdateStoreLot: (lot: StoreLot) => void;
  updateLotStatus: (lotId: string, status: StoreLot['status']) => void;
  bulkApply50PercentUrgent: () => number;

  recipes: Recipe[];
  toggleSaveRecipe: (recipeId: string) => void;

  coupons: CustomerCoupon[];
  acquireRecipeCoupon: (recipe: Recipe, selectedIngredientIds?: string[]) => CustomerCoupon;
  acquireCouponFromRecipe: (recipeId: string, selectedIngredientIds?: string[]) => CustomerCoupon;
  pendingCouponSelection: { recipeId: string; selectedIngredientIds: string[] } | null;
  setPendingCouponSelection: (
    selection: { recipeId: string; selectedIngredientIds: string[] } | null
  ) => void;
  redeemCoupon: (
    token: string,
    allItemsChecked: boolean
  ) => { result: CouponVerificationResult; txNumber?: string };

  campaigns: StoreCouponCampaign[];
  toggleCampaignActive: (id: string) => void;
  addCampaign: (campaign: StoreCouponCampaign) => void;

  staffMembers: StaffMember[];
  addStaffMember: (staff: StaffMember) => void;

  user: UserProfile;
  updateUserAddress: (address: UserAddress) => void;
  togglePrioritizeNearby: (enabled: boolean) => void;
  setLoggedIn: (loggedIn: boolean, name?: string, email?: string) => void;

  storeModalOpen: boolean;
  setStoreModalOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'food_rescue_app_state_v1';

const AppContext = createContext<AppContextValue | null>(null);

interface PersistedState {
  selectedStoreId: string;
  stores: Store[];
  productMasters: ProductMaster[];
  storeLots: StoreLot[];
  recipes: Recipe[];
  coupons: CustomerCoupon[];
  campaigns: StoreCouponCampaign[];
  staffMembers: StaffMember[];
  user: UserProfile;
}

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        selectedStoreId: parsed.selectedStoreId || INITIAL_STORES[0].id,
        stores: parsed.stores?.length ? parsed.stores : INITIAL_STORES,
        productMasters: parsed.productMasters?.length
          ? parsed.productMasters
          : INITIAL_PRODUCT_MASTERS,
        storeLots: parsed.storeLots?.length ? parsed.storeLots : INITIAL_STORE_LOTS,
        recipes: parsed.recipes?.length ? parsed.recipes : INITIAL_RECIPES,
        coupons: parsed.coupons?.length ? parsed.coupons : INITIAL_CUSTOMER_COUPONS,
        campaigns: parsed.campaigns?.length ? parsed.campaigns : INITIAL_STORE_CAMPAIGNS,
        staffMembers: parsed.staffMembers?.length
          ? parsed.staffMembers
          : INITIAL_STAFF_MEMBERS,
        user: parsed.user ? { ...INITIAL_USER_PROFILE, ...parsed.user } : INITIAL_USER_PROFILE,
      };
    }
  } catch {
    // Fallback to initial seed data
  }
  return {
    selectedStoreId: INITIAL_STORES[0].id,
    stores: INITIAL_STORES,
    productMasters: INITIAL_PRODUCT_MASTERS,
    storeLots: INITIAL_STORE_LOTS,
    recipes: INITIAL_RECIPES,
    coupons: INITIAL_CUSTOMER_COUPONS,
    campaigns: INITIAL_STORE_CAMPAIGNS,
    staffMembers: INITIAL_STAFF_MEMBERS,
    user: INITIAL_USER_PROFILE,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => loadInitialState(), []);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(initial.selectedStoreId);
  const [stores, setStores] = useState<Store[]>(initial.stores);
  const [productMasters, setProductMasters] = useState<ProductMaster[]>(initial.productMasters);
  const [storeLots, setStoreLots] = useState<StoreLot[]>(initial.storeLots);
  const [recipes, setRecipes] = useState<Recipe[]>(initial.recipes);
  const [coupons, setCoupons] = useState<CustomerCoupon[]>(initial.coupons);
  const [campaigns, setCampaigns] = useState<StoreCouponCampaign[]>(initial.campaigns);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initial.staffMembers);
  const [user, setUser] = useState<UserProfile>(initial.user);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [pendingCouponSelection, setPendingCouponSelection] = useState<{
    recipeId: string;
    selectedIngredientIds: string[];
  } | null>(null);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        selectedStoreId,
        stores,
        productMasters,
        storeLots,
        recipes,
        coupons,
        campaigns,
        staffMembers,
        user,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    selectedStoreId,
    stores,
    productMasters,
    storeLots,
    recipes,
    coupons,
    campaigns,
    staffMembers,
    user,
  ]);

  const selectedStore = useMemo(
    () => stores.find((s) => s.id === selectedStoreId) || stores[0],
    [stores, selectedStoreId]
  );

  const activeStoreLots = useMemo(
    () => storeLots.filter((l) => l.storeId === selectedStoreId),
    [storeLots, selectedStoreId]
  );

  const selectStore = (storeId: string, manual = true) => {
    setSelectedStoreId(storeId);
    if (manual) {
      setUser((prev) => ({ ...prev, manualStoreSelected: true }));
    }
  };

  const updateStoreInfo = (storeId: string, patch: Partial<Store>) => {
    setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, ...patch } : s)));
  };

  const addProductMaster = (master: ProductMaster) => {
    setProductMasters((prev) => {
      const exists = prev.some((m) => m.janCode === master.janCode);
      if (exists) {
        return prev.map((m) => (m.janCode === master.janCode ? { ...m, ...master } : m));
      }
      return [master, ...prev];
    });
  };

  const addOrUpdateStoreLot = (lot: StoreLot) => {
    setStoreLots((prev) => {
      const exists = prev.some((l) => l.id === lot.id);
      if (exists) {
        return prev.map((l) => (l.id === lot.id ? lot : l));
      }
      return [lot, ...prev];
    });
  };

  const updateLotStatus = (lotId: string, status: StoreLot['status']) => {
    setStoreLots((prev) =>
      prev.map((l) =>
        l.id === lotId
          ? {
              ...l,
              status,
              stockQty: status === 'sold_out' ? 0 : l.stockQty,
            }
          : l
      )
    );
  };

  const bulkApply50PercentUrgent = () => {
    let updated = 0;
    setStoreLots((prev) =>
      prev.map((lot) => {
        if (lot.storeId === selectedStoreId && lot.isUrgentToday && lot.status === 'active') {
          updated += 1;
          return {
            ...lot,
            discountPercent: 50,
            discountedPrice: Math.round(lot.originalPrice * 0.5),
          };
        }
        return lot;
      })
    );
    return updated;
  };

  const toggleSaveRecipe = (recipeId: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, saved: !r.saved } : r))
    );
  };

  const acquireRecipeCoupon = (recipe: Recipe, selectedIngredientIds?: string[]): CustomerCoupon => {
    const suffix = Math.floor(1000 + Math.random() * 8999);
    const token = `FR-2025-${String(Math.floor(1000 + Math.random() * 8999))}-${suffix}`;
    const chosenIngredients = recipe.ingredients
      .filter(
        (ing) =>
          ing.group === 'main' ||
          (ing.group === 'recommended' &&
            (!selectedIngredientIds || selectedIngredientIds.includes(ing.id)))
      )
      .slice(0, 4);

    const newCoupon: CustomerCoupon = {
      id: `cp-${Date.now()}`,
      token,
      title: `${recipe.title.split('（')[0]} ${chosenIngredients.length}品まとめ買いセット割`,
      subtitle: 'AIレシピ連動・店頭レジ提示で即時値引き',
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      recipeId: recipe.id,
      discountAmountYen: recipe.setDiscountYen,
      minItemsRequired: Math.max(2, chosenIngredients.length),
      items: chosenIngredients.map((ing) => ({
        name: ing.name,
        spec: ing.spec,
        category: ing.aisleLabel,
        price: ing.price,
        originalPrice: ing.originalPrice,
        aisle: ing.aisleLabel,
        badge: ing.discountBadge || '対象商品',
        janCode: ing.janCode || '4901234567890',
        imageUrl: ing.imageUrl || recipe.imageUrl,
      })),
      status: 'ACQUIRED',
      acquiredAt: 'たった今取得',
      validUntilLabel: '本日 21:00まで',
      expiresAtIso: '2027-05-10T21:00:00Z',
      imageUrl: recipe.imageUrl,
      co2ReductionKg: recipe.co2ReductionKg,
    };

    // Explicitly invoke domain helper that guarantees storeLots stock is NEVER decremented
    const { coupons: nextCoupons } = acquireCouponWithoutStockHold(coupons, newCoupon, storeLots);
    setCoupons(nextCoupons);
    return newCoupon;
  };

  const acquireCouponFromRecipe = (
    recipeId: string,
    selectedIngredientIds?: string[]
  ): CustomerCoupon => {
    const target = recipes.find((r) => r.id === recipeId) || recipes[0];
    return acquireRecipeCoupon(target, selectedIngredientIds);
  };

  const redeemCoupon = (token: string, allItemsChecked: boolean) => {
    const { result, updatedCoupons, txNumber } = redeemCouponAtRegister(
      coupons,
      token,
      selectedStoreId,
      allItemsChecked
    );
    if (result.ok) {
      setCoupons(updatedCoupons);
      setUser((prev) => ({
        ...prev,
        rescuedMealsCount: prev.rescuedMealsCount + 1,
        co2SavedKg: Number((prev.co2SavedKg + (result.coupon?.co2ReductionKg || 1.0)).toFixed(1)),
        totalMoneySavedYen: prev.totalMoneySavedYen + (result.coupon?.discountAmountYen || 100),
      }));
    }
    return { result, txNumber };
  };

  const toggleCampaignActive = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const addCampaign = (campaign: StoreCouponCampaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
  };

  const addStaffMember = (staff: StaffMember) => {
    setStaffMembers((prev) => [...prev, staff]);
  };

  const updateUserAddress = (address: UserAddress) => {
    setUser((prev) => ({ ...prev, address }));
  };

  const togglePrioritizeNearby = (enabled: boolean) => {
    setUser((prev) => ({ ...prev, prioritizeNearbyByAddress: enabled }));
  };

  const setLoggedIn = (loggedIn: boolean, name?: string, email?: string) => {
    setUser((prev) => ({
      ...prev,
      isLoggedIn: loggedIn,
      name: name || prev.name,
      email: email || prev.email,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        stores,
        selectedStoreId,
        selectedStore,
        selectStore,
        updateStoreInfo,
        productMasters,
        addProductMaster,
        storeLots,
        activeStoreLots,
        addOrUpdateStoreLot,
        updateLotStatus,
        bulkApply50PercentUrgent,
        recipes,
        toggleSaveRecipe,
        coupons,
        acquireRecipeCoupon,
        acquireCouponFromRecipe,
        pendingCouponSelection,
        setPendingCouponSelection,
        redeemCoupon,
        campaigns,
        toggleCampaignActive,
        addCampaign,
        staffMembers,
        addStaffMember,
        user,
        updateUserAddress,
        togglePrioritizeNearby,
        setLoggedIn,
        storeModalOpen,
        setStoreModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
