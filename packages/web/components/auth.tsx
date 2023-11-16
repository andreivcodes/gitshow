import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Icons } from "./icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";

export function SignIn({
  githubSigned,
  twitterSigned,
}: {
  githubSigned?: boolean;
  twitterSigned?: boolean;
}) {
  return (
    <div className="flex justify-center">
      <Card className="flex flex-col justify-evenly">
        <CardHeader className="space-y-1">
          <CardTitle className="flex justify-center text-2xl">
            Connect your accounts
          </CardTitle>
          <CardDescription className="text-center pt-2">
            Your Github and X accounts must use the same email address!
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="grid md:grid-cols-2 gap-4">
            {githubSigned ? (
              <Button
                variant="ghost"
                className="pointer-events-none border-green-600"
              >
                <Icons.gitHub className="mr-2 h-4 w-4" />
                Github
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full p-0"
                onClick={() => signIn("github")}
              >
                <Icons.gitHub className="mr-2 h-4 w-4" />
                Github
              </Button>
            )}

            {twitterSigned ? (
              <Button
                variant="ghost"
                className="pointer-events-none border border-green-600"
              >
                <Icons.twitter className="mr-2 h-4 w-4" />X
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full p-0"
                onClick={() => signIn("twitter")}
              >
                <Icons.twitter className="mr-2 h-4 w-4" />X
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Settings() {
  const session = useSession();
  const router = useRouter();

  if (session.status === "authenticated")
    return (
      <div className="absolute mx-4 md:mx-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              <span className="sr-only">Actions</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(session.data.user.subscription_type == "free" ||
              session.data.user.subscription_type == "standard" ||
              session.data.user.subscription_type == "premium") && (
              <DropdownMenuItem
                onSelect={() =>
                  router.push(
                    "https://billing.stripe.com/p/login/test_00g4k22jXgO63MQdQQ"
                  )
                }
                className="text-red-700"
              >
                Cancel subscription
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onSelect={() => signOut()}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  else return <></>;
}
