export type UpdateRequest = {
    roomId: string;
    data: any;
}
export type UpdateResponse = {
    game: any;
}

export type JoinRequest = {
    roomId: string;
}