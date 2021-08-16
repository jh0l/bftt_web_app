import {useEffect} from 'react';
import {useRecoilCallback} from 'recoil';
import {splitCmd} from '..';
import {useAlerts} from '../alerts';
import {currentGameAtom, Game, gameListAtom, gamesAtomFamily} from '../game';
import RelayWS from '../websockets';
import {useLogoutHandler} from './useLogin';

function useConnectGameHandler() {
    return useRecoilCallback(({set}) => (msg: string) => {
        const [_, gameStr] = splitCmd(msg);
        const game = JSON.parse(gameStr) as Game;
        const game_id = game.game_id;
        set(gamesAtomFamily(game_id), game);
        set(gameListAtom, (v) => [...v, game_id]);
        set(currentGameAtom, game_id);
    });
}

function useUpdateGameHandler() {
    return useRecoilCallback(({set}) => (msg: string) => {
        const [_, gameStr] = splitCmd(msg);
        const game = JSON.parse(gameStr) as Game;
        const game_id = game.game_id;
        console.log(typeof game);
        set(gamesAtomFamily(game_id), game);
    });
}

export default function useWebsocket() {
    const {pusher} = useAlerts();
    const connectGame = useConnectGameHandler();
    const updateGame = useUpdateGameHandler();
    const logout = useLogoutHandler();
    useEffect(() => {
        RelayWS.addListener('/error', (s) => pusher({msg: s, type: 'error'}));
        RelayWS.addListener('/login', (s) => console.log(s));
        RelayWS.addListener('/logout', () => {
            pusher({msg: 'logged in elsewhere'});
            logout();
        });
        RelayWS.addListener('/host_game_success', connectGame);
        RelayWS.addListener('/join_game_success', connectGame);
        RelayWS.addListener('/player_joined', updateGame);
        RelayWS.addListener('/start_game', updateGame);
        RelayWS.addListener('/replenish', updateGame);
    }, [pusher, logout, connectGame, updateGame]);
}
