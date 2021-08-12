import {atom, atomFamily, DefaultValue, selector} from 'recoil';
import {splitCmd} from '.';

interface Player {
    user_id: string;
    lives: number;
    moves: number;
    pos: {x: number; y: number};
}

type GamePhase = 'Init' | 'InProg' | 'End';

export interface Game {
    phase: GamePhase;
    game_id: string;
    host_user_id: string;
    players: {[key: string]: Player};
    turn_time_secs: number;
    board: Array<Array<string | null>>;
    turn_end_unix: number;
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
