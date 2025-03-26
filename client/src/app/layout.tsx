import type { Metadata } from "next";
import "./globals.scss";
import { ReactNode } from "react";

import { Raleway, Montserrat } from 'next/font/google';

const raleway = Raleway({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-primary'
})

const montserrat = Montserrat({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-secondary'
})


export const metadata: Metadata = {
	title: "syncspace",
	description: "SyncSpace is a dynamic social media platform that connects people, enabling seamless communication, sharing, and collaboration. Stay in sync with your network and engage with content like never before.",
};

export default function RootLayout({ children }: { children: ReactNode}) {
	return (
		<html lang="en" className={`${raleway.variable} ${montserrat.variable}`}>
			<body>
				{children}
			</body>
		</html>
	);
}
