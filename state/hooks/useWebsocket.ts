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
    gamesAtomFamily,
    PlayerActionEvent,
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
                const game_id = game.game_id;
                if (updateType === GUp.Conn) {
                    set(gameListAtom, (v) => [...v, game_id]);
                    set(currentGameAtom, game_id);
                    router?.push(`/game/${game_id}`);
                }
                set(gamesAtomFamily(game_id), game);
                let y = 0;
                for (let row of game.board) {
                    let x = 0;
                    for (let tile of row) {
                        set(boardTileByUserFamily({x, y, game_id}), tile);
                        x += 1;
                    }
                    y += 1;
                }
            }
    );
}

function useGamePlayersHandler() {
    return useRecoilCallback(({set}) => (game: GamePlayers) => {
        const game_id = game.game_id;
        set(gamesAtomFamily(game_id), (currentGame) => {
            if (currentGame) {
                const newGame = {...currentGame};
                newGame.players = game.players;
                return newGame;
            }
            console.warn('player update to uninitialised game ignored');
            return currentGame;
        });
    });
}

function useUserStatusHandler() {
    return useRecoilCallback(({set}) => (userStatus: UserStatus) => {
        set(userStatusAtom, userStatus);
    });
}

function usePlayerActionHandler() {
    return useRecoilCallback(
        ({set, snapshot}) =>
            async ({op, phase}: PlayerActionEvent) => {
                const {game_id, user_id} = op;
                const game = await snapshot.getPromise(
                    gamesAtomFamily(game_id)
                );
                if (!game) return game;
                const update = {...game};
                const action = op.action;
                if ('AttackAction' in action) {
                } else if ('GiveAction' in action) {
                } else if ('MoveAction' in action) {
                    // apply move
                    if (update.phase == 'InProg')
                        update.players[user_id].action_points -= 1;
                    {
                        // remove current position
                        const {x, y} = update.players[user_id].pos;
                        set(boardTileByUserFamily({game_id, x, y}), null);
                    }
                    {
                        // add new position
                        let {x, y} = action.MoveAction.pos;
                        set(boardTileByUserFamily({game_id, x, y}), user_id);
                    }
                    if (phase) update.phase = phase;
                    // update position of player on player list
                    update.players[user_id].pos = action.MoveAction.pos;
                }
                set(gamesAtomFamily(op.game_id), update);
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
    }, [pusher, logout, updateGame, updatePlayers]);
}
