"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { setAutomaticallyUpdate, forceUpdateBanner } from "../actions";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export default function Update({
  automaticallyUpdate,
  lastUpdate,
}: {
  automaticallyUpdate?: boolean;
  lastUpdate?: Date | null;
}) {
  const [isPending, startTransition] = useTransition();

  const handleForceUpdate = () => {
    startTransition(async () => {
      toast.info("Updating banner...");
      const result = await forceUpdateBanner();
      if (result.success) {
        toast.success("Banner updated successfully!");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex w-full flex-row items-center justify-between gap-3">
        <div className="flex-1">
          <Label className="text-sm">Auto-update banner</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last synced:{" "}
            {lastUpdate
              ? new Date(lastUpdate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Never"}
          </p>
        </div>
        <Switch
          defaultChecked={automaticallyUpdate}
          onCheckedChange={(e) => {
            startTransition(async () => {
              const result = await setAutomaticallyUpdate(e);
              if (result.success) {
                toast.success(e ? "Auto-update enabled" : "Auto-update disabled");
              } else {
                toast.error(result.error);
              }
            });
          }}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleForceUpdate}
        disabled={isPending}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Updating..." : "Update Now"}
      </Button>
    </div>
  );
}
