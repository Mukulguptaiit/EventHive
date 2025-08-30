import { Suspense } from "react";
import VenuesPage from "@/components/venue/VenuePage";
import { Loader2 } from "lucide-react";

function VenuesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-gray-600">Loading venues...</p>
        </div>
      </div>
    </div>
  );
}

export default function VenuePage() {
  return (
    <Suspense fallback={<VenuesLoading />}>
      <VenuesPage />
    </Suspense>
  );
}
