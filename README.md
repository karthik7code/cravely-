# Cravely — Reels to Meals 🥘

> **CYPHER 4.0 Hackathon Submission**
> Next-Generation Quick-Commerce: Discovering dishes through cooking videos, scaling exact ingredient grammages, matching local dark store inventory, and delivering in 10 minutes.

---

## 🌟 Product Vision & Architecture

Cravely transforms culinary video inspiration directly into instant grocery delivery.

```
Paste Reel Link ➔ Gemini AI Summarizes ➔ Auto-Scale Servings (2/4/6) ➔ Consumer Checklist ➔ 10-Min Delivery
```

The application provides three synchronized role interfaces:
1. **Customer Application**: Link-to-checklist extraction via Gemini AI, recipe summarizer (no YouTube embeds), signature **Recipe-to-Cart Engine** with mathematical servings scaling (`scaled = org × req / base`), consumer ingredient checklist with dark store stock matching, substitution options, persistent cart, address management, and live order tracking.
2. **Delivery Rider Application**: Mobile-first console optimized for one-hand operation with online/offline toggle, order dispatch requests, state-validated 5-step delivery workflow, and trip earnings.
3. **Admin Operations Dashboard**: Dark store command center with Recharts metrics (revenue, order velocity, category share), real-time live fleet tracking map, order pipeline transitions, and catalog stock/price management.

---

## 🔑 Key Features Demonstrated

### 1. Signature Recipe-to-Cart Engine
- **Mathematical Scaling**: Servings stepper recalculates ingredient weights precisely using `originalQuantity × requestedServings / originalServings`.
- **Catalogue Product Matching**: Every ingredient is linked directly to dark store SKUs.
- **Inventory Check & Substitutions**: Detects out-of-stock items and suggests alternatives (e.g., Organic Firm Tofu or Low-Fat Paneer for Malai Paneer).
- **Single-Click Batch Add**: Adds all selected ingredients into the persistent cart with source recipe attribution tags.

### 2. Live Interactive Delivery Map
- **Google Maps Platform Integration Layer**: Visualizes dark stores (Koramangala, Indiranagar, HSR Layout), customer drop location, route path, and animated rider GPS markers.
- **Dynamic Quick-Commerce ETA**: Calculates travel and prep time based on distance.

### 3. State-Validated Rider Console
- **Strict 5-Step Pipeline**: Riders cannot skip intermediate states:
  1. Arrived at Dark Store
  2. Packing & Verification
  3. Picked Up & Out for Delivery
  4. Delivered & Wallet Credit

### 4. Gemini AI Chef Assistant
- Real-time culinary advice for dietary modifications (vegan, gluten-free, dairy-free swaps), salt/spice level fixes, and cooking pro-tips.

---

## 🧪 CYPHER 4.0 Test Scenarios & Judge Walkthrough

Use the **Universal Role Switcher Bar** at the top of the screen to test each scenario:

1. **Watch & Cook Discovery**:
   - Go to "Watch & Cook". Click on *Restaurant Style Paneer Butter Masala*.
   - Watch the embedded video reel.
   - Change servings from 4 to 2 (or 6). Notice ingredient weights update instantly.
   - Click **"Add Ingredients to Cart"**.
2. **Persistent Cart & Checkout**:
   - Open cart via the header button. Check the itemized price breakdown.
   - Apply coupon `FIRST50` (or `CHEF20`).
   - Click "Proceed to Checkout", confirm address and payment method (UPI / Card / Cash on Delivery), and click "Pay & Confirm".
3. **Live Order Tracking**:
   - Observe the live vector map, dynamic ETA countdown, and status progression timeline.
   - Click the "Advance to Next Step" fast-forward button or switch to the Rider console.
4. **Rider Console Execution**:
   - Switch to **Rider App** using the top bar.
   - Toggle Online status.
   - Advance through "Arrived at Dark Store" ➔ "Collect Items" ➔ "Picked Up" ➔ "Mark Delivered".
   - Check the **Earnings** tab to see wallet credits.
5. **Admin Operations & Stock Mutation**:
   - Switch to **Admin Hub**.
   - Check KPI cards and Recharts analytics.
   - Under "Inventory", click "Edit Stock/Price" for any product (e.g. Tomatoes or Paneer). Modify values and verify they reflect instantly in the customer store!
