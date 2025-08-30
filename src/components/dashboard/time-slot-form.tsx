"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Clock, AlertTriangle } from "lucide-react";
import {
  createTimeSlot,
  updateTimeSlot,
  type CreateTimeSlotData,
  type UpdateTimeSlotData,
} from "@/actions/time-slot-actions";

const timeSlotSchema = z
  .object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    price: z.coerce.number().positive("Price must be positive").optional(),
    isMaintenanceBlocked: z.boolean().default(false),
    maintenanceReason: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(`${data.date}T${data.startTime}`);
      const end = new Date(`${data.date}T${data.endTime}`);
      return start < end;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

type TimeSlotFormData = z.infer<typeof timeSlotSchema>;

interface TimeSlotFormProps {
  courtId: string;
  facilityId: string;
  initialData?: Partial<TimeSlotFormData & { id: string }>;
  isEditing?: boolean;
}

export function TimeSlotForm({
  courtId,
  facilityId,
  initialData,
  isEditing = false,
}: TimeSlotFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Format initial data if editing
  const getInitialDate = () => {
    if (initialData?.id && isEditing) {
      // If we have actual time slot data, extract date from startTime
      return new Date().toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  };

  const getInitialStartTime = () => {
    if (initialData?.startTime) {
      return initialData.startTime;
    }
    return "09:00";
  };

  const getInitialEndTime = () => {
    if (initialData?.endTime) {
      return initialData.endTime;
    }
    return "10:00";
  };

  const form = useForm<TimeSlotFormData>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      date: getInitialDate(),
      startTime: getInitialStartTime(),
      endTime: getInitialEndTime(),
      price: initialData?.price,
      isMaintenanceBlocked: initialData?.isMaintenanceBlocked || false,
      maintenanceReason: initialData?.maintenanceReason || "",
    },
  });

  const watchMaintenanceBlocked = form.watch("isMaintenanceBlocked");

  const onSubmit = async (data: TimeSlotFormData) => {
    try {
      setLoading(true);

      // Convert date and time strings to Date objects
      const startTime = new Date(`${data.date}T${data.startTime}`);
      const endTime = new Date(`${data.date}T${data.endTime}`);

      if (isEditing && initialData?.id) {
        await updateTimeSlot({
          id: initialData.id,
          courtId,
          startTime,
          endTime,
          price: data.price,
          isMaintenanceBlocked: data.isMaintenanceBlocked,
          maintenanceReason: data.isMaintenanceBlocked
            ? data.maintenanceReason
            : undefined,
        } as UpdateTimeSlotData);
        toast.success("Time slot updated successfully");
      } else {
        await createTimeSlot({
          courtId,
          startTime,
          endTime,
          price: data.price,
          isMaintenanceBlocked: data.isMaintenanceBlocked,
          maintenanceReason: data.isMaintenanceBlocked
            ? data.maintenanceReason
            : undefined,
        } as CreateTimeSlotData);
        toast.success("Time slot created successfully");
      }

      router.push(
        `/dashboard/facilities/${facilityId}/courts/${courtId}/time-slots`,
      );
    } catch (error) {
      console.error("Error saving time slot:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save time slot",
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate time options (24-hour format)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Slot Details
              </CardTitle>
              <CardDescription>
                Set the date and time for the slot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          step="1800" // 30-minute intervals
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          step="1800" // 30-minute intervals
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price Field */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Custom Price (Optional)
                      <span className="text-muted-foreground ml-2 text-sm font-normal">
                        Leave empty to use court&apos;s default price
                      </span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                          ₹
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="e.g. 150.00"
                          className="pl-8"
                          {...field}
                          value={field.value || ""}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration Display */}
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">
                  Duration:{" "}
                  {(() => {
                    const startTime = form.watch("startTime");
                    const endTime = form.watch("endTime");
                    if (startTime && endTime) {
                      const start = new Date(`2000-01-01T${startTime}`);
                      const end = new Date(`2000-01-01T${endTime}`);
                      const diffMinutes =
                        Math.abs(end.getTime() - start.getTime()) / (1000 * 60);
                      const hours = Math.floor(diffMinutes / 60);
                      const minutes = diffMinutes % 60;
                      return `${hours}h ${minutes}m`;
                    }
                    return "0h 0m";
                  })()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Maintenance Settings
              </CardTitle>
              <CardDescription>
                Configure maintenance blocking if needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isMaintenanceBlocked"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-y-0 space-x-2 rounded-lg border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Block for Maintenance</FormLabel>
                      <div className="text-muted-foreground text-sm">
                        Block this time slot for maintenance or other purposes
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {watchMaintenanceBlocked && (
                <FormField
                  control={form.control}
                  name="maintenanceReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the reason for blocking this slot..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchMaintenanceBlocked && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Maintenance Block Active</p>
                      <p>
                        This time slot will not be available for booking while
                        blocked for maintenance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Time Slot"
                : "Create Time Slot"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
