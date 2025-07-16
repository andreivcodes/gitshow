import Link from "next/link";

export function Header() {
  return (
    <div className="container flex items-center justify-center pt-10 pb-6 drop-shadow-[0px_0px_25px_rgba(255,255,255,0.25)]">
      <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
        <div className="flex items-center flex-col gap-4">
          <Link className="text-7xl font-bold tracking-tighter" href="/">
            git.show
          </Link>
          <p className="text-md font-light">show off your contributions</p>
        </div>
      </div>
    </div>
  );
}
