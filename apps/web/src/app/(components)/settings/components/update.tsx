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
    <div className="w-full">
      <div className="flex w-full flex-row justify-between">
        <Label>Automatically update</Label>
        <Switch
          defaultChecked={automaticallyUpdate}
          onCheckedChange={(e) => {
            startTransition(() => {
              setAutomaticallyUpdate(e);
            });
          }}
        />
      </div>
      <Label className="font-mono text-xs">
        Last update: {lastUpdate ? lastUpdate.toLocaleString() : "Unknown"}
      </Label>
    </div>
  );
}
