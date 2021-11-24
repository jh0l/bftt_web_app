import Settings from './svg/Settings';
import {ConfGameOp, GameStats} from '../state/game';
import {User} from '../state/user';
import RelayWS from '../state/websockets';
import React, {
    LegacyRef,
    ReactNode,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

export function ButtonInputOverlay({
    isHost,
    button,
    input,
}: {
    isHost: boolean;
    button: (props: {setOpen: (e?: any) => void; ref: any}) => ReactNode;
    input: (a: (e?: any) => void) => ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isOpen, setOpenRaw] = useState(false);
    const setOpen = (bool?: boolean) => {
        setOpenRaw((x) => (typeof bool === 'boolean' ? bool : !x));
    };
    const [coords, setCoords] = useState<DOMRect | undefined>();
    useLayoutEffect(() => {
        setCoords(ref.current?.getBoundingClientRect());
    }, [isOpen]);
    return (
        <>
            {button({setOpen, ref})}
            {isHost && (
                <div
                    className={'fixed w-60 opacity-10'}
                    style={coords ? {top: coords.y, left: coords.x} : {}}
                >
                    {input(setOpen)}
                </div>
            )}
        </>
    );
}

interface ConfigItemProps {
    label: string;
    value: string;
    isHost: boolean;
    input: ReactNode;
}
const ConfigItem = React.forwardRef(function ConfigItemInner(
    {label, value, isHost, input}: ConfigItemProps,
    ref: LegacyRef<HTMLDivElement> | undefined
) {
    return (
        <div className="shadow">
            <div className="stat relative">
                <div className="stat-desc" ref={ref}>
                    {label}
                </div>
                <div className="stat-value text-2xl">{value}</div>
                <button
                    disabled={!isHost}
                    className="btn btn-ghost stat-figure text-neutral absolute right-4 top-2"
                >
                    <Settings />
                </button>
                {isHost && (
                    <div className="absolute bottom-3 opacity-1 w-full">
                        {input}
                    </div>
                )}
            </div>
        </div>
    );
});
const valMap = (map: {[k: string]: number}) =>
    Object.entries(map).reduce(
        (acc, [k, v]) => ({...acc, [v]: k}),
        {} as {[k: number]: string}
    );
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
    static rechargeTimesNums = valMap(TEMPLATES.rechargeTimes);

    static maxPlayers = {
        '5 players': 5,
        '8 players': 8,
        '13 players': 13,
        '21 playes': 21,
    };
    static maxPlayersNums = valMap(TEMPLATES.maxPlayers);

    static boardSize = {
        '5 by 5': 5,
        '10 by 10': 10,
        '15 by 15': 15,
        '20 by 20': 20,
    };
    static boardSizeNums = valMap(TEMPLATES.boardSize);

    static initActPts = {
        '1 action point': 1,
        '2 action points': 2,
        '3 action points': 3,
        '5 action points': 5,
        '10 action points': 10,
        '20 action points': 20,
    };
    static initActPtsNums = valMap(TEMPLATES.initActPts);

    static initLives = {
        '3 lives': 3,
        '5 lives': 5,
        '10 lives': 10,
    };
    static initLivesNums = valMap(TEMPLATES.initLives);

    static initRange = {
        '1 tile': 1,
        '2 tiles': 2,
        '3 tiles': 3,
        '5 tiles': 5,
        '8 tiles': 8,
        '13 tiles': 13,
        '21 tiles': 21,
    };
    static initRangeNums = valMap(TEMPLATES.initRange);
}

