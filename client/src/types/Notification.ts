export default interface Notification {
    id: number;
    message: string;
    type: 'info' | 'friend_request' | 'like' | 'comment' | 'message'
    is_read: boolean;
    created_at: string;

    post_id: number;
    comment_id: number;

    sender_id: number;
    recipient_id: number;
}
