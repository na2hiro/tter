export type GetUpdateRequest = {
    roomId: string;
}
export type UpdateRequest<T> = {
    roomId: string;
    command: T;
}
export type UpdateResponse<T> = {
    game: T;
}

export type JoinRequest = {
    roomId: string;
}