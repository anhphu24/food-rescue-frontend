import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CustomerLayout } from './layouts/CustomerLayout';
import { StoreLayout } from './layouts/StoreLayout';

import { C01HomePage } from './pages/customer/C01HomePage';
import { C02SearchProductsPage } from './pages/customer/C02SearchProductsPage';
import { C03ProductDetailPage } from './pages/customer/C03ProductDetailPage';
import { C04AiRecipesPage } from './pages/customer/C04AiRecipesPage';
import { C05RecipeSetDetailPage } from './pages/customer/C05RecipeSetDetailPage';
import { C06CouponConfirmPage } from './pages/customer/C06CouponConfirmPage';
import { C07MyCouponsPage } from './pages/customer/C07MyCouponsPage';
import { C08CouponBarcodePage } from './pages/customer/C08CouponBarcodePage';
import { C09MyPage } from './pages/customer/C09MyPage';
import { C10AuthPage } from './pages/customer/C10AuthPage';

import { S01DashboardPage } from './pages/store/S01DashboardPage';
import { S02ProductMasterPage } from './pages/store/S02ProductMasterPage';
import { S02BProductRegisterPage } from './pages/store/S02BProductRegisterPage';
import { S03LotInventoryPage } from './pages/store/S03LotInventoryPage';
import { S04CouponManagementPage } from './pages/store/S04CouponManagementPage';
import { S05RegisterVerifyPage } from './pages/store/S05RegisterVerifyPage';
import { S06StoreSettingsPage } from './pages/store/S06StoreSettingsPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <ScrollToTop />
      <Routes>
        {/* Customer UI (C01 - C10) */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<C01HomePage />} />
          <Route path="/products" element={<C02SearchProductsPage />} />
          <Route path="/products/:id" element={<C03ProductDetailPage />} />
          <Route path="/ai-recipes" element={<C04AiRecipesPage />} />
          <Route path="/recipe-set/:id" element={<C05RecipeSetDetailPage />} />
          <Route path="/coupon-confirm" element={<C06CouponConfirmPage />} />
          <Route path="/my-coupons" element={<C07MyCouponsPage />} />
          <Route path="/my-coupons/:id" element={<C08CouponBarcodePage />} />
          <Route path="/mypage" element={<C09MyPage />} />
          <Route path="/auth" element={<C10AuthPage />} />
        </Route>

        {/* Store Management UI (S01 - S06 + S02-B) */}
        <Route path="/store" element={<StoreLayout />}>
          <Route index element={<S01DashboardPage />} />
          <Route path="products" element={<S02ProductMasterPage />} />
          <Route path="products/new" element={<S02BProductRegisterPage />} />
          <Route path="lots" element={<S03LotInventoryPage />} />
          <Route path="coupons" element={<S04CouponManagementPage />} />
          <Route path="register" element={<S05RegisterVerifyPage />} />
          <Route path="settings" element={<S06StoreSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
};

export default App;
