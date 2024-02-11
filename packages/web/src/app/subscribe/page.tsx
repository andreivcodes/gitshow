import { PriceMenu } from "@/components/subscribe/menu";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Subscribe() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) redirect("/signin");
  else return <PriceMenu currentSubscription={session.user.subscriptionPlan} />;
}
