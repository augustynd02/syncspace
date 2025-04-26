export default interface Message {
    id: number;
    content: string;
    created_at: string;

    sender_id: number;
    receiver_id: number;
}
