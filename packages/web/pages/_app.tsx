import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type AppType } from "next/app";
import { Toaster } from "../components/ui/toaster";
import "../styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<SessionProvider session={session}>
			<ThemeProvider attribute="class" defaultTheme="dark">
				<Component {...pageProps} />
				<Toaster />
			</ThemeProvider>
		</SessionProvider>
	);
};

export default MyApp;
