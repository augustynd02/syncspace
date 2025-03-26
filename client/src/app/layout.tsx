import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
	title: "syncspace",
	description: "SyncSpace is a dynamic social media platform that connects people, enabling seamless communication, sharing, and collaboration. Stay in sync with your network and engage with content like never before.",
};

export default function RootLayout({ children }: { children: ReactNode}) {
	return (
		<html lang="en">
			<body>
				{children}
			</body>
		</html>
	);
}
