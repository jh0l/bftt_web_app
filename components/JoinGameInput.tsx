import {useCallback, useState} from 'react';
import {useAlerts} from '../state/alerts';
import RelayWS from '../state/websockets';

export default function JoinGameInput() {
    const {pusher} = useAlerts();
    const [name, setName] = useState('');
    const joinGame = useCallback(async () => {
        if (name) {
            RelayWS.sendJoinGame(name);
        } else {
            pusher({msg: 'Game name required', type: 'error'});
        }
    }, [name, pusher]);
    // useUpdateGameHandler navigates user to game page in 'game_join_success'
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
