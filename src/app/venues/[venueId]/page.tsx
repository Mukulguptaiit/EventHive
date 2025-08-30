import VenueDetails from "@/components/venue/VenueDetails";

interface VenueDetailPageProps {
  params: Promise<{
    venueId: string;
  }>;
}

export default async function VenueDetailsPage({
  params,
}: VenueDetailPageProps) {
  const { venueId } = await params;
  return <VenueDetails id={venueId} />;
}
