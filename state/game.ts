import {atom, atomFamily} from 'recoil';

export interface Pos {
    x: number;
    y: number;
}

interface Player {
    user_id: string;
    lives: number;
    moves: number;
    pos: Pos;
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

export const boardTileAtomFamily = atomFamily<
    string | null,
    {game_id: string; x: number; y: number}
>({
    key: 'boardTileAtomFamily',
    default: null,
});
