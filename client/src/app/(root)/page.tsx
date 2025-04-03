import { redirect } from "next/navigation";

import getUser from "@/utils/getUser";

export default async function Home() {
	const user = await getUser();
	if (!user) {
		redirect('/login');
	}
	return (
		<>
			<div>test</div>
			{user ? user.name : 'not authenticated'}
		</>
	);
}
