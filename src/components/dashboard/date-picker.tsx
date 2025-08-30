"use client";

import { useRouter } from "next/navigation";

interface DatePickerProps {
  facilityId: string;
  courtId: string;
  selectedDate: Date;
}

export function DatePicker({
  facilityId,
  courtId,
  selectedDate,
}: DatePickerProps) {
  const router = useRouter();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      router.push(
        `/dashboard/facilities/${facilityId}/courts/${courtId}/time-slots?date=${e.target.value}`,
      );
    }
  };

  return (
    <input
      type="date"
      className="rounded-md border px-3 py-2"
      value={selectedDate.toISOString().split("T")[0]}
      onChange={handleDateChange}
    />
  );
}
