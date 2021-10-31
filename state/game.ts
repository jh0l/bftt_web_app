import {
    atom,
    atomFamily,
    selector,
    selectorFamily,
    useRecoilValue,
} from 'recoil';
import {userAtom} from './user';

export interface Pos {
    x: number;
    y: number;
}

export interface Player {
    user_id: string;
    lives: number;
    moves: number;
    pos: Pos;
    range: number;
}

export type GamePhase = 'Init' | 'InProg' | 'End';

export interface Game {
    phase: GamePhase;
    game_id: string;
    host_user_id: string;
    players: {[key: string]: Player};
    turn_time_secs: number;
    board: Array<Array<string | null>>;
    turn_end_unix: number;
}

export interface GamePlayers {
    game_id: string;
    players: {[key: string]: Player};
}

type MoveType = {Attack: Pos} | {Move: Pos} | {Give: Pos} | {Hover: Pos};

export interface PlayerMove {
    user_id: String;
    move_type: MoveType;
}

export const currentGameAtom = atom<null | string>({
    key: 'currentGame_v1',
    default: null,
});

export const gameListAtom = atom<string[]>({
    key: 'gameList_v1',
    default: [],
});

export const gamesAtomFamily = atomFamily<null | Game, string>({
    key: 'games_v1',
    default: null,
});

const boardTileAtomFamily = atomFamily<
    string | null,
    {game_id: string; x: number; y: number; user_id: string}
>({
    key: 'boardTileAtomFamily',
    default: null,
});

export const boardTileAtomSelectorFamily = selectorFamily<
    string | null,
    {x: number; y: number; game_id: string}
>({
    key: 'boardTileSelectorFamily',
    get:
        ({x, y, game_id}: {x: number; y: number; game_id: string}) =>
        ({get}) => {
            const user_id = get(userAtom)?.user_id;
            if (user_id) {
                return get(boardTileAtomFamily({game_id, user_id, x, y}));
            }
            return null;
        },
    set:
        ({x, y, game_id}) =>
        ({set, get}, msg) => {
            const user_id = get(userAtom)?.user_id;
            if (user_id) {
                set(boardTileAtomFamily({game_id, user_id, x, y}), msg);
            }
        },
});
