import {useRouter} from 'next/router';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {useAlerts} from '../state/alerts';
import {gamesAtomFamily} from '../state/game';
import RelayWS from '../state/websockets';
import X from './svg/X';

export default function GameModal() {
    const router = useRouter();
    const {pusher} = useAlerts();
    const [name, setNameRaw] = useState('');
    const [go, setGo] = useState(false);
    const gameInfo = useRecoilValue(gamesAtomFamily(name));
    const inputRef = useRef<HTMLInputElement>(null);
    const newGame = useCallback(async () => {
        setGo(true);
        if (name) {
            RelayWS.sendHostGame(name);
        } else {
            pusher({msg: 'Game name required', type: 'error'});
        }
    }, [name, pusher]);
    const setName = (v: string) => {
        setGo(false);
        setNameRaw(v);
    };
    useEffect(() => {
        if (gameInfo && go) {
            router.push(`/game/${name}`);
        }
    }, [gameInfo, router, name, pusher, go]);
    return (
        <div className="form-control">
            <label
                htmlFor="host-game-modal"
                className="btn btn-primary modal-button"
            >
                Host A Game
            </label>
            <input
                type="checkbox"
                id="host-game-modal"
                className="modal-toggle"
                onClick={() => setTimeout(() => inputRef.current?.focus(), 100)}
            />
            <div className="modal">
                <div className="modal-box indicator">
                    <div className="modal-box">
                        <label
                            htmlFor="host-game-modal"
                            className="indicator-item btn btn-square btn-xs"
                        >
                            <X />
                        </label>
                        <p>
                            Enim dolorem dolorum omnis atque necessitatibus.
                            Consequatur aut adipisci qui iusto illo eaque.
                            Consequatur repudiandae et. Nulla ea quasi eligendi.
                            Saepe velit autem minima.
                        </p>
                        <div className="modal-action justify-center">
                            <div className="form-control left">
                                <label className="label">
                                    <span className="label-text">
                                        What should it be called?
                                    </span>
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Game ID"
                                        className="w-full input input-primary input-bordered"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={newGame}
                                    >
                                        go
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
