import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-8 p-4 xl:grid xl:grid-cols-2 xl:gap-8 xl:p-24">
      <div className="xl:flex xl:items-start xl:justify-center">
        <div
          className="animate-pulse bg-black/50 rounded-xl relative h-[270px] mr-0 sm:mx-4 w-[566px] min-w-[566px]"
          style={{ transformStyle: "preserve-3d", overflow: "hidden" }}
        />
      </div>
      <div className="xl:flex xl:items-start xl:justify-center">
        <Card className="animate-pulse w-full sm:w-[448px] h-auto sm:h-[460px] min-h-[400px]" />
      </div>
    </div>
  );
}
