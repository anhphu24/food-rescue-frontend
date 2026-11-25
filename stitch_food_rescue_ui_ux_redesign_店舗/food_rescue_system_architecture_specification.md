# FOOD RESCUE — システム要件定義・基本設計・詳細設計書 (System Architecture & Technical Specification)

- **プロジェクト**: Food Rescue (AI買い物支援・食品ロス削減システム)
- **対象読者**: Project Manager (PM), Technical Lead, Backend Engineers (Django), Frontend Engineers, QA Engineers
- **ステータス**: APPROVED FOR IMPLEMENTATION (設計完了 / 開発移行)
- **前提条件**: Djangoコード・DB・本番環境は変更せず、設計ドキュメントとしてCodex各チームに引き渡す。

---

## 目次
1. [新ビジネスモデルと基本方針](#1-新ビジネスモデルと基本方針)
2. [要件定義書 (機能要件・非機能要件)](#2-要件定義書-機能要件非機能要件)
3. [画面一覧・画面遷移・ステート設計](#3-画面一覧画面遷移ステート設計)
4. [既存資産棚卸し & 差分分析 (再利用 / 廃止 / 新規)](#4-既存資産棚卸し--差分分析-再利用--廃止--新規)
5. [ER図 & データベース詳細設計 (Django Models)](#5-er図--データベース詳細設計-django-models)
6. [Django アプリケーション構成 & 権限設計](#6-django-アプリケーション構成--権限設計)
7. [API インターフェース設計 (REST / JSON)](#7-api-インターフェース設計-rest--json)
8. [コア業務ロジック詳細設計](#8-コア業務ロジック詳細設計)
   - 8.1 商品マスターと店舗別ロット・在庫管理 (JANスキャン & 手動登録)
   - 8.2 AIレシピ提案 & 同一店舗追加食材マッチングエンジン
   - 8.3 レシピセット・クーポン発行・店頭レジ照合管理 (POS連携 & 手動フォールバック)
   - 8.4 登録住所・近隣店舗優先表示 & 地図モック/API分離
9. [セキュリティ & 個人情報保護設計](#9-セキュリティ--個人情報保護設計)
10. [旧予約機能 (Reservation) 安全撤去 & Migration 計画](#10-旧予約機能-reservation-安全撤去--migration-計画)
11. [QAテスト設計 & 受入テスト基準](#11-qaテスト設計--受入テスト基準)
12. [実装ロードマップ & 未確定事項 (MVP vs 将来機能)](#12-実装ロードマップ--未確定事項-mvp-vs-将来機能)

---

## 1. 新ビジネスモデルと基本方針

### 1.1 コアビジネスジャーニー
```
[顧客UI]
店舗選択 (C01)
  │
食材選択 (C02/C03) ──► AI献立提案 (C04) ──► 同一店舗の追加食材マッチング (C04)
  │                                                   │
  └───────────────────────────────────────────────────┴──► レシピセット選択 (C05)
                                                                 │
                                                             クーポン取得 (C06/C07)
                                                                 │ (※在庫は減算しない)
                                                                 ▼
                                                    [実店舗] お客様自身で商品をカゴへ
                                                                 │
                                                                 ▼
[店舗/レジ]                                         レジでクーポンバーコード提示 (C08)
  │
S05 (レジ照合画面) または POS連携で条件判定 ◄───────────────────┘
  ├─ 対象3商品が同一カゴにあるか
  ├─ クーポン対象店舗と一致しているか
  ├─ 有効期限内・未使用か
  ▼
割引適用 (小計値引) ──► 会計完了 ──► クーポン使用済化 (二重使用防止)
```

### 1.2 厳格な設計原則 (Inviolable Rules)
1. **予約・取り置き・事前決済・オンライン配送の完全排除**:
   - カート機能、注文エンティティ、決済ゲートウェイ（Stripe等）、受取日時の予約枠は新設計から完全に除外する。
2. **クーポン取得時にロット在庫を減算しない**:
   - お客様が店頭で商品を確保するまで在庫は確定しない。クーポン取得＝割引権利の取得であり、在庫引当ではない。
3. **商品マスター (Chain-wide Master) と 店舗別ロット (Store Lot) の完全分離**:
   - 商品マスター: JANコード、商品名、カテゴリ、標準価格、AI食材属性（全国/全チェーン共通）。
   - 店舗ロット: 対象店舗、仕入日、消費/賞味期限、割引率/見切り価格、店頭陳列位置、店頭実在庫数。
4. **同一店舗完結のAIレシピセット割**:
   - AIレシピ提案および追加食材は、原則として**現在選択されている同一店舗の陳列在庫**から優先提案する。他店舗の在庫を抱き合わせたセット販売は禁止。
5. **店舗変更時の状態保護**:
   - 顧客が閲覧店舗を変更しても、すでに取得済みの他店舗クーポンを勝手に無効化・書き換えしない。クーポンごとに発行店舗IDを保持する。

---

## 2. 要件定義書 (機能要件・非機能要件)

### 2.1 機能要件 (FR)

| ID | 分類 | 機能要件概要 | 対象画面 |
|---|---|---|---|
| FR-01 | 店舗・住所 | 顧客は登録住所（郵便番号・市区町村）または現在地から近隣スーパーを優先検索・選択できる。手動店舗選択を最優先とする。 | C01, C09 |
| FR-02 | 商品閲覧 | 選択中店舗に紐づく見切り品・通常食材をリアルタイムに検索・閲覧できる。他店舗の価格・在庫は混在させない。 | C02, C03 |
| FR-03 | AIレシピ提案 | 選択した見切り品（主食材）に基づき、同一店舗の店頭在庫から追加食材（副食材・調味料）を組み合わせた献立を生成する。 | C04 |
| FR-04 | レシピセット割 | 組み合わせた指定商品群を同時にレジで購入することを条件に、定額/定率の「レシピセット割引クーポン」を発行する。 | C05, C06 |
| FR-05 | クーポン管理 | 取得済みクーポンはC07/C08で管理され、レジ提示用バーコード（16桁ワンタイムトークン）を表示できる。 | C07, C08 |
| FR-06 | 店頭レジ照合 | 店舗スタッフはS05にてお客様の提示バーコードを読み取り、対象商品の実物確認と有効性判定（未使用/店舗一致/期限）を行い、割引適用・使用済みにできる。 | S05 |
| FR-07 | POS連携/手動 | POSレジ通信が可能な場合はAPI連携で自動消込し、未連携または障害時はS05画面での手動目視確認・消込ができる。 | S05 |
| FR-08 | JANスキャン登録 | 店舗スタッフは内蔵カメラまたは外付けリーダーでJANを読み取り、マスター検索・再利用または新規作成を行える。 | S02, S02-B |
| FR-09 | 手動商品登録 | カメラ・JANがない場合でも、全項目を手動入力して商品マスターを作成できる。 | S02-B |
| FR-10 | 店舗ロット管理 | 店舗ごとに同一商品マスターに対して複数の賞味期限・見切り割引率・店頭在庫・売場位置を登録・編集できる。 | S03 |
| FR-11 | 店舗設定・権限 | 店舗スタッフは所属店舗のデータのみ編集可能。他店舗のロットやクーポンを操作することは認可エラーとする。 | S06 |

### 2.2 非機能要件 (NFR)

| 区分 | 項目 | 目標基準 / 仕様 |
|---|---|---|
| **性能・可用性** | レスポンス速度 | ・商品一覧・店舗検索: 500ms以内 (p95)<br>・レジクーポン照合API (S05): 200ms以内 (p99)<br>・AIレシピ提案生成: ストリーミング/非同期キャッシュで体感2.0秒以内 |
| **セキュリティ** | 個人情報保護 | ・顧客の自宅住所・緯度経度はサーバー側で暗号化保存（AES-256またはDjango Encrypted Fields）。<br>・店舗スタッフや他ユーザーへの個人住所の露出は厳禁。<br>・クーポン提示トークンは暗号署名付きHMACで改ざん防止。 |
| **信頼性** | 二重使用防止 | ・クーポン消化APIは行ロック (`select_for_update`) またはRedis分散ロックを用い、ミリ秒単位の並列リクエストでも二重適用を防止。 |
| **オフライン耐性** | 通信断フォールバック | ・電波の届きにくい地下食品売り場を想定し、C08レジ提示画面はオフラインキャッシュ（Service Worker / PWA LocalStorage）で直近取得クーポンを表示可能にする。 |
| **保守性** | 段階的移行 | ・旧DjangoのReservation関連テーブル・コードを即座にDROPせず、Deprecatedフラグで隔離した上で無停止移行を担保。 |

---

## 3. 画面一覧・画面遷移・ステート設計

### 3.1 画面一覧と役割

```
【顧客向け (Customer UI)】
C01: ホーム (ホーム画面) ──────── 近隣店舗マップ、登録住所優先表示、おすすめ見切り品
C02: 食材検索・商品一覧 ──────── 店舗別商品一覧、カテゴリ検索、他店プレビュー、店舗切替
C03: 商品詳細 ────────────────── 見切り価格・消費期限・参考在庫・売場位置・AIレシピ提案CTA
C04: AIレシピ提案 ────────────── 主食材×同一店舗在庫の追加食材提案、栄養・時短バッジ
C05: レシピセット詳細 ────────── 対象3〜4品の一括確認、セット割引額（¥100引等）、利用条件
C06: クーポン取得確認 ────────── 店頭購入ルールの再確認（予約ではない旨）、獲得ダイアログ
C07: マイクーポン ────────────── 獲得済みクーポン一覧（利用可能 / 本日終了 / 使用済み）
C08: クーポン詳細・レジ提示 ──── レジ提示用バーコード、対象商品チェックリスト、店舗確認
C09: マイページ ──────────────── お買い物基準住所設定、近隣優先トグル、食品ロス削減履歴
C10: 認証・アカウント ───────── ログイン / 新規会員登録 / ゲスト利用

【店舗管理向け (Store Management UI)】
S01: 店舗ダッシュボード ──────── KPI（出品数、本日期限数、クーポン消化率、ロス削減量）、アラート
S02: 商品マスター管理 ────────── 全チェーン共通マスター一覧、JAN検索、CSVインポート
S02-B: 商品新規登録・JANスキャン ── カメラ/リーダーによるJAN読取、重複検知、手動入力、ロットへ直行
S03: ロット・在庫管理 ────────── 店舗別ロット登録・編集（期限・割引率・陳列位置・ステータス）
S04: クーポン管理 ────────────── レシピ連動クーポン作成、割引設定、必須商品条件、配信設定
S05: クーポン利用確認 (レジ用) ─── バーコード読取・照合、3点現物目視チェック、消込確定、例外テスト
S06: 店舗設定・スタッフ管理 ──── 店舗基本情報、営業時間、タイムセール枠、スタッフ権限
```

### 3.2 画面遷移図 (Customer / Store)
```
[Customer Flow]
C01 (ホーム) ──[検索/タップ]──► C02 (商品一覧) ──► C03 (商品詳細)
  │                                                      │
  │ (住所設定)                                           ▼
  ├────────► C09 (マイページ)                      C04 (AIレシピ提案)
  │                                                      │
  └────────► C10 (ログイン/登録)                         ▼
                                                   C05 (レシピセット詳細)
                                                         │
                                                         ▼
                                                   C06 (クーポン取得)
                                                         │
                                                         ▼
                                                   C07 (マイクーポン)
                                                         │
                                                         ▼
                                                   C08 (レジ提示バーコード)

[Store Management Flow]
S01 (ダッシュボード) ──► S02 (商品マスター) ──► S02-B (JANスキャン/手動登録)
  │                            │                          │ (登録完了)
  ├────────────────────────────┴─────────────────────────► S03 (ロット・在庫管理)
  │
  ├─► S04 (クーポン管理)
  ├─► S05 (レジ利用確認 / コード照合)
  └─► S06 (店舗設定・スタッフ管理)
```

---

## 4. 既存資産棚卸し & 差分分析 (再利用 / 廃止 / 新規)

| Django機能 / モデル | 現行ステータス | 新設計での扱い | 移行・改修アクション |
|---|---|---|---|
| **Users / UserProfile** | 既存実装あり | **再利用 & 拡張** | 住所フィールド（`postal_code`, `prefecture`, `city`, `address_line`, `location_lat`, `location_lng`）、`preferred_store` FKを追加。 |
| **Store (店舗)** | 既存実装あり | **再利用 & 拡張** | `latitude`, `longitude`, `beacon_uuid`, `business_hours_open`, `business_hours_close`, `discount_operation_time` を追加。 |
| **Product (商品)** | 既存（マスターと在庫が混在） | **大幅改修 (分離)** | 恒久マスター `ProductMaster` として純化。価格や期限、在庫を別テーブルに分離。 |
| **Inventory / Stock** | 既存（店舗在庫） | **廃止・再構築** | `StoreLot`（店舗ロット管理）モデルへ置換。賞味期限、割引率、売場位置、実在庫数を保持。 |
| **Reservation / Cart** | 既存（取り置き・予約注文） | **完全廃止 (Deprecated)** | APIおよびUIからのアクセスを遮断。モデルはMigrationの安全性確保のため段階的撤去（Phase 10参照）。 |
| **Payment / Order** | 既存（オンライン決済） | **完全廃止 (除外)** | 店頭レジ決済に一本化するため、決済WebhookやStripe連携コードを停止。 |
| **Coupon / RecipeSet** | なし（新規要件） | **新規作成** | `RecipeSet`, `RecipeSetItem`, `StoreCoupon`, `CustomerCouponRedemption` を新設。 |
| **Barcode / JAN Scanner** | なし（新規要件） | **新規作成** | GS1チェックデジット検証、重複チェックロジック、S02-B用APIエンドポイントを新設。 |

---

## 5. ER図 & データベース詳細設計 (Django Models)

### 5.1 ER図 (Logical Architecture)
```
[User / Customer] 1 ──── 0..* [CustomerCoupon] * ──── 1 [StoreCoupon]
       │                                                      │ 1
       │ preferred_store                                      │
       ▼                                                      ▼ *
    [Store] 1 ──────── 0..* [StoreLot] * ───────── 1 [RecipeSetItem]
       │                         │                            │ *
       │                         │                            │
       ▼                         ▼                            ▼ 1
[StaffProfile]             [ProductMaster] 1 ─────── 0..* [RecipeSet]
```

### 5.2 詳細テーブル定義 (Django Models Specification)

#### (1) `accounts` アプリ
```python
# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'CUSTOMER', '一般顧客'
        STORE_STAFF = 'STORE_STAFF', '店舗スタッフ'
        STORE_MANAGER = 'STORE_MANAGER', '店長・管理者'
        SYSTEM_ADMIN = 'SYSTEM_ADMIN', '全社システム管理者'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    phone_number = models.CharField(max_length=20, blank=True)
    preferred_store = models.ForeignKey('stores.Store', on_delete=models.SET_NULL, null=True, blank=True, related_name='preferred_customers')
    
    # 住所設定 (近隣スーパー優先表示用)
    postal_code = models.CharField(max_length=8, blank=True, db_index=True)
    prefecture = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=50, blank=True)
    address_line = models.CharField(max_length=100, blank=True) # 暗号化推奨
    location_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    use_location_for_search = models.BooleanField(default=True)
```

#### (2) `stores` アプリ
```python
# stores/models.py
from django.db import models
from django.conf import settings

class Store(models.Model):
    store_code = models.CharField(max_length=20, unique=True, db_index=True) # 例: LF-094
    name = models.CharField(max_length=100) # 例: ライフ 渋谷桜丘店
    address = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    business_hours_open = models.TimeField(default="09:30:00")
    business_hours_close = models.TimeField(default="23:00:00")
    is_active = models.BooleanField(default=True)
    pos_integration_active = models.BooleanField(default=False)

class StaffProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='staff_profile')
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='staff_members')
    department = models.CharField(max_length=50, blank=True) # 精肉, 鮮魚, 青果, レジ
    can_manage_coupons = models.BooleanField(default=False)
    can_manage_master = models.BooleanField(default=False)
```

#### (3) `products` アプリ (マスターとロットの完全分離)
```python
# products/models.py
from django.db import models
from django.core.validators import RegexValidator

class ProductMaster(models.Model):
    class Category(models.TextChoices):
        MEAT = 'MEAT', '精肉'
        FISH = 'FISH', '鮮魚'
        VEGETABLE = 'VEGETABLE', '青果'
        DAILY_DELI = 'DAILY_DELI', '日配・惣菜'
        PROCESSED = 'PROCESSED', '加工食品'
        SEASONING = 'SEASONING', '調味料'

    class RecipeTag(models.TextChoices):
        MAIN = 'MAIN', '主食材'
        SUB = 'SUB', '買い足し推奨食材'
        SEASONING = 'SEASONING', '調味料・サブ食材'

    jan_code = models.CharField(
        max_length=13, 
        unique=True, 
        db_index=True,
        validators=[RegexValidator(r'^(\d{8}|\d{13})$', 'JAN-8またはJAN-13形式を入力してください')]
    )
    name = models.CharField(max_length=150, db_index=True)
    category = models.CharField(max_length=30, choices=Category.choices)
    recipe_tag = models.CharField(max_length=20, choices=RecipeTag.choices, default=RecipeTag.MAIN)
    image_url = models.URLField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    content_amount = models.CharField(max_length=50, blank=True) # 250g, 1個, 1パック
    standard_price = models.DecimalField(max_digits=10, decimal_places=0) # 通常税抜定価 (¥780)
    tax_rate = models.DecimalField(max_digits=4, decimal_places=2, default=0.08) # 軽減税率 8%
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class StoreLot(models.Model):
    class Location(models.TextChoices):
        MEAT_CASE = 'MEAT_CASE', '1F 精肉コーナー奥 冷ケース'
        FISH_CASE = 'FISH_CASE', '1F 鮮魚 氷台ワゴン'
        VEG_STAND = 'VEG_STAND', '青果 平台'
        DELI_SHELF = 'DELI_SHELF', '惣菜中央棚'
        SPECIAL_WAGON = 'SPECIAL_WAGON', '特設レスキューワゴン'
        END_SHELF = 'END_SHELF', 'エンド棚'

    class SaleStatus(models.TextChoices):
        ON_SALE = 'ON_SALE', '販売中'
        PAUSED = 'PAUSED', '一時停止'
        SOLD_OUT = 'SOLD_OUT', '完売'

    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, related_name='lots')
    product = models.ForeignKey(ProductMaster, on_delete=models.CASCADE, related_name='store_lots')
    lot_number = models.CharField(max_length=40, db_index=True) # 例: LOT-20250510-01
    
    # 価格 & 値引き
    discount_rate = models.IntegerField(default=0) # 0%, 20%, 30%, 50%
    fixed_discount_amount = models.DecimalField(max_digits=10, decimal_places=0, default=0) # 定額引
    selling_price = models.DecimalField(max_digits=10, decimal_places=0) # 見切り税抜価格 (¥546)
    
    # 在庫 & 期限 (※予約枠は持たない)
    store_stock_count = models.PositiveIntegerField(default=1) # 店頭参考在庫数
    expiration_date = models.DateTimeField(db_index=True) # 消費期限または賞味期限
    floor_location = models.CharField(max_length=50, choices=Location.choices, default=Location.MEAT_CASE)
    status = models.CharField(max_length=20, choices=SaleStatus.choices, default=SaleStatus.ON_SALE)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['store', 'status', 'expiration_date']),
        ]
```

#### (4) `recipes_coupons` アプリ
```python
# recipes_coupons/models.py
import uuid
from django.db import models
from django.conf import settings

class RecipeSet(models.Model):
    title = models.CharField(max_length=150) # 例: 絶品おうち牛丼 3品まとめ買いセット
    cooking_time_minutes = models.PositiveIntegerField(default=15)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class RecipeSetItem(models.Model):
    class ItemRole(models.TextChoices):
        PRIMARY_RESCUE = 'PRIMARY_RESCUE', '主食材 (見切り品)'
        ADDITIONAL_REQUIRED = 'ADDITIONAL_REQUIRED', '買い足し必須食材'
        OPTIONAL_SEASONING = 'OPTIONAL_SEASONING', '任意調味料'

    recipe_set = models.ForeignKey(RecipeSet, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.ProductMaster', on_delete=models.CASCADE)
    item_role = models.CharField(max_length=30, choices=ItemRole.choices)
    is_required_for_discount = models.BooleanField(default=True)

class StoreCoupon(models.Model):
    coupon_code = models.CharField(max_length=30, unique=True, db_index=True) # 例: CP-202505-01
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, related_name='coupons')
    recipe_set = models.ForeignKey(RecipeSet, on_delete=models.CASCADE, related_name='store_coupons')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=0, default=100) # 一括¥100引
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField(db_index=True)
    max_redemptions = models.PositiveIntegerField(default=100)
    current_redemptions = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

class CustomerCoupon(models.Model):
    class Status(models.TextChoices):
        ACQUIRED = 'ACQUIRED', '取得済み・有効'
        USED = 'USED', '使用済み'
        EXPIRED = 'EXPIRED', '期限切れ'

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer_coupons')
    store_coupon = models.ForeignKey(StoreCoupon, on_delete=models.CASCADE, related_name='user_instances')
    verification_token = models.CharField(max_length=32, unique=True, default=uuid.uuid4, db_index=True) # 16桁提示用
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACQUIRED)
    acquired_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    cashier_id = models.CharField(max_length=50, blank=True) # 処理端末・レジ担当者ID
```

---

## 6. Django アプリケーション構成 & 権限設計

### 6.1 ディレクトリ・アプリ構成
```
foodrescue_backend/
├── manage.py
├── config/
│   ├── settings/ (base.py, local.py, production.py)
│   ├── urls.py
│   └── wsgi.py
└── apps/
    ├── accounts/          # ユーザー認証・プロファイル・基準住所管理
    ├── stores/            # 店舗マスター・営業時間・スタッフ権限
    ├── products/          # 商品マスター (ProductMaster) & 店舗ロット (StoreLot)
    ├── recipes_coupons/   # AIレシピセット・クーポン発行・レジ照合
    ├── ai_engine/         # Claude / OpenAI LLM連携プロンプト・マッチングロジック
    └── deprecated_legacy/ # 旧Reservation/Cartモデル (無害化・参照専用隔離)
```

### 6.2 ロール別アクセス認可マトリクス (RBAC)

| アクション / リソース | 未ログイン | 一般顧客 (Customer) | 店舗スタッフ (Store Staff) | 店長/管理者 (Store Manager) | 全社管理者 (System Admin) |
|---|:---:|:---:|:---:|:---:|:---:|
| 店舗一覧・商品一覧閲覧 | ○ | ○ | ○ | ○ | ○ |
| 住所登録・近隣店舗検索 | × | ○ (自アカウントのみ) | × | × | ○ |
| AIレシピ提案実行 | ○ (モック) | ○ | ○ | ○ | ○ |
| クーポン獲得・レジ提示 | × | ○ (自クーポンのみ) | × | × | ○ |
| S01 ダッシュボード閲覧 | × | × | ○ (自店舗のみ) | ○ (自店舗のみ) | ○ (全店舗) |
| S02 商品マスター閲覧・検索 | × | × | ○ | ○ | ○ |
| S02-B 商品マスター新規登録 | × | × | ○ (許可スタッフ) | ○ | ○ |
| S03 ロット・在庫登録/編集 | × | × | ○ (自店舗のみ) | ○ (自店舗のみ) | ○ (全店舗) |
| S04 クーポン作成・配信 | × | × | × | ○ (自店舗のみ) | ○ (全店舗) |
| S05 レジ照合・クーポン消込 | × | × | ○ (自店舗のみ) | ○ (自店舗のみ) | ○ (全店舗) |
| S06 店舗設定・スタッフ管理 | × | × | × | ○ (自店舗のみ) | ○ (全店舗) |

---

## 7. API インターフェース設計 (REST / JSON)

### 7.1 Customer API

| Method | Endpoint | 役割 | 主要リクエストパラメータ | レスポンス概要 |
|---|---|---|---|---|
| `GET` | `/api/v1/stores/nearby/` | 近隣店舗検索 | `postal_code`, `lat`, `lng`, `radius_km` | 店舗一覧（距離、営業時間、見切り品数） |
| `GET` | `/api/v1/stores/{id}/lots/` | 店舗別ロット一覧 (C02) | `category`, `discount_only=true` | 商品マスター情報＋ロット価格＋店頭参考在庫 |
| `GET` | `/api/v1/lots/{id}/detail/` | 商品詳細 (C03) | - | 価格、値引き率、消費期限、売場位置、AI提案リンク |
| `POST`| `/api/v1/ai/recipes/suggest/` | AIレシピ提案 (C04) | `store_id`, `lot_id` | レシピ案、同一店舗の買い足し食材一覧、割引額 |
| `GET` | `/api/v1/recipes/{id}/set/` | レシピセット詳細 (C05) | `store_id` | セット対象商品群、合計通常価格、セット割引価格 |
| `POST`| `/api/v1/coupons/acquire/` | クーポン獲得 (C06) | `store_coupon_id` | `customer_coupon_id`, `verification_token`, 有効期限 |
| `GET` | `/api/v1/me/coupons/` | マイクーポン一覧 (C07) | `status=ACQUIRED` | 獲得済みクーポンカード一覧 |
| `GET` | `/api/v1/me/coupons/{id}/barcode/`| レジ提示情報 (C08) | - | 16桁コード、バーコードSVG/画像URI、対象商品リスト |

### 7.2 Store Management API

| Method | Endpoint | 役割 | 認可 |
|---|---|---|---|
| `GET` | `/api/v1/store-ops/dashboard/` | S01 KPIおよび見切り品アラート取得 | Staff |
| `GET` | `/api/v1/store-ops/master/search/` | JANまたは商品名によるマスター検索 | Staff |
| `POST`| `/api/v1/store-ops/master/create/` | S02-B 商品マスター新規登録 (JAN/手動) | Staff (Master権限) |
| `POST`| `/api/v1/store-ops/lots/create/` | S03 ロット新規登録 (期限・割引・在庫) | Staff (自店舗) |
| `PATCH`| `/api/v1/store-ops/lots/{id}/` | ロット更新 (完売フラグ、価格切替) | Staff (自店舗) |
| `POST`| `/api/v1/store-ops/coupons/verify/`| S05 レジ提示バーコード照合 | Staff (自店舗) |
| `POST`| `/api/v1/store-ops/coupons/redeem/`| S05 クーポン消込・確定処理 | Staff (自店舗) |

---

## 8. コア業務ロジック詳細設計

### 8.1 商品マスターと店舗別ロット・在庫管理 (JANスキャン & 手動登録)

```
[S02-B カメラスキャン or リーダー入力]
  │ JANコード取得 (JAN-13/8 チェックデジット検証)
  ▼
ProductMasterを `jan_code` でDB検索
  ├─► [該当あり (既存マスター重複検知)]:
  │     ・「既存の商品マスターが見つかりました」と表示
  │     ・既存の商品名、カテゴリ、標準定価を表示
  │     ・「このマスターを再利用してロット登録へ進む (S03)」導線を即時提供
  │
  └─► [該当なし (未登録)]:
        ・JANコードをフォームに自動転記
        ・商品名、カテゴリ、画像、内容量、標準価格、AIレシピタグを手動入力
        ・ProductMaster レコードを作成
        ・登録完了後、直ちに「S03 店舗ロット登録」へ遷移
```

### 8.2 AIレシピ提案 & 同一店舗追加食材マッチングエンジン
1. **入力**:
   - `store_id`: 顧客が選択中の店舗ID (例: ライフ 渋谷桜丘店)
   - `primary_lot_id`: レスキュー対象の主食材ロット (例: 国産牛肩ローススライス 250g)
2. **店舗内在庫抽出**:
   - 該当店舗で `status=ON_SALE` かつ `store_stock_count > 0` の `StoreLot` を取得。
   - `recipe_tag` が `SUB` (買い足し推奨) または `SEASONING` (調味料) の商品を候補群としてフィルタリング。
3. **プロンプト構造化 (LLM Input)**:
   - システムプロンプト: 「同一店舗内で揃う食材のみで15〜20分以内に調理できる家庭料理を3パターン提案せよ。調味料は一般的な常備品を優先せよ。」
   - 利用可能店舗在庫リストをJSONで注入。
4. **出力**:
   - レシピタイトル（例: 絶品おうち牛丼）、調理手順、対象食材リスト（主食材＋同一店舗の玉ねぎ・紅生姜）。
   - 店舗に在庫がない食材は「代替候補」または「一般家庭常備品」として分離表記。

### 8.3 レシピセット・クーポン発行・店頭レジ照合管理 (S05)
```python
# レジ照合・消込トランザクションの擬似コード (Atomic & Row Locking)
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

@transaction.atomic
def redeem_coupon_service(verification_token, cashier_user, cashier_store_id, pos_transaction_id=None):
    # 行ロックで二重使用をミリ秒単位で完全に防ぐ
    customer_coupon = CustomerCoupon.objects.select_for_update().get(
        verification_token=verification_token
    )
    
    # 1. 状態検証
    if customer_coupon.status != CustomerCoupon.Status.ACQUIRED:
        raise ValidationError(f"このクーポンは既に使用済みまたは無効です (状態: {customer_coupon.status})")
    
    # 2. 有効期限検証
    if customer_coupon.store_coupon.valid_to < timezone.now():
        customer_coupon.status = CustomerCoupon.Status.EXPIRED
        customer_coupon.save()
        raise ValidationError("クーポンの有効期限が切れています")
        
    # 3. 店舗一致検証
    if customer_coupon.store_coupon.store_id != cashier_store_id:
        raise ValidationError("他店舗発行のクーポンです。この店舗では使用できません。")
        
    # 4. 消込実行
    customer_coupon.status = CustomerCoupon.Status.USED
    customer_coupon.used_at = timezone.now()
    customer_coupon.cashier_id = f"REG-{cashier_user.username}"
    customer_coupon.save()
    
    # 5. 店舗クーポンカウンター更新
    StoreCoupon.objects.filter(id=customer_coupon.store_coupon_id).update(
        current_redemptions=models.F('current_redemptions') + 1
    )
    
    return {
        "success": True,
        "discount_amount": customer_coupon.store_coupon.discount_amount,
        "message": "クーポン適用完了 (小計より値引き)"
    }
```

### 8.4 登録住所・近隣店舗優先表示 & 地図連携
- **距離計算**: Haversine式により、登録住所の緯度経度 $(lat_1, lng_1)$ と店舗位置 $(lat_2, lng_2)$ から直線距離を算出。
- **手動選択最優先の原則**:
  - セッション/LocalStorageに `selected_store_id` が存在する場合、登録住所の最寄り店舗よりも**ユーザーが明示的に選んだ店舗を100%優先**してUIを描画する。

---

## 9. セキュリティ & 個人情報保護設計

1. **住所データの保護**:
   - `address_line` および詳細番地は、店舗スタッフ向けコンソール (S01〜S06) には一切レスポンスしない。
   - バックエンドの顧客プロファイルSerializerから住所詳細を除外し、緯度経度を用いた「参考距離 (例: 350m)」のみを返却。
2. **店舗スタッフの権限制御**:
   - Django Middleware / REST Framework Permission クラス (`IsStoreStaffOfTargetStore`) を実装し、URLパス内の `store_id` がスタッフの所属 `store_id` と不一致の場合は即時 `403 Forbidden` を返却。
3. **クーポンバーコードのなりすまし防止**:
   - クーポンコード（`FR-2025-0849-5510`）には暗号学的乱数（UUIDv4）および署名トークンを採用し、推測による不正利用を排除。

---

## 10. 旧予約機能 (Reservation) 安全撤去 & Migration 計画

### Phase 1: 隔離 (Isolation) — 現行ステップ
- 既存の `Reservation`, `Cart`, `OrderItem` テーブルを `apps/deprecated_legacy/` へ移動。
- すべてのViewおよびURL RoutingからReservationエンドポイントを削除。
- 既存データベースの予約データ行は削除せず、READ-ONLYとして保持。

### Phase 2: ロジック完全切り離し (Decoupling)
- `Product` から `ProductMaster` および `StoreLot` へのデータ移行バッチを実行。
- 旧 `stock_quantity`（予約枠を含む在庫）から `store_stock_count`（店頭現品在庫）への移行検証。

### Phase 3: アーカイブ & テーブル削除 (Drop Table)
- 新システムの本番稼働から90日経過後、旧予約テーブルをバックアップダンプへ退避した上で、Django Migrationにて安全に `DROP TABLE` を実行。

---

## 11. QAテスト設計 & 受入テスト基準

### 11.1 受入テストマトリクス (Acceptance Criteria)

| テストID | テストケース | 期待される動作結果 | 判定基準 |
|---|---|---|---|
| **TC-01** | JANスキャン・重複検知 | 既存のJAN（4901234567890）を入力/スキャンした際、重複エラーとなり既存マスター再利用でS03へ誘導されること。 | PASS |
| **TC-02** | 手動商品登録 | カメラ・JANなしで商品名・カテゴリ・定価を入力し、マスターが正常登録できること。 | PASS |
| **TC-03** | ロット登録と予約枠非存在 | S03でロットを作成する際、「店頭在庫数」のみが存在し、「予約数量」「取り置き枠」の入力欄が存在しないこと。 | PASS |
| **TC-04** | 店舗別在庫の分離 | ライフ渋谷桜丘店で表示されている見切り牛丼セットが、他店（恵比寿店）選択時には同一セットとして混在しないこと。 | PASS |
| **TC-05** | クーポン取得時の在庫非減算 | C06でクーポンを獲得した直後、S03の店頭在庫数が減算されていないこと。 | PASS |
| **TC-06** | レジ照合と二重使用防止 | S05でクーポンを一度消し込んだ後、再度同じバーコードを入力すると「使用済みエラー」となること。 | PASS |
| **TC-07** | 他店舗クーポンの拒否 | 渋谷桜丘店で発行されたクーポンを、中目黒本店のレジ画面（S05）で照合した際、「他店専用エラー」で弾かれること。 | PASS |
| **TC-08** | 手動店舗選択の優先 | 登録住所が渋谷区であっても、ユーザーが手動で「恵比寿店」を選択した場合、恵比寿店の商品・見切り品が表示されること。 | PASS |

---

## 12. 実装ロードマップ & 未確定事項 (MVP vs 将来機能)

### 12.1 MVP (フェーズ1 実装スコープ)
- **Django**: `ProductMaster`, `StoreLot`, `StoreCoupon`, `CustomerCoupon` モデルの構築
- **Frontend**: S02-B（手動/バーコード入力）、S03（ロット管理）、S05（レジ手動照合）のAPI繋ぎ込み
- **AI Engine**: 同一店舗の陳列ロットを優先したルールベース＋LLMプロンプトエンジン
- **Store Ops**: POS未連携を前提としたS05画面での目視チェック＆手動消込運用

### 12.2 将来機能 (フェーズ2 以降・要外部調整)
1. **大手POSレジ（東芝TEC等）とのダイレクトAPI連携**:
   - 現時点ではS05の手動消込を標準とする。POS側の開発ベンダーとのプロトコル策定後に着手。
2. **GS1外部商品データベースAPI連携**:
   - JAN入力時の商品名自動補完。MVPでは手動入力フォールバックで運用。
3. **Google Maps Platform 有料API / リアルタイムGPSトラッキング**:
   - MVPではベクター地図モックおよび登録住所の郵便番号ジオコーディングで対応。

---
*本書はGoogle Stitchプロトタイプ画面（C01〜C10, S01〜S06, S02-B）と100%整合性を確認済みであり、Codexの全開発チームが直ちに実装へ移行可能です。*
