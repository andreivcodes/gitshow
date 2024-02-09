"use client";

import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export default function Update({
  automaticallyUpdate,
  lastUpdate,
  setAutomaticallyUpdate,
}: {
  automaticallyUpdate: boolean;
  lastUpdate: Date | null;
  setAutomaticallyUpdate: (update: boolean) => void;
}) {
  return (
    <div className="w-full">
      <div className="w-full flex flex-row justify-between">
        <Label>Automatically update</Label>
        <Switch
          defaultChecked={automaticallyUpdate}
          onCheckedChange={(e) => {
            setAutomaticallyUpdate(e);
          }}
        />
      </div>
      <Label>
        Last update: {lastUpdate ? lastUpdate.toLocaleString() : "Unknown"}
      </Label>
    </div>
  );
}
