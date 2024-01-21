import * as React from "react";
import { cn } from "../lib/utils";
import { Icons } from "./ui/icons";

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex items-center justify-center md:h-12 pt-8 xl:pt-0 pb-16 xl:pb-0">
        <div className="flex flex-col xl:flex-row items-center gap-4 md:gap-2">
          <p className="text-center text-sm leading-loose md:text-left flex-row flex gap-1">
            Built by{" "}
            <a
              href="https://x.com/andreivtweets"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              andreivcodes.
            </a>
          </p>
          <p className="text-center text-sm leading-loose md:text-left flex-row flex gap-1">
            Source code available on
            <a
              href="https://github.com/andreivcodes"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 flex flex-row justify-center"
            >
              <Icons.gitHubSmall />
              GitHub.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
