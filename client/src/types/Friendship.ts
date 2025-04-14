export default interface Friendship {
    status: 'accepted' | 'pending' | 'declined' | null;
    requester_id: number;
    receiver_id: number;
    created_at: Date
}
