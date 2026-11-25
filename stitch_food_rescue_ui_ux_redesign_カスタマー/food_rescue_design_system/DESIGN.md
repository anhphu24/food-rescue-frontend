---
name: Food Rescue Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Noto Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 26px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-numeric-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  label-numeric-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
  label-badge:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
  label-caption:
    fontFamily: Noto Sans
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system establishes a **Clean Eco & Friendly** atmosphere, merging the utility of modern Japanese supermarkets with the clarity and tactility of a premium grocery experience.

### Core Character
- **Ethical & Fresh:** Promotes sustainable food-saving habits without feeling punitive or overly technical. Freshness, vitality, and cleanliness guide every surface.
- **Accessible & Trustworthy:** Designed for everyday shoppers across all demographics in Japan. It feels familiar, dependable, and swift during peak in-store grocery runs.
- **Action-Oriented Simplicity:** Pure in-store enablement. It rejects friction-heavy e-commerce steps (no reservations, no delivery, no online checkout) in favor of fast shelf discovery, dynamic discount visibility, and frictionless barcode scanning at the register.

### Visual Style
A blend of **Modern Japanese Functionalism** and **Tactile Minimalism**:
- Crisp white surfaces over soft, mist-tinted eco-canvas (`#F8FAF9`).
- Deliberate semantic color coding for swift price checks and environmental contributions.
- Micro-interactions that emphasize physical touch (smooth stepper controls, high-contrast barcode trays, and bold discount callouts).

## Colors

The palette is tuned specifically for quick visual scanning under supermarket lighting and on diverse mobile screens.

### Palette Architecture
- **Primary (`#059669` / Dark `#047857`):** Represents fresh produce, vitality, and ecological contribution. Used for primary interactive actions, selected states, and foundational brand surfaces.
- **Secondary / Warm Accent (`#F97316` / Dark `#EA580C`):** Highlights urgent monetary benefits—discounts, markdowns (見切り品), and special promotional coupons.
- **Tertiary / Eco Badge (`#10B981`):** Applied exclusively to food rescue impact milestones and sustainable product badges.
- **Discount & Expiry Alert (`#EF4444`):** Reserved for immediate action items—short-dated inventory (賞味期限近) and steep price reductions (e.g., 半額 50% OFF).
- **Surfaces & Grounds:**
  - Base Background: `#F8FAF9` (Soft organic mist, prevents glare).
  - Primary Surface: `#FFFFFF` (Pure white containers for product clarity).
  - Borders & Dividers: `#E2E8F0` (Delicate structure with zero visual weight).
- **Typography & Neutrals:**
  - Base Text: `#1E293B` (Deep slate, avoiding the harshness of pure black while maintaining crisp legibility).
  - Subtext & Meta: `#64748B` (Neutral slate for secondary weights and specifications).

## Typography

Typography prioritizes Japanese text readability at a glance, balanced with clear Western numerals (`Inter`) for instantaneous price recognition in physical aisles.

### Structural Rules
- **Japanese Legibility:** Built with `Noto Sans`, utilizing optical sizing that keeps kanji and kana legible on varied screen resolutions.
- **Price & Metrics Pairing:** Prices, discount percentages, and countdown hours strictly leverage `Inter` tabular figures for alignment in item lists and receipts.
- **Hierarchy:** High contrast between product names (Bold, Slate 900) and operational metadata (Medium, Slate 500) prevents eye fatigue during high-stimulus in-store visits.

## Layout & Spacing

A mobile-first, fluid architecture calibrated for one-handed operation while navigating store aisles with a shopping basket.

### Layout Rhythm
- **Mobile Foundation:** 1-column feeding into a compact 2-column card grid on mobile devices (`360px` to `480px`). Gutters contract to `0.75rem` (`12px`) and margins to `1rem` (`16px`) to maximize physical visual area for product images.
- **Tablet / Responsive Extension:** 3 to 4 columns fluid grid with `1rem` (`16px`) gutters and `1.5rem` (`24px`) margins.
- **Thumb Zone Anchoring:** Crucial utility controls—the Store Selector at the header, the in-store coupon drawer, and active shopping-list bar—are pinned within the natural lower and upper sweep zones of standard handsets.

