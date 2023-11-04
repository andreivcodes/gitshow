"use client";

import SubscriptionCard from "../components/SubscriptionCard";
import SignInCard from "../components/SignInCard";
import UserCard from "../components/UserCard";
import { SessionProvider } from "next-auth/react";

const Home = () => {
  return (
    <div>
      <SessionProvider>
        <SubscriptionCard />
        <SignInCard />
        <UserCard />
      </SessionProvider>
    </div>
  );
};

export default Home;
