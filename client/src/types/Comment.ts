import Like from "./Like";

export default interface Comment {
    id: number;
    content: string;
    user_id: number;
    post_id: number;
    created_at: string;
    likes: Like[];
    user: {
        id: number;
        name: string;
        middle_name: string | null;
        last_name: string;
        avatar_name: string;
        avatar_url?: string;
    };
}
