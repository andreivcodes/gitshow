"use client";

import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

export default function SignIn() {
  const session = useSession();

  return (
    <Card className="flex min-w-[300px] flex-col justify-evenly p-4">
      <CardHeader className="space-y-1">
        <CardTitle className="flex justify-center text-2xl">Connect your accounts</CardTitle>
        <CardDescription className="pt-2 text-center">
          Your Github and X accounts must use the same email address!
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 py-4">
        <div className="grid gap-4 md:grid-cols-2">
          {session.data?.user.githubAuthenticated == true ? (
            <Button variant="ghost" className="pointer-events-none border border-green-600">
              <Icons.Github className="mr-2 h-4 w-4" />
              Github
            </Button>
          ) : (
            <Button variant="outline" className="w-full p-0" onClick={() => signIn("github")}>
              <Icons.Github className="mr-2 h-4 w-4" />
              Github
            </Button>
          )}

          {session.data?.user.twitterAuthenticated == true ? (
            <Button variant="ghost" className="pointer-events-none border border-green-600">
              <Icons.Twitter className="mr-2 h-4 w-4" />X
            </Button>
          ) : (
            <Button variant="outline" className="w-full p-0" onClick={() => signIn("twitter")}>
              <Icons.Twitter className="mr-2 h-4 w-4" />X
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
