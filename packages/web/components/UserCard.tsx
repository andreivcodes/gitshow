"use client";

import { signOut, useSession } from "next-auth/react";

const UserCard = () => {
  const session = useSession();
  return (
    <>
      <p>Welcome, {session ? session.data?.user?.name : "unknown"}!</p>
      <p>User: {JSON.stringify(session?.data?.user)}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </>
  );
};

export default UserCard;
