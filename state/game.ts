import {atom, atomFamily, selectorFamily} from 'recoil';
import {userAtom} from './user';

export interface Pos {
    x: number;
    y: number;
}

export interface Player {
    user_id: string;
    game_id: string;
    lives: number;
    pos: Pos;
    range: number;
    action_points?: number;
}

export interface GameConfig {
    turn_time_secs: number;
    max_players: number;
    init_range: number;
    init_action_points: number;
    init_lives: number;
    init_pos: 'Random' | 'Manual';
}

export type GamePhase = 'Init' | 'InProg' | 'End';
export type Board = {
    map: Record<string, string>;
    size: number;
};

export interface Game {
    phase: GamePhase;
    game_id: string;
    host_user_id: string;
    players: {[k: string]: Player};
    board: Board;
    turn_end_unix: number;
    config: GameConfig;
}

export interface GameStats {
    game_id: string;
    phase: GamePhase;
    host_user_id: string;
    turn_end_unix: number;
    boardSize: number;
    config: GameConfig;
}

export type ConfGameOp =
    | {TurnTimeSecs: number}
    | {MaxPlayers: number}
    | {BoardSize: number}
    | {InitActPts: number}
    | {InitLives: number}
    | {InitRange: number};

// request to configure game by host
export interface ConfGame {
    user_id: string;
    game_id: string;
    op: ConfGameOp;
}

interface AttackAction {
    target_user_id: string;
    lives_effect: number;
}
interface GiveAction {
    target_user_id: string;
}
export interface MoveAction {
    pos: Pos;
}
export interface RangeUpgradeAction {
    point_cost: number;
}
export interface HealAction {
    point_cost: number;
}
export type ActionType =
    | {Attack: AttackAction}
    | {Give: GiveAction}
    | {Move: MoveAction}
    | {RangeUpgrade: RangeUpgradeAction}
    | {Heal: HealAction};

export interface PlayerAction {
    user_id: string;
    game_id: string;
    action: ActionType;
}

export interface MoveActionEvent {
    from: Pos;
    to: Pos;
}

export type ActionTypeEvent =
    | {Attack: AttackAction}
    | {Give: GiveAction}
    | {Move: MoveActionEvent}
    | {RangeUpgrade: RangeUpgradeAction}
    | {Heal: HealAction};

export interface PlayerActionResponse {
    user_id: string;
    game_id: string;
    action: ActionTypeEvent;
    phase: GamePhase;
}

export const currentGameAtom = atom<null | string>({
    key: 'currentGame_v1',
    default: null,
});

export const gameListAtom = atom<string[]>({
    key: 'gameList_v1',
    default: [],
});

// export const gamesAtomFamily = atomFamily<null | Game, string>({
//     key: 'games_v1',
//     default: null,
// });

// List of IDs of all players for a game, for indexing gamePlayersAtomFamily
export const gamePlayerIdsAtomFamily = atomFamily<null | string[], string>({
    key: 'game_player_ids_v1',
    default: null,
});

export const gameStatsAtomFamily = atomFamily<null | GameStats, string>({
    key: 'game_stats_v1',
    default: null,
});

type PlayerInd = {game_id: string; user_id: string};
export const gamePlayersAtomFamily = atomFamily<null | Player, PlayerInd>({
    key: 'game_players_v1',
    default: null,
});

const boardTileAtomFamily = atomFamily<
    string | null,
    {game_id: string; x: number; y: number; user_id: string}
>({
    key: 'board_tiles_v1',
    default: null,
});

// convience selectorFamily for inferring the current game
export const boardTileByUserFamily = selectorFamily<
    string | null,
    {x: number; y: number; game_id: string}
>({
    key: 'board_tiles_by_users_v1',
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
