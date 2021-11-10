import {useEffect} from 'react';
import {useRecoilState} from 'recoil';
import {Game, GamePhase} from '../../state/game';
import {useUpdateGameHandler} from '../../state/hooks/useWebsocket';
import {userAtom} from '../../state/user';
import {Content} from './[game_id]';
const data: Game = {
    game_id: 'bonk',
    phase: 'InProg' as GamePhase,
    host_user_id: 'aa',
    players: {
        ii: {
            user_id: 'ii',
            lives: 0,
            action_points: 0,
            pos: {x: 10, y: 6},
            range: 2,
        },
        jj: {
            user_id: 'jj',
            lives: 0,
            action_points: 0,
            pos: {x: 7, y: 4},
            range: 2,
        },
        gg: {
            user_id: 'gg',
            lives: 0,
            action_points: 0,
            pos: {x: 12, y: 5},
            range: 2,
        },
        cc: {
            user_id: 'cc',
            lives: 0,
            action_points: 0,
            pos: {x: 0, y: 0},
            range: 2,
        },
        ff: {
            user_id: 'ff',
            lives: 0,
            action_points: 0,
            pos: {x: 6, y: 4},
            range: 2,
        },
        bb: {
            user_id: 'bb',
            lives: 0,
            action_points: 0,
            pos: {x: 0, y: 1},
            range: 2,
        },
        ee: {
            user_id: 'ee',
            lives: 0,
            action_points: 0,
            pos: {x: 5, y: 6},
            range: 2,
        },
        aa: {
            user_id: 'aa',
            lives: 3,
            action_points: 3,
            pos: {x: 12, y: 8},
            range: 2,
        },
        dd: {
            user_id: 'dd',
            lives: 0,
            action_points: 0,
            pos: {x: 9, y: 8},
            range: 2,
        },
        hh: {
            user_id: 'hh',
            lives: 0,
            action_points: 0,
            pos: {x: 11, y: 6},
            range: 2,
        },
    },
    turn_end_unix: Date.now() / 1000,
    turn_time_secs: 60,
    board: {
        map: {
            '0,1': 'bb',
            '12,8': 'aa',
            '12,5': 'gg',
            '11,6': 'hh',
            '5,6': 'ee',
            '6,4': 'jj',
            '10,6': 'ii',
            '6,5': 'ff',
            '0,0': 'cc',
            '9,8': 'dd',
        },
        size: 18,
    },
};

export default function BonkTest() {
    const [userId, setUserId] = useRecoilState(userAtom);
    const updateGame = useUpdateGameHandler()();
    useEffect(() => {
        !userId && setUserId({user_id: 'aa'});
    }, [userId, setUserId]);
    useEffect(() => {
        updateGame(data);
    }, [updateGame]);
    return <Content game_id="bonk" />;
}
