"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default function SignIn() {
  const { data: session } = useSession();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleCheckboxChange = () => {
    setTermsAccepted(!termsAccepted);
  };

  return (
    <Card className="w-full sm:w-[448px] h-auto sm:min-h-[460px] flex flex-col">
      <CardHeader className="space-y-1">
        <CardTitle className="flex justify-center text-2xl">
          Connect your accounts
        </CardTitle>
        <CardDescription className="pt-2 text-center text-amber-700">
          Your Github and X accounts must use the same email address!
        </CardDescription>

        {((session?.user?.githubAuthenticated &&
          !session?.user?.twitterAuthenticated) ||
          (!session?.user?.githubAuthenticated &&
            session?.user?.twitterAuthenticated)) && (
          <CardDescription className="pt-2 text-center text-amber-700">
            You need to connect both accounts for this to work!
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="items-top flex space-x-2 mt-4">
          <Checkbox id="terms1" onClick={handleCheckboxChange} />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms1"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
            <p className="text-sm text-muted-foreground">
              You agree to our{" "}
              <Link href="/tc" className="underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/pp" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4">
        {session?.user?.githubAuthenticated ? (
          <Button
            variant="ghost"
            className="pointer-events-none border border-green-600 w-full"
          >
            <Icons.Github className="mr-2 h-4 w-4" />
            Github
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("github")}
            disabled={!termsAccepted}
          >
            <Icons.Github className="mr-2 h-4 w-4" />
            Github
          </Button>
        )}

        {session?.user?.twitterAuthenticated ? (
          <Button
            variant="ghost"
            className="pointer-events-none border border-green-600 w-full"
          >
            <Icons.Twitter className="mr-2 h-4 w-4" />X
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("twitter")}
            disabled={!termsAccepted}
          >
            <Icons.Twitter className="mr-2 h-4 w-4" />X
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
