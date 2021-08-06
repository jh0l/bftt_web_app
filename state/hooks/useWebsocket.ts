import {useEffect} from 'react';
import {useSetRecoilState} from 'recoil';
import {useAlerts} from '../alerts';
import {hostGameSuccessHandler} from '../game';
import RelayWS from '../websockets';

export default function useWebsocket() {
    const {pusher} = useAlerts();
    const hostSuccess = useSetRecoilState(hostGameSuccessHandler);
    useEffect(() => {
        RelayWS.addListener('/error', (s) => pusher({msg: s, type: 'error'}));
        RelayWS.addListener('/login', (s) => console.log(s));
        RelayWS.addListener('/host_game_success', hostSuccess);
    }, [pusher, hostSuccess]);
}
