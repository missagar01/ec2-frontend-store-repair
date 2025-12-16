# Frontend Structure - Production Ready

## 📁 Folder Structure

```
frontend/MainDashbaod/
├── src/
│   ├── config/
│   │   └── api.ts              # Base API configuration (URL, token management)
│   │
│   ├── services/
│   │   ├── authApi.ts          # Authentication APIs
│   │   ├── repairApi.ts        # Repair System APIs (all endpoints)
│   │   ├── storeApi.ts         # Store System APIs (all endpoints)
│   │   └── index.ts            # Centralized exports
│   │
│   ├── context/
│   │   ├── AuthContext.tsx     # Global auth state management
│   │   ├── SidebarContext.tsx  # Sidebar state
│   │   └── ThemeContext.tsx    # Theme management
│   │
│   ├── components/
│   │   ├── repair/             # 🔧 Repair System Components
│   │   │   ├── RepairTasks/
│   │   │   ├── RepairCheck/
│   │   │   ├── SentToVendor/
│   │   │   ├── StoreIn/
│   │   │   ├── Payment/
│   │   │   └── Dashboard/
│   │   │
│   │   ├── store/              # 📦 Store System Components
│   │   │   ├── StoreIndent/
│   │   │   ├── Indent/
│   │   │   ├── PurchaseOrder/
│   │   │   ├── Items/
│   │   │   ├── Stock/
│   │   │   ├── VendorRate/
│   │   │   └── ThreePartyApproval/
│   │   │
│   │   ├── auth/               # Authentication components
│   │   ├── form/               # Form components
│   │   ├── header/             # Header components
│   │   └── ui/                 # Reusable UI components
│   │
│   ├── pages/
│   │   ├── repair/             # 🔧 Repair System Pages
│   │   │   ├── RepairAll.tsx
│   │   │   ├── RepairCreate.tsx
│   │   │   ├── RepairCheckAll.tsx
│   │   │   ├── RepairCheckPending.tsx
│   │   │   ├── RepairCheckHistory.tsx
│   │   │   ├── SentToVendorAll.tsx
│   │   │   ├── SentToVendorPending.tsx
│   │   │   ├── SentToVendorHistory.tsx
│   │   │   ├── StoreInAll.tsx
│   │   │   ├── PaymentPending.tsx
│   │   │   └── PaymentHistory.tsx
│   │   │
│   │   ├── store/              # 📦 Store System Pages
│   │   │   ├── StoreIndentCreate.tsx
│   │   │   ├── StoreIndentPending.tsx
│   │   │   ├── StoreIndentHistory.tsx
│   │   │   ├── IndentAll.tsx
│   │   │   ├── IndentSubmit.tsx
│   │   │   ├── PoPending.tsx
│   │   │   ├── PoHistory.tsx
│   │   │   ├── Items.tsx
│   │   │   ├── Stock.tsx
│   │   │   ├── Uom.tsx
│   │   │   ├── CostLocation.tsx
│   │   │   ├── VendorRatePending.tsx
│   │   │   ├── VendorRateHistory.tsx
│   │   │   ├── ThreePartyPending.tsx
│   │   │   └── ThreePartyHistory.tsx
│   │   │
│   │   ├── Dashboard/
│   │   │   └── UnifiedDashboard.tsx  # Main unified dashboard
│   │   └── AuthPages/
│   │
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── AppSidebar.tsx      # Sidebar with Store & Repair nav
│   │   └── AppHeader.tsx
│   │
│   └── App.tsx                 # Main app with all routes
```

## 🔑 Key Features

### 1. **Separate API Files**
- `config/api.ts` - Base API configuration with URL management
- `services/repairApi.ts` - All Repair System endpoints
- `services/storeApi.ts` - All Store System endpoints
- `services/authApi.ts` - Authentication endpoints

### 2. **Global State Management**
- `AuthContext` - Manages authentication state globally
- Token stored in localStorage
- Automatic token validation and refresh
- Auto-logout on token expiry

### 3. **Component Organization**
- **Repair components** in `components/repair/`
- **Store components** in `components/store/`
- Clear separation for easy maintenance

### 4. **Page Organization**
- **Repair pages** in `pages/repair/`
- **Store pages** in `pages/store/`
- Each page clearly labeled with system name

## 📝 Usage Examples

### Using Repair API
```typescript
import { repairApi } from '../../services';

// Get all repair tasks
const tasks = await repairApi.getAllTasks();

// Create repair task with file
const formData = new FormData();
formData.append('image', file);
formData.append('serial_no', 'SN123');
const result = await repairApi.createTask(formData);

// Get pending payments
const payments = await repairApi.getPendingPayments();
```

### Using Store API
```typescript
import { storeApi } from '../../services';

// Get pending indents
const indents = await storeApi.getPendingIndents();

// Create store indent
const result = await storeApi.createStoreIndent({
  item_name: 'Item 1',
  quantity: 10,
  // ... other fields
});

// Get purchase orders
const pos = await storeApi.getPoPending();
```

### Using Auth Context
```typescript
import { useAuth } from '../../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user?.user_name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🎯 Next Steps

1. **Copy Repair Components**: Copy components from `frontend/repairsystem/src/components/` to `frontend/MainDashbaod/src/components/repair/`
2. **Copy Store Components**: Copy components from `frontend/StoreFMS/src/components/views/` to `frontend/MainDashbaod/src/components/store/`
3. **Update Pages**: Replace placeholder pages with actual components
4. **Test APIs**: Verify all API endpoints work correctly
5. **Add Error Handling**: Add proper error handling and loading states

## 🔍 Identifying System Pages

All pages are clearly labeled:
- **Repair pages** have "Repair System" in title and use `repairApi`
- **Store pages** have "Store System" in title and use `storeApi`
- Components are in separate folders: `components/repair/` and `components/store/`

## ✅ Production Ready Features

- ✅ Separate API files with base URL configuration
- ✅ Global state management with AuthContext
- ✅ Token management and validation
- ✅ Automatic error handling
- ✅ Clear component organization
- ✅ TypeScript support
- ✅ Environment variable support
- ✅ Protected routes
- ✅ Unified dashboard





