import Link from "next/link";
import { Card } from "@/components/ui/card";

export default async function Feedback() {
  return (
    <div className="absolute -bottom-2 -right-2 xl:-bottom-4 xl:-right-4">
      <Card>
        <div className="pb-4 pr-4 pt-2 pl-2 xl:pb-8 xl:pr-8 xl:pt-4 xl:pl-4">
          <Link href="https://gitshow.canny.io/ideas-and-bugs" target="_blank">
            💡 Ideas and 🪲 Bugs
          </Link>
        </div>
      </Card>
    </div>
  );
}
