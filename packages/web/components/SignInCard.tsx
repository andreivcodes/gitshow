"use client";

import { signIn } from "next-auth/react";

const SignInCard = () => {
  return (
    <div className="flex flex-col gap-3 p-5">
      <button onClick={() => signIn("github")}>Sign in with GitHub</button>
      <button onClick={() => signIn("twitter")}>Sign in with Twitter</button>
    </div>
  );
};

export default SignInCard;
