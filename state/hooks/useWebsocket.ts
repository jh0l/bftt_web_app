import {NextRouter, useRouter} from 'next/router';
import {useEffect} from 'react';
import {useRecoilCallback} from 'recoil';
import {useAlerts} from '../alerts';
import {
    boardTileByUserFamily,
    currentGameAtom,
    Game,
    GamePlayers,
    gameListAtom,
    gamePlayerIdsAtomFamily,
    PlayerActionResponse,
    gamePlayersAtomFamily,
    gameStatsAtomFamily,
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
            (game: Game) => {
                const {game_id, players, board} = game;
                const playerIdList = Object.keys(players);
                // set new game and player list
                if (updateType === GUp.Conn) {
                    set(gameListAtom, (v) => [...v, game_id]);
                    set(currentGameAtom, game_id);
                    router?.push(`/game/${game_id}`);
                }
                // set game stats
                set(gameStatsAtomFamily(game_id), {
                    game_id,
                    phase: game.phase,
                    host_user_id: game.host_user_id,
                    turn_time_secs: game.turn_time_secs,
                    turn_end_unix: game.turn_end_unix,
                    size: game.board.size,
                });
                // set players
                set(gamePlayerIdsAtomFamily(game_id), playerIdList);
                for (let player of Object.values(players)) {
                    const {user_id} = player;
                    set(gamePlayersAtomFamily({game_id, user_id}), player);
                }
                for (let [k, v] of Object.entries(board.map)) {
                    console.log(k);
                    let [x, y] = k.split(',').map(Number);
                    console.log(x, y);
                    set(boardTileByUserFamily({x, y, game_id}), v);
                }
            }
    );
}

function useGamePlayersHandler() {
    return useRecoilCallback(({set}) => (game: GamePlayers) => {
        const {game_id, players} = game;
        const playerIdList = Object.keys(players);
        set(gamePlayerIdsAtomFamily(game_id), playerIdList);
        for (let player of Object.values(players)) {
            const {user_id} = player;
            set(gamePlayersAtomFamily({game_id, user_id}), player);
        }
    });
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
                    // update player action points
                    set(gamePlayersAtomFamily({user_id, game_id}), (p) => {
                        if (!p) throw Error('player uninitialized');
                        const up = {...p};
                        up.action_points -= 1;
                        return up;
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
                    // update player action points
                    set(gamePlayersAtomFamily({user_id, game_id}), (p) => {
                        if (!p) throw Error('player uninitialized');
                        const up = {...p};
                        up.action_points -= 1;
                        return up;
                    });
                    // update target action points
                    set(
                        gamePlayersAtomFamily({
                            user_id: action.Give.target_user_id,
                            game_id,
                        }),
                        (p) => {
                            if (!p) throw Error('player uninitialized');
                            const up = {...p};
                            up.action_points += 1;
                            return up;
                        }
                    );
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
                        if (phase == 'InProg')
                            up.action_points = p.action_points - 1;
                        up.pos = action.Move.to;
                        return up;
                    });
                } else if ('RangeUpgrade' in action) {
                    // update player action points
                    set(gamePlayersAtomFamily({user_id, game_id}), (p) => {
                        if (!p) throw Error('player uninitialized');
                        const up = {...p};
                        up.range += 1;
                        up.action_points -= 3;
                        return up;
                    });
                } else {
                    throw Error('unhandled action ' + action);
                }
            }
    );
}

export default function useWebsocket() {
    const router = useRouter();
    const {pusher} = useAlerts();
    const updateGame = useUpdateGameHandler(router);
    const updatePlayers = useGamePlayersHandler();
    const updateUserStatus = useUserStatusHandler();
    const updatePlayerAction = usePlayerActionHandler();
    const logout = useLogoutHandler();
    useEffect(() => {
        RelayWS.addListener('/error', (s) => pusher({msg: s, type: 'error'}));
        RelayWS.addJsonListener('/login', loginHandler);
        RelayWS.addListener('/logout', logout);
        RelayWS.addJsonListener('/host_game_success', updateGame(GUp.Conn));
        RelayWS.addJsonListener('/join_game_success', updateGame(GUp.Conn));
        RelayWS.addJsonListener('/player_joined', updatePlayers);
        RelayWS.addJsonListener('/start_game', updateGame(GUp.Updt));
        RelayWS.addJsonListener('/user_status', updateUserStatus);
        RelayWS.addJsonListener('/replenish', updatePlayers);
        RelayWS.addJsonListener('/player_action', updatePlayerAction);
        RelayWS.addListener('/alert', (s) => pusher({msg: s}));
    }, [
        pusher,
        logout,
        updateGame,
        updatePlayers,
        updateUserStatus,
        updatePlayerAction,
    ]);
}
