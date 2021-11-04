import {NextRouter, useRouter} from 'next/router';
import {useEffect} from 'react';
import {useRecoilCallback} from 'recoil';
import {splitCmd} from '..';
import {useAlerts} from '../alerts';
import {
    boardTileAtomSelectorFamily,
    currentGameAtom,
    Game,
    GamePlayers,
    gameListAtom,
    gamesAtomFamily,
} from '../game';
import {UserStatus, userStatusAtom} from '../user';
import RelayWS from '../websockets';
import {useLogoutHandler} from './useLogin';

function loginHandler(msg: string) {
    const [_, str] = splitCmd(msg);
    const login = JSON.parse(str) as {token: string; alert: string};
    const token = login.token;
    RelayWS.sessionKey = token;
}

// Conn: updates a game from a join/host resp, Updt: updates game in play
enum GUp {
    Conn,
    Updt,
}

export function useUpdateGameHandler(router: NextRouter) {
    return useRecoilCallback(({set}) => (updateType: GUp) => (msg: string) => {
        const [_, str] = splitCmd(msg);
        const game = JSON.parse(str) as Game;
        const game_id = game.game_id;
        if (updateType === GUp.Conn) {
            set(gameListAtom, (v) => [...v, game_id]);
            set(currentGameAtom, game_id);
            router.push(`/game/${game_id}`);
        }
        set(gamesAtomFamily(game_id), game);
        let y = 0;
        for (let row of game.board) {
            let x = 0;
            for (let tile of row) {
                set(boardTileAtomSelectorFamily({x, y, game_id}), tile);
                x += 1;
            }
            y += 1;
        }
    });
}

function useGamePlayersHandler() {
    return useRecoilCallback(({set}) => (msg: string) => {
        const [_, str] = splitCmd(msg);
        const game = JSON.parse(str) as GamePlayers;
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
    return useRecoilCallback(({set}) => (msg: string) => {
        const [_, str] = splitCmd(msg);
        const userStatus = JSON.parse(str) as UserStatus;
        set(userStatusAtom, userStatus);
    });
}

const hF = (msg: string) => msg.split(' ').slice(1).join(' ');
export default function useWebsocket() {
    const router = useRouter();
    const {pusher} = useAlerts();
    const updateGame = useUpdateGameHandler(router);
    const updatePlayers = useGamePlayersHandler();
    const updateUserStatus = useUserStatusHandler();
    const logout = useLogoutHandler();
    useEffect(() => {
        RelayWS.addListener('/error', (s) =>
            pusher({msg: hF(s), type: 'error'})
        );
        RelayWS.addListener('/login', loginHandler);
        RelayWS.addListener('/logout', logout);
        RelayWS.addListener('/host_game_success', updateGame(GUp.Conn));
        RelayWS.addListener('/join_game_success', updateGame(GUp.Conn));
        RelayWS.addListener('/player_joined', updateGame(GUp.Updt));
        RelayWS.addListener('/start_game', updateGame(GUp.Updt));
        RelayWS.addListener('/user_status', updateUserStatus);
        RelayWS.addListener('/replenish', updatePlayers);
        RelayWS.addListener('/alert', (s) => pusher({msg: hF(s)}));
    }, [pusher, logout, updateGame, updatePlayers]);
}
