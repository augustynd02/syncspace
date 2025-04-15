import User from "./User";
import Like from "./Like";

export default interface Post{
    id: string;
    title: string;
    message?: string;
    imageUrl?: string;
    created_at: string;
    user: User
    likes: Like[];
    hasLiked: boolean;
}
