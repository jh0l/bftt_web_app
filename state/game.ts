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

export const connectGameSuccessHandler = selector<string>({
    key: 'connectGameSuccessHandler_v1',
    set: ({set}, msg) => {
        if (msg instanceof DefaultValue) return;
        const [_, gameStr] = splitCmd(msg);
        const game = JSON.parse(JSON.parse(gameStr)) as Game;
        const game_id = game.game_id;
        set(gamesAtomFamily(game_id), game);
        set(gameListAtom, (v) => [...v, game_id]);
        set(currentGameAtom, game_id);
    },
    get: () => {
        throw Error('do not');
    },
});

export const updateGameHandler = selector<string>({
    key: 'playerJoinedHandler_v1',
    set: ({set}, msg) => {
        if (msg instanceof DefaultValue) return;
        const [_, gameStr] = splitCmd(msg);
        console.log(_, gameStr);
        const game = JSON.parse(gameStr) as Game;
        const game_id = game.game_id;
        set(gamesAtomFamily(game_id), game);
    },
    get: () => {
        throw Error('do not');
    },
});
