# Product Traceability, Marketplace & Recall Management System (MERN Stack)

A production-grade, multi-tier **Product Traceability, E-Commerce Marketplace & Automated Batch Recall Management System** built with **React.js, Node.js, Express.js, and MongoDB**.

---

## 🌟 Key System Architecture & Business Flow

```text
                         MANAGER (Manufacturer)
                            │
                       1. Adds Product + Batch No
                            │
                            ↓
                      PRODUCT INVENTORY (Batch)
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
          Shop 1          Shop 2         Shop 3 (Shop Inventories)
             │              │              │
             ↓              ↓              ↓
        Customers       Customers      Customers (Orders)
             │              │              │
             └──────────────┼──────────────┘
                            ↓
                    Manager Recalls Batch (e.g. POCO-B001)
                            │
                   ┌────────┴────────┐
                   ↓                 ↓
                 SHOPS           CUSTOMERS
                                     │
                                     ↓
                           Return Request to Original Purchase Shop
                                     │
                                     ↓
                                   SHOP
                                     │
                                     ↓
                            Return Recalled Items to Manager
                                     │
                                     ↓
                              Recall Completed
```

---

## 🚀 Features & Capabilities

### 1. 🏭 Manager Role (Manufacturer / Supplier)
- **Product & Batch Creation**: Add products with Name, Description, Image, Price, Batch Number, and Total Quantity.
- **Inventory Oversight**: Real-time tracking of manufactured stock vs. quantity distributed to Shops.
- **Shops Supplied Ledger**: View all retail Shops that purchased stock from your catalog.
- **Visual Batch Traceability Tree**: Search any Batch Number (e.g. `POCO-B001`) to inspect complete lineage:
  `Manager` → `Product` → `Batch` → `Shops` → `Customers` → `Orders` → `Recalls` → `Returns`.
- **Product Recall Dispatch**: Initiate a recall by entering a Batch Number and reason. Automatically triggers in-app notifications to all affected Shops and Customers.
- **Receive Returned Recalled Stock**: Receive and confirm returned recalled stock sent by Shops.

### 2. 🏪 Shop Role (Distributor / Retailer)
- **Supplier Purchasing**: Browse Manager supplier catalogs and purchase stock into independent Shop Inventory.
- **Independent Shop Inventory**: Maintain individual inventory levels (`availableQuantity` and `recalledQuantity` tracked separately).
- **Customer Sales**: Process Customer orders placed via the Marketplace.
- **Recall Alerts**: Receive immediate alert notifications when a Manager recalls a batch present in your inventory.
- **Customer Return Processing**: Accept or reject Customer return requests for recalled items.
- **Return to Manager**: Return collected recalled stock back to the original Manager.

### 3. 🛒 Customer Role (End Buyer)
- **Interactive E-Commerce Marketplace**: Browse products available in active Shop inventories.
- **3D Product Flip Cards**: Smooth 3D interactive flip card UI:
  - **Front**: Image, Product Name, Price, Shop Name, View Details button.
  - **Back**: Product Name, Price, Batch Number, Available Quantity, Shop Name, Buy Now button.
- **Search & Filters**: Search by Product Name or Batch Number; filter by Shop or Price Range.
- **Order Lineage**: Purchase products from a specific Shop. Orders retain full lineage metadata (`orderId`, `customerId`, `shopId`, `managerId`, `productId`, `batchNo`).
- **Recall Alerts & Returns**: Receive recall notices for purchased items and submit return requests strictly to the **original purchase Shop**.
- **Return Progress Pipeline**: Track return status (`PENDING` → `ACCEPTED_BY_SHOP` → `RETURNED_TO_MANAGER` → `RECEIVED_BY_MANAGER`).

---

## 🛠️ Technology Stack

- **Frontend**: React.js, React Router DOM, Axios, Lucide React Icons, Custom 3D CSS Transitions & Tailwind utility design system.
- **Backend**: Node.js, Express.js REST APIs, JWT Authentication, Bcrypt Password Hashing, Mongoose ODM.
- **Database**: MongoDB (`mern_traceability_recall`).

---

## 📂 Project Structure

