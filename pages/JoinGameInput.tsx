import {useRouter} from 'next/router';
import {useCallback, useEffect, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {useAlerts} from '../state/alerts';
import {gamesAtomFamily} from '../state/game';
import RelayWS from '../state/websockets';

export default function JoinGameInput() {
    const router = useRouter();
    const {pusher} = useAlerts();
    const [name, setName] = useState('');
    const gameInfo = useRecoilValue(gamesAtomFamily(name));
    const joinGame = useCallback(async () => {
        if (name) {
            RelayWS.sendJoinGame(name);
        } else {
            pusher({msg: 'Game name required', type: 'error'});
        }
    }, [name, pusher]);
    useEffect(() => {
        if (gameInfo) {
            router.push(`/game/${name}`);
        }
    }, [gameInfo, router, name, pusher]);
    return (
        <div className="form-control">
            <label className="label">
                <span className="label-text">Join a Game:</span>
            </label>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Game ID"
                    className="w-full pr-16 input input-primary input-bordered"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button
                    className="absolute top-0 right-0 rounded-l-none btn btn-primary"
                    onClick={joinGame}
                >
                    go
                </button>
            </div>
        </div>
    );
}
