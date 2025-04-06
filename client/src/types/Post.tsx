import User from "./User";

export default interface Post{
    id: string;
    title: string;
    message?: string;
    imageUrl?: string;
    created_at: string;
    user: User
}
