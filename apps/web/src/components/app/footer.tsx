import { Icons } from "@/components/ui/icons";

export function Footer() {
  return (
    <div className="container flex items-center justify-center mt-auto pt-6 sm:pt-0 pb-24 xl:pb-4">
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-sm leading-loose flex-row flex gap-1">
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
        <p className="text-center text-sm leading-loose flex-row flex gap-1 items-center">
          Source code available on
          <a
            href="https://github.com/andreivcodes"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 flex flex-row items-center gap-1"
          >
            <Icons.Github className="h-4 w-4" />
            GitHub.
          </a>
        </p>
      </div>
    </div>
  );
}