export function GameConfiguration({
    gameStats,
    user,
}: {
    gameStats: GameStats;
    user: User;
}) {
    const configHandler = (op: ConfGameOp) => {
        RelayWS.sendConfGame({
            game_id: gameStats.game_id,
            user_id: user.user_id,
            op,
        });
    };
    const timeValue =
        TEMPLATES.rechargeTimesNums[gameStats.config.turn_time_secs] || '?';
    const maxPlayers =
        TEMPLATES.maxPlayersNums[gameStats.config.max_players] || '?';
    const boardSize = TEMPLATES.boardSizeNums[gameStats.boardSize] || '?';
    const actPts =
        TEMPLATES.initActPtsNums[gameStats.config.init_action_points] || '?';
    const lives = TEMPLATES.initLivesNums[gameStats.config.init_lives] || '?';
    const range = TEMPLATES.initRangeNums[gameStats.config.init_range] || '?';
    const isHost = user.user_id === gameStats.host_user_id;
    return (
        <>
            <div className="divider">Settings</div>
            <ConfigItem
                isHost={isHost}
                label="Time between recharges"
                value={timeValue}
                input={
                    <select
                        className="select-lg cursor-pointer opacity-0 w-full max-w-xs"
                        value={gameStats.config.turn_time_secs}
                        onChange={({target: {value}}) =>
                            configHandler({TurnTimeSecs: Number(value)})
                        }
                    >
                        {Object.entries(TEMPLATES.rechargeTimes).map(
                            ([k, v]) => (
                                <option
                                    key={k}
                                    value={v}
                                    className="text-base bg-base-100"
                                >
                                    {k}
                                </option>
                            )
                        )}
                    </select>
                }
            />
            <ConfigItem
                isHost={isHost}
                label="Max Players"
                value={maxPlayers}
                input={
                    <select
                        className="select-lg cursor-pointer opacity-0 w-full max-w-xs"
                        value={gameStats.config.max_players}
                        onChange={({target: {value}}) =>
                            configHandler({MaxPlayers: Number(value)})
                        }
                    >
                        {Object.entries(TEMPLATES.maxPlayers).map(([k, v]) => (
                            <option
                                key={k}
                                value={v}
                                className="text-base bg-base-100"
                            >
                                {k}
                            </option>
                        ))}
                    </select>
                }
            />
            <ConfigItem
                isHost={isHost}
                label="Board Size"
                value={boardSize}
                input={
                    <select
                        className="select-lg cursor-pointer opacity-0 w-full max-w-xs"
                        value={gameStats.boardSize}
                        onChange={({target: {value}}) =>
                            configHandler({BoardSize: Number(value)})
                        }
                    >
                        {Object.entries(TEMPLATES.boardSize).map(([k, v]) => (
                            <option
                                key={k}
                                value={v}
                                className="text-base bg-base-100"
                            >
                                {k}
                            </option>
                        ))}
                    </select>
                }
            />
            <div className="p-1 pt-3 text-sm font-bold">Initial Loadout</div>
            <ConfigItem
                isHost={isHost}
                label="Player Lives"
                value={lives}
                input={
                    <select
                        className="select-lg cursor-pointer opacity-0 w-full max-w-xs"
                        value={gameStats.config.init_lives}
                        onChange={({target: {value}}) =>
                            configHandler({InitLives: Number(value)})
                        }
                    >
                        {Object.entries(TEMPLATES.initLives).map(([k, v]) => (
                            <option
                                key={k}
                                value={v}
                                className="text-base bg-base-100"
                            >
                                {k}
                            </option>
                        ))}
                    </select>
                }
            />
            <ConfigItem
                isHost={isHost}
                label="Action Points"
                value={actPts}
                input={
                    <select
                        className="select-lg cursor-pointer opacity-0 w-full max-w-xs"
                        value={gameStats.config.init_action_points}
                        onChange={({target: {value}}) =>
                            configHandler({InitActPts: Number(value)})
                        }
                    >
                        {Object.entries(TEMPLATES.initActPts).map(([k, v]) => (
                            <option
                                key={k}
                                value={v}
                                className="text-base bg-base-100"
                            >
                                {k}
                            </option>
                        ))}
                    </select>
                }
            />
            <ConfigItem
                isHost={isHost}
                label="Player Range"
                value={range}
                input={
                    <select
                        className="select-lg cursor-pointer opacity-0 w-full max-w-xs"
                        value={gameStats.config.init_range}
                        onChange={({target: {value}}) =>
                            configHandler({InitRange: Number(value)})
                        }
                    >
                        {Object.entries(TEMPLATES.initRange).map(([k, v]) => (
                            <option
                                key={k}
                                value={v}
                                className="text-base bg-base-100"
                            >
                                {k}
                            </option>
                        ))}
                    </select>
                }
            />
        </>
    );
}
