"use client";
import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Icons } from "./ui/icons";

export default function SignIn() {
  return (
    <div className="flex justify-center p-4">
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
            {/* {githubSigned ? (
            <Button
              variant="ghost"
              className="pointer-events-none border border-green-600"
            >
              <Icons.gitHub className="mr-2 h-4 w-4" />
              Github
            </Button>
          ) : ( */}
            <Button
              variant="outline"
              className="w-full p-0"
              onClick={() => signIn("github")}
            >
              <Icons.gitHub className="mr-2 h-4 w-4" />
              Github
            </Button>
            {/* )}

          {twitterSigned ? (
            <Button
              variant="ghost"
              className="pointer-events-none border border-green-600"
            >
              <Icons.twitter className="mr-2 h-4 w-4" />X
            </Button>
          ) : ( */}
            <Button
              variant="outline"
              className="w-full p-0"
              onClick={() => signIn("twitter")}
            >
              <Icons.twitter className="mr-2 h-4 w-4" />X
            </Button>
            {/* )} */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
