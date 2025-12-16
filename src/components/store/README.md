# Store System Components

This folder contains all Store Management System components.

## Structure

- `StoreIndent/` - Store indent components
- `Indent/` - Indent components
- `PurchaseOrder/` - PO components
- `Items/` - Item management components
- `Stock/` - Stock components
- `VendorRate/` - Vendor rate update components
- `ThreePartyApproval/` - Three party approval components

## Usage

Import from storeApi:
```typescript
import { storeApi } from '../../services/storeApi';

// Get pending indents
const indents = await storeApi.getPendingIndents();

// Create indent
const result = await storeApi.createStoreIndent(data);
```





