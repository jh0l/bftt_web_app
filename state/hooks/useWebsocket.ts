import {NextRouter, useRouter} from 'next/router';
import {useEffect} from 'react';
import {useRecoilCallback} from 'recoil';
import {moveTileSingleton} from '../../components/MoveTileSingleton';
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
    gamePlayersAliveDeadAtomFamily,
    playerCurseAtomFamily,
    setCurseAtom,
    boardHeartsByUserFamily,
    Pos,
} from '../game';
import {userAtom, UserStatus, userStatusAtom} from '../user';
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
                const {game_id, players, board, board_hearts} = game;
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
                // set players alive
                set(
                    gamePlayersAliveDeadAtomFamily(game_id),
                    game.players_alive_dead
                );
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
                // set player board
                for (let [k, v] of Object.entries(board.map)) {
                    const [x1, y1] = k.split(',').map(Number);
                    set(boardTileByUserFamily({x: x1, y: y1, game_id}), v);
                }
                // set board action points
                for (let [k, v] of Object.entries(board_hearts.map)) {
                    const [x, y] = k.split(',').map(Number);
                    set(boardHeartsByUserFamily({x, y, game_id}), v);
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
interface TurnEndUpdate {
    game_id: string;
    user_id: string;
    turn_end_unix: number;
}
function useTurnEndHandler() {
    return useRecoilCallback(
        ({set, snapshot}) =>
            async ({game_id, turn_end_unix}: TurnEndUpdate) => {
                set(gameStatsAtomFamily(game_id), (g) => {
                    if (!g) throw Error('game uninitialized');
                    const up = {...g, turn_end_unix};
                    return up;
                });
                set(setCurseAtom, true);
                const user = await snapshot.getPromise(userAtom);
                if (user) {
                    const {user_id} = user;
                    set(playerCurseAtomFamily({game_id, user_id}), null);
                }
            }
    );
}

interface BoardAPUpdate {
    game_id: string;
    set: [Pos, number];
}
function useTileHeartsHandler() {
    return useRecoilCallback(({set}) => (update: BoardAPUpdate) => {
        let {game_id, set: apSet} = update;
        set(boardHeartsByUserFamily({...apSet[0], game_id}), apSet[1]);
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
            ({game_id, user_id, phase, action}: PlayerActionResponse) => {
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
                            up.lives = up.lives - action.Attack.lives_effect;
                            return up;
                        }
                    );
                    if (phase == 'End') {
                        pusher({msg: 'Game Over', type: 'info'});
                        pusher({msg: user_id + ' won!', type: 'success'});
                    }
                } else if ('Give' in action) {
                    console.log(action.Give.target_user_id);
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
                    // remove "move" highlight from board if present
                    set(moveTileSingleton, null);
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
                } else if ('Revive' in action) {
                    // remove heart from acting player
                    set(gamePlayersAtomFamily({user_id, game_id}), (p) => {
                        if (!p) throw Error('player uninitialized');
                        const up = {...p};
                        up.lives -= 1;
                        return up;
                    });
                    // revive
                    const {
                        Revive: {target_user_id},
                    } = action;
                    const targetKey = {
                        user_id: target_user_id,
                        game_id,
                    };
                    set(gamePlayersAtomFamily(targetKey), (p) => {
                        if (!p) throw Error('player uninitialized');
                        const up = {...p};
                        up.lives += 1;
                        return up;
                    });
                    // voter who is revived to candidate has vote nullified
                    set(playerCurseAtomFamily(targetKey), null);
                } else if ('Curse' in action) {
                    set(
                        playerCurseAtomFamily({game_id, user_id}),
                        action.Curse.target_user_id
                    );
                } else if ('Redeem' in action) {
                    if ('TileHearts' in action.Redeem) {
                        let {x, y} = action.Redeem.TileHearts.pos;
                        // update board
                        set(boardHeartsByUserFamily({x, y, game_id}), 0);
                        // update player
                        console.log(
                            'redeem',
                            user_id,
                            action.Redeem.TileHearts
                        );
                        set(gamePlayersAtomFamily({user_id, game_id}), (p) => {
                            if (!p) throw Error('player uninitialized');
                            const up = {...p};
                            up.lives = action.Redeem.TileHearts.new_lives;
                            return up;
                        });
                    } else {
                        console.error(action.Redeem);
                        throw Error('unknown redeem action');
                    }
                } else {
                    throw Error(
                        'unhandled player action ' + JSON.stringify(action)
                    );
                }
            }
    );
}

function usePlayersAliveHandler() {
    return useRecoilCallback(
        ({set}) =>
            ({
                game_id,
                alive_dead,
            }: {
                game_id: string;
                alive_dead: {alive: string[]; dead: string[]};
            }) => {
                set(gamePlayersAliveDeadAtomFamily(game_id), alive_dead);
            }
    );
}

export default function useWebsocket() {
    const router = useRouter();
    const {pusher} = useAlerts();
    const updateGame = useUpdateGameHandler(router);
    const updatePlayer = useGamePlayerHandler();
    const updateAPU = useActionPointUpdateHandler();
    const updateTurnEnd = useTurnEndHandler();
    const updateUserStatus = useUserStatusHandler();
    const updatePlayerAction = usePlayerActionHandler();
    const updateBoardAP = useTileHeartsHandler();
    const updatePlayersAlive = usePlayersAliveHandler();
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
        RelayWS.addJsonListener('/tile_hearts_update', updateBoardAP);
        RelayWS.addJsonListener('/turn_end_unix', updateTurnEnd);
        RelayWS.addJsonListener('/player_action', updatePlayerAction);
        RelayWS.addJsonListener('/players_alive_update', updatePlayersAlive);
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
        updateBoardAP,
        updateUserStatus,
        updatePlayerAction,
        updateTurnEnd,
        updatePlayersAlive,
    ]);
}
