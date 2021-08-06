import {useEffect} from 'react';
import {useSetRecoilState} from 'recoil';
import {useAlerts} from '../alerts';
import {connectGameSuccessHandler, updateGameHandler} from '../game';
import RelayWS from '../websockets';

export default function useWebsocket() {
    const {pusher} = useAlerts();
    const connectGameSuccess = useSetRecoilState(connectGameSuccessHandler);
    const updateGame = useSetRecoilState(updateGameHandler);
    useEffect(() => {
        RelayWS.addListener('/error', (s) => pusher({msg: s, type: 'error'}));
        RelayWS.addListener('/login', (s) => console.log(s));
        RelayWS.addListener('/host_game_success', connectGameSuccess);
        RelayWS.addListener('/join_game_success', connectGameSuccess);
        RelayWS.addListener('/player_joined', updateGame);
    }, [pusher, connectGameSuccess, updateGame]);
}
