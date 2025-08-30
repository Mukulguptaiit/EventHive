import { Suspense } from "react";
import { getAllReviews } from "@/actions/venue-actions";
import { AdminReviews } from "@/components/admin/admin-reviews";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";

// Force dynamic rendering since this route uses authentication
export const dynamic = "force-dynamic";

interface AdminReviewsDataProps {
  searchParams: Promise<{ filter?: string }>;
}

async function AdminReviewsData({ searchParams }: AdminReviewsDataProps) {
  const result = await getAllReviews();
  if (!result.success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground text-center">
            {result.error || "You don't have permission to access this page."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Apply initial filter based on query params
  let initialRatingFilter = "ALL";
  const resolvedSearchParams = await searchParams;

  if (resolvedSearchParams?.filter === "low-rating") {
    initialRatingFilter = "2";
  }

  return (
    <AdminReviews
      reviews={result.data}
      initialRatingFilter={initialRatingFilter}
    />
  );
}

function LoadingReviews() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Review Management
          </CardTitle>
          <CardDescription>Loading reviews...</CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-16 animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-24 animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Review Management</h1>
        <p className="text-muted-foreground">
          Manage venue reviews and monitor platform quality.
        </p>
      </div>

      <Suspense fallback={<LoadingReviews />}>
        <AdminReviewsData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