```text
miniproject/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose connection config
│   ├── controllers/
│   │   ├── authController.js     # User registration & authentication
│   │   ├── productController.js  # Manager product creation & catalog
│   │   ├── shopController.js     # Shop stock purchases & inventory
│   │   ├── marketplaceController.js # Customer marketplace query
│   │   ├── orderController.js    # Customer order placement & lineage
│   │   ├── traceabilityController.js # Batch traceability search
│   │   ├── recallController.js   # Batch recall initiation & notifications
│   │   ├── returnController.js   # Customer -> Shop -> Manager return pipeline
│   │   └── notificationController.js # In-app notification system
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protection & role authorization
│   ├── models/
│   │   ├── User.js               # Manager, Shop, Customer accounts
│   │   ├── Product.js            # Manager product & batch schema
│   │   ├── ShopInventory.js      # Independent shop inventory schema
│   │   ├── ShopPurchase.js       # Shop stock acquisition history
│   │   ├── Order.js              # Customer order schema
│   │   ├── Recall.js             # Manufacturing recall records
│   │   ├── ReturnRequest.js      # Multi-tier return pipeline schema
│   │   └── Notification.js       # Notification center schema
│   ├── routes/
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── server.js                 # Express server entrypoint
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Role navigation & notification bell
    │   │   ├── ProductFlipCard.jsx # Smooth 3D product flip card
    │   │   └── ProtectedRoute.jsx# Role security guards
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Global auth state provider
    │   │   └── NotificationContext.jsx # Notification polling & badges
    │   ├── pages/
    │   │   ├── RegisterPage.jsx  # Multi-role user registration
    │   │   ├── LoginPage.jsx     # User sign in
    │   │   ├── ManagerDashboard.jsx # Manager inventory & recalls
    │   │   ├── ManagerTraceability.jsx # Visual batch lineage visualizer
    │   │   ├── ShopDashboard.jsx # Shop inventory, orders & returns
    │   │   ├── CustomerMarketplace.jsx # E-Commerce storefront with flip cards
    │   │   ├── CustomerDashboard.jsx # Customer orders & recall returns
    │   │   └── UnauthorizedPage.jsx
    │   ├── services/
    │   │   └── api.js            # Axios client with JWT interceptor
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css             # Design tokens & 3D flip card utilities
    ├── .env
    └── package.json
```

---

## ⚙️ Environment Setup

### Backend `.env` (`/backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern_traceability_recall
JWT_SECRET=super_secret_jwt_key_traceability_recall_2026
JWT_EXPIRE=1d
```

### Frontend `.env` (`/frontend/.env`)
```env
VITE_API_URL=/api
```

---

## 🧪 Step-by-Step Manual Testing Workflow

The system starts with an **empty database**. Follow this complete testing sequence:

### 1. Register Users
1. Open `http://localhost:5173/register`.
2. Register a **Manager**: Name: `Apex Manufacturers`, Email: `manager@apex.com`, Password: `Password@123`, Role: `Manager`.
3. Register a **Shop**: Name: `Metro Retailers`, Email: `shop@metro.com`, Password: `Password@123`, Role: `Shop`.
4. Register a **Customer**: Name: `Alex Morgan`, Email: `alex@customer.com`, Password: `Password@123`, Role: `Customer`.

### 2. Manager Creates Product with Batch Number
1. Sign in as Manager (`manager@apex.com`).
2. Add Product:
   - Product Name: `POCO X3`
   - Batch Number: `POCO-B001`
   - Price: `$200`
   - Total Quantity: `300`
3. Click **Create Product & Batch**.

### 3. Shop Purchases Stock from Manager
1. Sign in as Shop (`shop@metro.com`).
2. Select Manager `Apex Manufacturers` from the dropdown.
3. Select quantity `100` for `POCO X3` (Batch: `POCO-B001`).
4. Click **Purchase Stock**. Manager stock is reduced from 300 to 200.

### 4. Customer Purchases from Shop
1. Sign in as Customer (`alex@customer.com`).
2. Navigate to **Marketplace** (`http://localhost:5173/customer/marketplace`).
3. Click **"View Details"** on `POCO X3` card to flip the 3D card and view Batch `POCO-B001` information.
4. Click **"Buy Now"**, select quantity `2`, and confirm purchase. Shop available stock is reduced from 100 to 98.

### 5. Manager Views Visual Batch Traceability
1. Sign in as Manager (`manager@apex.com`).
2. Go to **Batch Traceability** (`/manager/traceability`) and search `POCO-B001`.
3. View the full visual lineage tree:
   `Manager (Apex Manufacturers)` → `POCO X3 (Batch: POCO-B001)` → `Shop (Metro Retailers, Stock: 98)` → `Customer (Alex Morgan, Purchased: 2 units)`.

### 6. Product Recall & Return Workflow
1. Manager enters Batch `POCO-B001` under **Product Recalls** tab and clicks **Broadcast Product Recall**.
2. Sign in as Customer (`alex@customer.com`) -> View **Recall Alert** notice for `POCO X3` with instructions to return to original shop (`Metro Retailers`). Click **Submit Return Request**.
3. Sign in as Shop (`shop@metro.com`) -> Under **Recall Alerts & Returns** tab, click **Accept** on Customer return request. Then click **Return to Manager**.
4. Sign in as Manager (`manager@apex.com`) -> Under **Returns Management** tab, click **Confirm Receipt** to complete the recall return pipeline.
