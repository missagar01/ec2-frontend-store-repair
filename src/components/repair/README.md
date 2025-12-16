# Repair System Components

This folder contains all Repair Management System components.

## Structure

- `RepairTasks/` - All repair task related components
- `RepairCheck/` - Repair check components
- `SentToVendor/` - Sent to vendor components
- `StoreIn/` - Store in components
- `Payment/` - Payment components
- `Dashboard/` - Repair dashboard components

## Usage

Import from repairApi:
```typescript
import { repairApi } from '../../services/repairApi';

// Get all tasks
const tasks = await repairApi.getAllTasks();

// Create task
const formData = new FormData();
formData.append('image', file);
const result = await repairApi.createTask(formData);
```





