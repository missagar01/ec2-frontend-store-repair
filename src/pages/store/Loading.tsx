import { Loader2 } from "lucide-react";

import StorePageShell from "./StorePageShell";
import { storeApi } from "../../services";

export default function Loading() {
  return (
    <StorePageShell
      icon={<Loader2 size={48} className="animate-spin text-blue-600" />}
      heading="Loading"
      subtext="Waiting for the store service to respond"
    >
      <p className="text-sm text-muted-foreground">
        The data stream is still warming up. Please wait a few seconds while we
        fetch the latest counts from Oracle.
      </p>
    </StorePageShell>
  );
}
