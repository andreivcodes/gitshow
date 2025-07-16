"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTransition } from "react";
import { setAutomaticallyUpdate } from "../actions";

export default function Update({
  automaticallyUpdate,
  lastUpdate,
}: {
  automaticallyUpdate?: boolean;
  lastUpdate?: Date | null;
}) {
  const [_, startTransition] = useTransition();

  return (
    <div className="w-full space-y-2">
      <div className="flex w-full flex-row items-center justify-between gap-3">
        <div className="flex-1">
          <Label className="text-sm">Auto-update banner</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Last synced: {lastUpdate ? new Date(lastUpdate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit' 
            }) : "Never"}
          </p>
        </div>
        <Switch
          defaultChecked={automaticallyUpdate}
          onCheckedChange={(e) => {
            startTransition(() => {
              setAutomaticallyUpdate(e);
            });
          }}
        />
      </div>
    </div>
  );
}
