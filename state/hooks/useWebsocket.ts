import {NextRouter, useRouter} from 'next/router';
import {useEffect} from 'react';
import {useRecoilCallback} from 'recoil';
import {useAlerts} from '../alerts';
import {
    boardTileByUserFamily,
    currentGameAtom,
    Game,
    gameListAtom,
    gamePlayerIdsAtomFamily,
    PlayerActionResponse,
    gamePlayersAtomFamily,
    gameStatsAtomFamily,
    Player,
    GameConfigResult,
} from '../game';
import {UserStatus, userStatusAtom} from '../user';
import RelayWS from '../websockets';
import {useLogoutHandler} from './useLogin';

type Login = {token: string; alert: string};
function loginHandler(login: Login) {
    const token = login.token;
    RelayWS.sessionKey = token;
}

// Conn: updates a game from a join/host resp, Updt: updates game in play
export enum GUp {
    Conn,
    Updt,
}

export function useUpdateGameHandler(router?: NextRouter) {
    return useRecoilCallback(
        ({set}) =>
            (updateType: GUp = GUp.Conn) =>
            (res: Game | GameConfigResult) => {
                let game: Game;
                let cleanup: {[k: string]: string} = {};
                // contains tile positions to be removed
                if ('result' in res) {
                    game = res.game;
                    if (res.result) cleanup = res.result;
                } else game = res;
                const {game_id, players, board} = game;
                const playerIdList = Object.keys(players);
                if (updateType === GUp.Conn) {
                    // set new game and navigate
                    set(gameListAtom, (v) => [...v, game_id]);
                    set(currentGameAtom, game_id);
                    router?.push(`/game/${game_id}`);
                }
                // set game stats
                set(gameStatsAtomFamily(game_id), {
                    game_id,
                    phase: game.phase,
                    host_user_id: game.host_user_id,
                    turn_end_unix: game.turn_end_unix,
                    boardSize: game.board.size,
                    config: game.config,
                });
                // cleanup player tiles that have moved
                for (let coords of Object.keys(cleanup)) {
                    const [x, y] = coords.split(',').map(Number);
                    set(boardTileByUserFamily({game_id, x, y}), null);
                }
                // set players;
                set(gamePlayerIdsAtomFamily(game_id), playerIdList);
                for (let player of Object.values(players)) {
                    const {user_id} = player;
                    set(gamePlayersAtomFamily({game_id, user_id}), player);
                }
                for (let [k, v] of Object.entries(board.map)) {
                    const [x1, y1] = k.split(',').map(Number);
                    set(boardTileByUserFamily({x: x1, y: y1, game_id}), v);
                }
            }
    );
}

function useGamePlayerHandler() {
    return useRecoilCallback(({set}) => (player: Player) => {
        const {game_id, user_id} = player;
        set(gamePlayerIdsAtomFamily(game_id), (x) => (x ? [...x, user_id] : x));
        set(gamePlayersAtomFamily({game_id, user_id}), player);
        const {x, y} = player.pos;
        set(boardTileByUserFamily({x, y, game_id}), player.user_id);
    });
}
interface ActionPointUpdate {
    user_id: string;
    game_id: string;
    action_points: number;
}
function useActionPointUpdateHandler() {
    return useRecoilCallback(
        ({set}) =>
            ({user_id, game_id, action_points}: ActionPointUpdate) => {
                set(gamePlayersAtomFamily({game_id, user_id}), (p) =>
                    p ? {...p, action_points} : p
                );
            }
    );
}

function useUserStatusHandler() {
    return useRecoilCallback(({set}) => (userStatus: UserStatus) => {
        set(userStatusAtom, userStatus);
    });
}

function usePlayerActionHandler() {
    const {pusher} = useAlerts();
    return useRecoilCallback(
        ({set}) =>
            async ({game_id, user_id, phase, action}: PlayerActionResponse) => {
                if ('Attack' in action) {
                    // update game phase
                    set(gameStatsAtomFamily(game_id), (g) => {
                        if (!g) throw Error('game uninitialized');
                        return {...g, phase};
                    });
                    // update target lives
                    set(
                        gamePlayersAtomFamily({
                            user_id: action.Attack.target_user_id,
                            game_id,
                        }),
                        (p) => {
                            if (!p) throw Error('player uninitialized');
                            const up = {...p};
                            up.lives = up.lives + action.Attack.lives_effect;
                            return up;
                        }
                    );
                    if (phase == 'End') {
                        pusher({msg: 'Game Over', type: 'info'});
                        pusher({msg: user_id + ' won!', type: 'success'});
                    }
                } else if ('Give' in action) {
                    console.log('???');
                } else if ('Move' in action) {
                    {
                        // remove current position
                        const {x, y} = action.Move.from;
                        set(boardTileByUserFamily({x, y, game_id}), null);
                    }
                    {
                        // add new position
                        let {x, y} = action.Move.to;
                        set(boardTileByUserFamily({x, y, game_id}), user_id);
                    }
                    // update game phase
                    set(gameStatsAtomFamily(game_id), (g) => {
                        if (!g) throw Error('game uninitialized');
                        return {...g, phase};
                    });
                    // update player points and position
                    set(gamePlayersAtomFamily({user_id, game_id}), (p) => {
                        if (!p) throw Error('player uninitialized');
                        const up = {...p};
                        up.pos = action.Move.to;
                        return up;
                    });
                } else if ('RangeUpgrade' in action) {
                    // update player action points
                    set(gamePlayersAtomFamily({user_id, game_id}), (p) => {
                        if (!p) throw Error('player uninitialized');
                        const up = {...p};
                        up.range += 1;
                        return up;
                    });
                } else if ('Heal' in action) {
                    set(gamePlayersAtomFamily({user_id, game_id}), (p) => {
                        if (!p) throw Error('player uninitialized');
                        const up = {...p};
                        up.lives += 1;
                        return up;
                    });
                } else {
                    throw Error(
                        'unhandled player action ' + JSON.stringify(action)
                    );
                }
            }
    );
}

export default function useWebsocket() {
    const router = useRouter();
    const {pusher} = useAlerts();
    const updateGame = useUpdateGameHandler(router);
    const updatePlayer = useGamePlayerHandler();
    const updateAPU = useActionPointUpdateHandler();
    const updateUserStatus = useUserStatusHandler();
    const updatePlayerAction = usePlayerActionHandler();
    const logout = useLogoutHandler();
    useEffect(() => {
        RelayWS.addListener('/error', (s) => pusher({msg: s, type: 'error'}));
        RelayWS.addJsonListener('/login', loginHandler);
        RelayWS.addListener('/logout', logout);
        RelayWS.addJsonListener('/host_game_success', updateGame(GUp.Conn));
        RelayWS.addJsonListener('/join_game_success', updateGame(GUp.Conn));
        RelayWS.addJsonListener('/player_joined', updatePlayer);
        RelayWS.addJsonListener('/conf_game', updateGame(GUp.Updt));
        RelayWS.addJsonListener('/start_game', updateGame(GUp.Updt));
        RelayWS.addJsonListener('/user_status', updateUserStatus);
        RelayWS.addJsonListener('/action_point_update', updateAPU);
        RelayWS.addJsonListener('/player_action', updatePlayerAction);
        RelayWS.addListener('/alert', (s) => pusher({msg: s}));
        RelayWS.logoutCallback = logout;
        RelayWS.alertCallback = pusher;
        return () => {
            RelayWS.logoutCallback = undefined;
        };
    }, [
        pusher,
        logout,
        updateGame,
        updatePlayer,
        updateAPU,
        updateUserStatus,
        updatePlayerAction,
    ]);
}
