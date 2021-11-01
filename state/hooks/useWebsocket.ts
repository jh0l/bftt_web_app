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
import RelayWS from '../websockets';
import {useLogoutHandler} from './useLogin';

export function useConnectGameHandler() {
    return useRecoilCallback(({set}) => (msg: string) => {
        const [_, gameStr] = splitCmd(msg);
        const game = JSON.parse(gameStr) as Game;
        const game_id = game.game_id;
        set(gamesAtomFamily(game_id), game);
        set(gameListAtom, (v) => [...v, game_id]);
        set(currentGameAtom, game_id);
    });
}

// Conn: updates a game from a join/host req, Updt updates game in play
enum GUp {
    Conn,
    Updt,
}

export function useUpdateGameHandler() {
    return useRecoilCallback(
        ({set}) =>
            (updateType: GUp) =>
            async (msg: string) => {
                const [_, gameStr] = splitCmd(msg);
                const game = JSON.parse(gameStr) as Game;
                const game_id = game.game_id;
                if (updateType === GUp.Conn) {
                    set(gameListAtom, (v) => [...v, game_id]);
                    set(currentGameAtom, game_id);
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
            }
    );
}

function useGamePlayersHandler() {
    return useRecoilCallback(({set}) => (msg: string) => {
        const [_, gameStr] = splitCmd(msg);
        const game = JSON.parse(gameStr) as GamePlayers;
        const game_id = game.game_id;
        set(gamesAtomFamily(game_id), (currentGame) => {
            if (currentGame) {
                const newGame = {...currentGame};
                newGame.players = game.players;
                return newGame;
            }
            return currentGame;
        });
    });
}

const hF = (msg: string) => msg.split(' ').slice(1).join(' ');
export default function useWebsocket() {
    const {pusher} = useAlerts();
    const connectGame = useConnectGameHandler();
    const updateGame = useUpdateGameHandler();
    const updatePlayers = useGamePlayersHandler();
    const logout = useLogoutHandler();
    useEffect(() => {
        RelayWS.addListener('/error', (s) =>
            pusher({msg: hF(s), type: 'error'})
        );
        RelayWS.addListener('/login', (s) => console.log(s));
        RelayWS.addListener('/logout', logout);
        RelayWS.addListener('/host_game_success', updateGame(GUp.Conn));
        RelayWS.addListener('/join_game_success', updateGame(GUp.Conn));
        RelayWS.addListener('/player_joined', updateGame(GUp.Updt));
        RelayWS.addListener('/start_game', updateGame(GUp.Updt));
        RelayWS.addListener('/replenish', updatePlayers);
        RelayWS.addListener('/alert', (s) => pusher({msg: hF(s)}));
    }, [pusher, logout, connectGame, updateGame, updatePlayers]);
}
