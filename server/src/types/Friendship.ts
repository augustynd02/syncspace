export default interface Friendship {
	requester_id: number;
	receiver_id: number;
	status: 'accepted' | 'pending' | 'declined'
}
