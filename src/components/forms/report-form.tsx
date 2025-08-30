"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, Upload, X, AlertTriangle } from "lucide-react";
import { submitReport } from "@/actions/report-actions";
import type { CreateReportData } from "@/actions/report-actions";
import { toast } from "sonner";
import { ReportType } from "@/types/venue";

interface ReportFormProps {
  targetType: "user" | "facility";
  targetId: string;
  targetName: string;
  children?: React.ReactNode;
}

const REPORT_TYPES = {
  user: [
    { value: ReportType.USER_HARASSMENT, label: "Harassment" },
    {
      value: ReportType.USER_INAPPROPRIATE_BEHAVIOR,
      label: "Inappropriate Behavior",
    },
    { value: ReportType.USER_SPAM, label: "Spam" },
    { value: ReportType.OTHER, label: "Other" },
  ],
  facility: [
    {
      value: ReportType.FACILITY_INAPPROPRIATE_CONTENT,
      label: "Inappropriate Content",
    },
    {
      value: ReportType.FACILITY_FALSE_INFORMATION,
      label: "False Information",
    },
    { value: ReportType.FACILITY_SAFETY_CONCERN, label: "Safety Concern" },
    { value: ReportType.OTHER, label: "Other" },
  ],
};

const REPORT_TYPE_DESCRIPTIONS = {
  [ReportType.USER_HARASSMENT]:
    "Threatening, intimidating, or abusive behavior",
  [ReportType.USER_INAPPROPRIATE_BEHAVIOR]:
    "Inappropriate conduct or violations of community guidelines",
  [ReportType.USER_SPAM]: "Sending unsolicited messages or promotional content",
  [ReportType.FACILITY_INAPPROPRIATE_CONTENT]:
    "Offensive photos, descriptions, or content",
  [ReportType.FACILITY_FALSE_INFORMATION]:
    "Misleading information about amenities, pricing, or services",
  [ReportType.FACILITY_SAFETY_CONCERN]:
    "Safety hazards or dangerous conditions",
  [ReportType.OTHER]: "Other issues not covered by the above categories",
};

export function ReportForm({
  targetType,
  targetId,
  targetName,
  children,
}: ReportFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    type: string;
    reason: string;
    description: string;
    evidence: string[];
  }>({
    type: "",
    reason: "",
    description: "",
    evidence: [],
  });

  const reportTypes = REPORT_TYPES[targetType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.reason.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData: CreateReportData = {
        type: formData.type as ReportType,
        reason: formData.reason.trim(),
        description: formData.description.trim() || undefined,
        evidence: formData.evidence.filter((url) => url.trim()),
        [targetType === "user" ? "targetUserId" : "targetFacilityId"]: targetId,
      };

      const result = await submitReport(reportData);

      if (result.success) {
        toast.success(
          "Report submitted successfully. We will review it and take appropriate action.",
        );
        setOpen(false);
        setFormData({
          type: "",
          reason: "",
          description: "",
          evidence: [],
        });
      } else {
        toast.error(result.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEvidenceUrl = () => {
    setFormData((prev) => ({
      ...prev,
      evidence: [...prev.evidence, ""],
    }));
  };

  const updateEvidenceUrl = (index: number, url: string) => {
    setFormData((prev) => ({
      ...prev,
      evidence: prev.evidence.map((item, i) => (i === index ? url : item)),
    }));
  };

  const removeEvidenceUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50"
          >
            <Flag className="mr-2 h-4 w-4" />
            Report {targetType === "user" ? "User" : "Venue"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Report {targetType === "user" ? "User" : "Venue"}
          </DialogTitle>
          <DialogDescription>
            Report inappropriate content or behavior. We take all reports
            seriously and will investigate promptly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Reporting:</p>
                  <p className="text-muted-foreground text-sm">{targetName}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {targetType}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Report Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: string) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.type && (
              <p className="text-muted-foreground text-xs">
                {REPORT_TYPE_DESCRIPTIONS[formData.type as ReportType]}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Brief Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Provide a brief summary of the issue"
              maxLength={200}
            />
            <p className="text-muted-foreground text-xs">
              {formData.reason.length}/200 characters
            </p>
          </div>

          {/* Detailed Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Provide additional details about the issue"
              rows={3}
              maxLength={1000}
            />
            <p className="text-muted-foreground text-xs">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Evidence URLs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Evidence (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEvidenceUrl}
                className="text-xs"
              >
                <Upload className="mr-1 h-3 w-3" />
                Add URL
              </Button>
            </div>
            {formData.evidence.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => updateEvidenceUrl(index, e.target.value)}
                  placeholder="URL to screenshot or evidence"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeEvidenceUrl(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <p className="text-muted-foreground text-xs">
              Add URLs to screenshots or other evidence that supports your
              report
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !formData.type || !formData.reason.trim()
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
