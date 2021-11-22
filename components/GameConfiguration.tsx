import Settings from './svg/Settings';
import {GameStats} from '../state/game';
import {User} from '../state/user';
import RelayWS from '../state/websockets';
import {ReactNode, useRef, useState} from 'react';
export function ButtonInputOverlay({
    isHost,
    button,
    input,
}: {
    isHost: boolean;
    button: (a: (e?: any) => void, ref: any) => ReactNode;
    input: (a: (e?: any) => void) => ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isOpen, setOpen] = useState(false);
    const toggle = (bool?: boolean) => {
        setOpen((x) => (typeof bool === 'boolean' ? bool : !x));
    };
    const coords = ref.current?.getBoundingClientRect();
    return (
        <>
            {button(toggle, ref)}
            {/* <div
                className={
                    'modal visible ' +
                    (isOpen
                        ? 'opacity-100 pointer-events-auto'
                        : 'opacity-0 pointer-events-none')
                }
                onClick={() => toggle()}
            ></div> */}
            {isHost && (
                <div
                    className={
                        'fixed w-60 ' + (isOpen ? 'opacity-100' : 'opacity-0')
                    }
                    style={coords ? {top: coords.y, left: coords.x} : {}}
                >
                    {input(toggle)}
                </div>
            )}
        </>
    );
}

export class TEMPLATES {
    static rechargeTimes = {
        '10 seconds': 10,
        '30 seconds': 30,
        '1 minute': 60,
        '2 minutes': 120,
        '5 minutes': 60 * 5,
        '30 minutes': 60 * 30,
        '1 hour': 60 * 60,
        '2 hours': 60 * 60 * 2,
        '6 hours': 60 * 60 * 6,
        '12 hours': 60 * 60 * 12,
        '24 hours': 60 * 60 * 24,
    };
    static rechargeTimesValMap: Record<number, string> = Object.entries(
        TEMPLATES.rechargeTimes
    ).reduce((acc, [k, v]) => ({...acc, [v]: k}), {});
}
export function GameConfiguration({
    gameStats,
    user,
}: {
    gameStats: GameStats;
    user: User;
}) {
    const rechargeTimeLabel =
        TEMPLATES.rechargeTimesValMap[gameStats.turn_time_secs];
    const rechargeHandler = (TurnTimeSecs: number) => {
        RelayWS.sendConfGame({
            game_id: gameStats.game_id,
            user_id: user.user_id,
            op: {TurnTimeSecs},
        });
    };
    const isHost = user.user_id === gameStats.host_user_id;
    return (
        <>
            <div className="divider">Settings</div>
            <ButtonInputOverlay
                isHost={isHost}
                button={(setOpen, ref) => (
                    <div className="shadow">
                        <div className="stat">
                            <button
                                onClick={() => setOpen(true)}
                                disabled={!isHost}
                                className="btn btn-outline stat-figure text-neutral"
                            >
                                <Settings />
                            </button>
                            <div className="stat-desc" ref={ref}>
                                Time between recharges
                            </div>
                            <div className="stat-value text-3xl">
                                {/* {gameStats.turn_time_secs} secs */}
                                {rechargeTimeLabel}
                            </div>
                        </div>
                    </div>
                )}
                input={(setOpen) => (
                    <select
                        className="select select-lg select-ghost w-full max-w-xs"
                        value={gameStats.turn_time_secs}
                        onChange={(e) => {
                            rechargeHandler(Number(e.target.value));
                            setOpen(false);
                        }}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                    >
                        <option disabled value="default">
                            Time between recharges
                        </option>
                        {Object.entries(TEMPLATES.rechargeTimes).map(
                            ([k, v]) => (
                                <option key={k} value={v}>
                                    {k}
                                </option>
                            )
                        )}
                    </select>
                )}
            />
            <ButtonInputOverlay
                isHost={isHost}
                button={(setOpen, ref) => (
                    <div className="shadow">
                        <div className="stat">
                            <button
                                onClick={() => setOpen(true)}
                                disabled={!isHost}
                                className="btn btn-outline stat-figure text-neutral"
                            >
                                <Settings />
                            </button>
                            <div className="stat-desc" ref={ref}>
                                Starting player lives
                            </div>
                            <div className="stat-value">
                                {/* {gameStats.conf.init_lives} */}
                            </div>
                        </div>
                    </div>
                )}
                input={(setOpen) => <span></span>}
            />
            <div className="shadow">
                <div className="stat">
                    <button
                        disabled={!isHost}
                        className="btn btn-outline stat-figure text-neutral"
                    >
                        <Settings />
                    </button>
                    <div className="stat-desc">Player hearts</div>
                    <div className="stat-value">{gameStats.turn_time_secs}</div>
                </div>
            </div>
        </>
    );
}
