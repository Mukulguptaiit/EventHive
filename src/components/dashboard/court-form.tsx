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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Clock, IndianRupee, Trophy } from "lucide-react";
import {
  createCourt,
  updateCourt,
  type CreateCourtData,
  type UpdateCourtData,
} from "@/actions/court-actions";

const courtSchema = z
  .object({
    name: z.string().min(2, "Court name must be at least 2 characters"),
    sportType: z.enum([
      "BADMINTON",
      "TENNIS",
      "SQUASH",
      "BASKETBALL",
      "FOOTBALL",
      "CRICKET",
      "TABLE_TENNIS",
      "VOLLEYBALL",
    ]),
    pricePerHour: z.number().min(0, "Price must be a positive number"),
    operatingStartHour: z
      .number()
      .min(0, "Start hour must be between 0 and 23")
      .max(23, "Start hour must be between 0 and 23"),
    operatingEndHour: z
      .number()
      .min(0, "End hour must be between 0 and 23")
      .max(23, "End hour must be between 0 and 23"),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.operatingStartHour < data.operatingEndHour, {
    message: "Start hour must be before end hour",
    path: ["operatingEndHour"],
  });

type CourtFormData = z.infer<typeof courtSchema>;

interface CourtFormProps {
  facilityId: string;
  initialData?: Partial<CourtFormData & { id: string }>;
  isEditing?: boolean;
}

const sportTypeOptions = [
  { value: "BADMINTON", label: "Badminton" },
  { value: "TENNIS", label: "Tennis" },
  { value: "SQUASH", label: "Squash" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "FOOTBALL", label: "Football" },
  { value: "CRICKET", label: "Cricket" },
  { value: "TABLE_TENNIS", label: "Table Tennis" },
  { value: "VOLLEYBALL", label: "Volleyball" },
];

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, "0")}:00`,
}));

export function CourtForm({
  facilityId,
  initialData,
  isEditing = false,
}: CourtFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CourtFormData>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: initialData?.name || "",
      sportType: initialData?.sportType || "BADMINTON",
      pricePerHour: initialData?.pricePerHour || 0,
      operatingStartHour: initialData?.operatingStartHour || 6,
      operatingEndHour: initialData?.operatingEndHour || 22,
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = async (data: CourtFormData) => {
    try {
      setLoading(true);

      if (isEditing && initialData?.id) {
        await updateCourt({
          ...data,
          id: initialData.id,
          facilityId,
        } as UpdateCourtData);
        toast.success("Court updated successfully");
        router.push(`/dashboard/facilities/${facilityId}/courts`);
      } else {
        await createCourt({
          ...data,
          facilityId,
        } as CreateCourtData);
        toast.success("Court created successfully");
        router.push(`/dashboard/facilities/${facilityId}/courts`);
      }
    } catch (error) {
      console.error("Error saving court:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save court",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about the court
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Court Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Court 1, Center Court"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sportTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-y-0 space-x-2 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Status</FormLabel>
                        <div className="text-muted-foreground text-sm">
                          Enable or disable this court for bookings
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Pricing & Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pricing & Operating Hours
              </CardTitle>
              <CardDescription>
                Set pricing and availability hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pricePerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Default Price per Hour
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? 0 : parseFloat(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="operatingStartHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hourOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingEndHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Time</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hourOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-muted text-muted-foreground rounded-lg p-3 text-sm">
                <p>
                  Operating hours:{" "}
                  {form.watch("operatingStartHour").toString().padStart(2, "0")}
                  :00 -{" "}
                  {form.watch("operatingEndHour").toString().padStart(2, "0")}
                  :00
                </p>
                <p className="mt-1">
                  Duration:{" "}
                  {form.watch("operatingEndHour") -
                    form.watch("operatingStartHour")}{" "}
                  hours daily
                </p>
              </div>
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
                ? "Update Court"
                : "Create Court"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
