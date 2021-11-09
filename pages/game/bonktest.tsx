import {useEffect} from 'react';
import {useRecoilState} from 'recoil';
import {Game, GamePhase} from '../../state/game';
import {useUpdateGameHandler} from '../../state/hooks/useWebsocket';
import {userAtom} from '../../state/user';
import {Content} from './[game_id]';

const data: Game = {
    game_id: 'bonk',
    phase: 'Init' as GamePhase,
    host_user_id: 'ebe',
    players: {
        ebe: {
            user_id: 'ebe',
            lives: 3,
            action_points: 3,
            pos: {x: 3, y: 14},
            range: 2,
        },
        bab: {
            user_id: 'bab',
            lives: 3,
            action_points: 3,
            pos: {x: 2, y: 16},
            range: 2,
        },
    },
    turn_end_unix: Date.now() / 1000,
    turn_time_secs: 60,
    board: {map: {}, size: 18},
};

export default function BonkTest() {
    const [userId, setUserId] = useRecoilState(userAtom);
    const updateGame = useUpdateGameHandler()();
    useEffect(() => {
        !userId && setUserId({user_id: 'ebe'});
    }, [userId, setUserId]);
    useEffect(() => {
        updateGame(data);
    }, [updateGame]);
    return <Content game_id="bonk" />;
}
