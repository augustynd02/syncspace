export default interface User {
    id: number;
    username: string;
    password: string;
    name: string;
    middle_name?: string;
    last_name: string;
    bio?: string;
    avatar_name: string;
    background_name: string;
    avatar_url?: string;
    background_url?: string;
}
