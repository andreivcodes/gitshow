"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SignIn() {
  const { data: session } = useSession();
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleCheckboxChange = (e: any) => {
    setTermsAccepted(!termsAccepted);
  };

  return (
    <Card className="flex min-w-[300px] flex-col justify-evenly p-4">
      <CardHeader className="space-y-1">
        <CardTitle className="flex justify-center text-2xl">Connect your accounts</CardTitle>
        <CardDescription className="pt-2 text-center text-amber-700">
          Your Github and X accounts must use the same email address!
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 py-4">
        <div className="grid gap-4 md:grid-cols-2">
          {session?.user?.githubAuthenticated ? (
            <Button variant="ghost" className="pointer-events-none border border-green-600">
              <Icons.Github className="mr-2 h-4 w-4" />
              Github
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full p-0"
              onClick={() => signIn("github")}
              disabled={!termsAccepted}
            >
              <Icons.Github className="mr-2 h-4 w-4" />
              Github
            </Button>
          )}

          {session?.user?.twitterAuthenticated ? (
            <Button variant="ghost" className="pointer-events-none border border-green-600">
              <Icons.Twitter className="mr-2 h-4 w-4" />X
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full p-0"
              onClick={() => signIn("twitter")}
              disabled={!termsAccepted}
            >
              <Icons.Twitter className="mr-2 h-4 w-4" />X
            </Button>
          )}
        </div>
        <div className="items-top flex space-x-2">
          <Checkbox id="terms1" onClick={handleCheckboxChange} />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms1"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
            <p className="text-sm text-muted-foreground">
              You agree to our <Link href="/tc" className="underline">Terms of Service</Link> and <Link href="/pp" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
