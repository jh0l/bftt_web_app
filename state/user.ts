import {atom} from 'recoil';

interface User {
    user_id: string;
}

export const userAtom = atom<null | User>({
    key: 'userIdAtom_v1',
    default: null,
});

export interface UserStatus {
    game_id: string | null;
}

export const userStatusAtom = atom<null | UserStatus>({
    key: 'userStatusAtom',
    default: null,
});
