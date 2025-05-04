import Like from './Like.js'

export default interface Comment {
    id: number;
    content: string;
    user_id: number;
    post_id: number;
    created_at: Date;
    likes: Like[]
    user: {
        id: number;
        name: string;
        middle_name: string | null;
        last_name: string;
        avatar_name: string;
        avatar_url?: string;
    };
    hasLiked?: boolean;
}