## Elevation & Depth

Visual depth is conveyed through **subtle tonal layering** and **soft ambient containment**, maintaining an uncluttered, modern Japanese aesthetic.

### Depth Hierarchy
1. **Level 0 (Canvas Base):** `#F8FAF9`. Non-interactive backdrop.
2. **Level 1 (Surface Cards & Lists):** `#FFFFFF` paired with a delicate hairline border (`1px solid #E2E8F0`). Flat elevation in default states keeps the interface crisp and light.
3. **Level 2 (Active Overlays & Floating Steppers):** Soft ambient shadow with zero harshness: `0 4px 16px -2px rgba(30, 41, 59, 0.06), 0 2px 4px -1px rgba(30, 41, 59, 0.03)`.
4. **Level 3 (Modal Sheets & Barcode Trays):** High-focus interaction layers (such as the cashier barcode bottom-sheet) sit on elevated scrims with diffused upward drop-shadows (`0 -8px 24px -4px rgba(30, 41, 59, 0.10)`), accompanied by a translucent backdrop blur (`backdrop-filter: blur(8px)`).

## Shapes

The design system adopts a **Balanced Rounded** visual tone (`roundedness: 2`), delivering an approachable, friendly feel without compromising spatial efficiency.

### Application Standards
- **Cards & Surface Modules:** `0.75rem` (12px) to `1rem` (16px) corner radius, softening the presentation of packaged goods.
- **Badges & Micro-tags:** Fully rounded pill shapes (`9999px`) for discount rates, shelf tags, and eco labels to distinguish them from structural content.
- **Buttons & Steppers:** `0.5rem` (8px) for standard touch controls; fully rounded for floating counter controls.
- **Barcode Display Modules:** `1rem` (16px) containers with interior cutout notches to evoke the tactile appearance of physical vouchers.

## Components

Every component is fine-tuned exclusively for in-store physical purchase assistance and register checkout redemption.

### Product Card (Rescue Focus)
- **Visuals:** Edge-to-edge product photography topped with status tags at the upper-left (`見切り品`, `本日中`, `-30%`).
- **Data Cluster:** Prominent dual-price layout. Original price struck-through in `#64748B`, next to the rescue price highlighted in bold, elevated slate or orange.
- **Stock & Expiry Indication:** Clean micro-bars indicating remaining shelf quantity (e.g., `残り3点`) to drive timely purchasing.

### Badges & Status Indicators
- **Eco Rescue Badge:** `#10B981` background or soft tint with dark green text. Denotes CO₂ / food-loss prevention impact.
- **Discount & Markdown Badge:** High-visibility `#EF4444` (or deep `#EA580C`) background with white bold typography for immediate identification across aisles.
- **Best-Before Notice:** Pill-shaped, subtle amber/slate tint for exact expiry notices (`賞味期限: 18:00まで`).

### Quantity Stepper (In-Store Checklist)
- Pill-shaped container (`#F1F5F9`) with round tactile `+` and `−` buttons.
- Optimized target sizes (min 44×44px) for rapid tapping while walking.
- Used strictly for managing the personal in-store purchase list, not an online shopping cart.

### In-Store Coupon & Barcode Tray
- **Instant Shelf-to-Register Flow:** Accessible from an persistent sticky bottom drawer.
- **Register Display:** High-contrast, pure-white illuminated container housing the CODE128 or QR barcode with brightness boost triggers for rapid scanner reads at the physical register.
- **One-Tap Applicator:** Checkbox toggle or tab switcher to aggregate all eligible store discounts into a single master barcode.

### Store Selector (店舗切り替え)
- **Top Header Placement:** Displays current active supermarket branch (e.g., `ライフ 渋谷東店 ▼`).
- **Modal Switcher:** Distance-sorted list indicating active rescue deals count per store, allowing instant switching before entering the aisles.

### Excluded Paradigms
- No item hold/reservation flows.
- No delivery/shipping address logic.
- No online cart/in-app payment checkout mechanisms.
- No pickup lockers or fulfillment QR gates.