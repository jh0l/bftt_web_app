import {
    boardHeartsByUserFamily,
    boardTileByUserFamily,
    gamePlayersAtomFamily,
    gameStatsAtomFamily,
    Player,
    Pos,
} from '../state/game';
import {strColor} from '../lib/colors';
import {useRecoilValue} from 'recoil';
import styles from './Tile.module.css';
import React, {useCallback, useMemo, useState} from 'react';
import {User, userAtom} from '../state/user';
import RelayWS from '../state/websockets';
import Portal from './Portal';
import MoveTileSingleton from './MoveTileSingleton';

function ActionMenu({children}: {children: React.ReactNode}) {
    return (
        <ul className="menu rounded-lg flex justify-center w-full gap-1 z-50">
            {children}
        </ul>
    );
}

// TODO use Board coords to create parent div of PlayerOverlay for hiding overflowing content
function PlayerOverlay({
    game_id,
    user_id,
    user,
    isOn,
}: {
    game_id: string;
    user_id: string;
    user: User;
    isOn: boolean;
}) {
    const player = useRecoilValue(gamePlayersAtomFamily({game_id, user_id}));
    const userPlayer = useRecoilValue(
        gamePlayersAtomFamily({game_id, user_id: user.user_id})
    );
    const gameStats = useRecoilValue(gameStatsAtomFamily(game_id));
    if (!gameStats || !userPlayer || !player) {
        return null;
    }
    const isUser = player.user_id === userPlayer.user_id;
    const action_points =
        typeof userPlayer.action_points === 'number'
            ? userPlayer.action_points
            : gameStats.phase == 'Init' && isUser
            ? gameStats.config.init_action_points
            : false;
    if (isOn && gameStats.phase === 'InProg') {
        if (player.lives > 0) {
            if (isUser) {
                const upgradeHandler = () =>
                    RelayWS.sendPlayerAction({
                        action: {RangeUpgrade: {point_cost: 3}},
                        game_id,
                        user_id,
                    });
                const healHandler = () =>
                    RelayWS.sendPlayerAction({
                        action: {Heal: {point_cost: 3}},
                        game_id,
                        user_id,
                    });
                return (
                    <ActionMenu>
                        <li>
                            <button
                                className="btn btn-xs "
                                disabled={action_points < 3}
                                onMouseUp={upgradeHandler}
                            >
                                upgrade
                            </button>
                        </li>

                        <li>
                            <button
                                className="btn btn-xs "
                                disabled={action_points < 3}
                                onMouseUp={healHandler}
                            >
                                heal
                            </button>
                        </li>
                    </ActionMenu>
                );
            }
            if (inRange(userPlayer, player.pos)) {
                const attackHandler = () =>
                    RelayWS.sendPlayerAction({
                        action: {
                            Attack: {lives_effect: 1, target_user_id: user_id},
                        },
                        game_id,
                        user_id,
                    });
                const giveHandler = () =>
                    RelayWS.sendPlayerAction({
                        action: {Give: {target_user_id: user_id}},
                        game_id,
                        user_id,
                    });
                return (
                    <ActionMenu>
                        <li>
                            <button
                                className="btn btn-xs  btn-block"
                                disabled={action_points < 1}
                                onMouseUp={attackHandler}
                            >
                                attack
                            </button>
                        </li>
                        <li>
                            <button
                                className="btn btn-xs "
                                disabled={action_points < 1}
                                onMouseUp={giveHandler}
                            >
                                give
                            </button>
                        </li>
                    </ActionMenu>
                );
            }
        } else if (!isUser) {
            const reviveHandler = () =>
                RelayWS.sendPlayerAction({
                    action: {Revive: {target_user_id: user_id, point_cost: 0}},
                    game_id,
                    user_id,
                });
            return (
                <ActionMenu>
                    <li>
                        <button
                            className="btn btn-xs "
                            disabled={userPlayer.lives < 1}
                            onMouseUp={reviveHandler}
                        >
                            revive
                        </button>
                    </li>
                </ActionMenu>
            );
        }
    }
    const lives = player.lives > 99 ? '99+' : player.lives;
    const range = player.range > 99 ? '99+' : player.range;
    return (
        <>
            <div className="absolute flex pointer-events-none select-none bottom-0 md:bottom-1 md:left-1">
                <div
                    className={
                        'badge badge-sm md:badge-xs font-bold' +
                        (lives === 0 ? ' btn-error bg-red-500' : '')
                    }
                >
                    <img
                        className="pr-px"
                        src="/Heart.png"
                        width="13"
                        height="13"
                        alt="lives"
                    ></img>
                    <span className="pl-px">{lives}</span>
                </div>
            </div>
            <div className="absolute flex pointer-events-none select-none bottom-0 md:bottom-1 right-0 md:right-1">
                <div
                    className={
                        'badge badge-sm md:badge-xs font-bold' +
                        (lives === 0 ? ' btn-error bg-red-500' : '')
                    }
                >
                    <img
                        className="pr-0.5"
                        src="/Range.png"
                        width="13"
                        height="13"
                        alt="player range"
                    ></img>
                    {range}
                </div>
            </div>
            {userPlayer.user_id === player.user_id && (
                <div className="badge md:badge-sm badge-primary font-bold absolute pointer-events-none select-none top-0 md:top-1 left-0 md:left-1">
                    <img
                        className="pr-0.5"
                        src="/ActionToken.png"
                        width="13"
                        height="13"
                        alt="lives"
                    ></img>
                    {action_points > 99 ? '99+' : action_points}
                </div>
            )}
        </>
    );
}
interface PlayerTileProps {
    user_id: string;
    game_id: string;
    coords: {
        left: number;
        top: number;
        width: number;
        height: number;
        x: number;
        y: number;
        len: number;
    };
}
function PlayerTile({user_id, game_id, coords}: PlayerTileProps) {
    const user = useRecoilValue(userAtom);
    const [isOn, setOn] = useState(false);
    const tileCoords = useMemo(() => {
        const {left, top, width, height, x, y, len} = coords;
        const tile = width / len;
        return {
            left: left + tile * x,
            top: top + tile * y,
            width: tile,
            height: height / len,
        };
    }, [coords]);
    return (
        <div
            onMouseEnter={() => {
                setOn(true);
            }}
            onMouseLeave={() => {
                setOn(false);
            }}
            className="overflow-visible rounded-lg translate-center flex justify-center items-center absolute w-full h-full"
        >
            <div
                className={
                    'translate-center flex justify-center items-center w-full h-full md:w-5/6 md:h-5/6 animate-bounce-once select-none p-1 rounded-lg ' +
                    ('shadow-md z-10 bg-' + strColor(user_id))
                }
            >
                <div
                    tabIndex={0}
                    className={
                        'w-full h-full rounded-md flex justify-center items-center flex-col leading-none text-sm ' +
                        styles['centeroverflow']
                    }
                    style={{
                        backgroundColor: '#ffffff67',
                    }}
                >
                    <div
                        className={'text-black font-bold ' + styles['ts-tile']}
                    >
                        {user_id}
                    </div>
                </div>
            </div>
            <Portal>
                <div
                    className={'absolute flex ' + (isOn ? ' z-10' : 'z-0')}
                    style={tileCoords}
                >
                    {user && (
                        <PlayerOverlay
                            game_id={game_id}
                            user_id={user_id}
                            user={user}
                            isOn={isOn}
                        />
                    )}
                </div>
            </Portal>
        </div>
    );
}

export function JuryTile({
    user_id,
    game_id,
}: {
    user_id: string;
    game_id: string;
}) {
    const player = useRecoilValue(gamePlayersAtomFamily({user_id, game_id}));
    if (!player || player.lives) return null;
    return (
        <div
            className={
                'w-10 h-10 flex justify-center items-center animate-bounce-once select-none p-1 rounded-lg ' +
                ('shadow-md z-10 bg-' + strColor(user_id))
            }
        >
            <div
                tabIndex={0}
                className={
                    'w-full h-full rounded-md flex justify-center items-center flex-col leading-none text-sm ' +
                    styles['centeroverflow']
                }
                style={{
                    backgroundColor: '#ffffff67',
                }}
            >
                <div className={'text-black font-bold ' + styles['ts-tile']}>
                    {user_id}
                </div>
            </div>
        </div>
    );
}

function xyDist(a: Pos, b: Pos) {
    let x, y;
    if (a.x < b.x) x = b.x - a.x;
    else x = a.x - b.x;
    if (a.y < b.y) y = b.y - a.y;
    else y = a.y - b.y;
    return {x, y};
}
function inRange({pos, range, action_points}: Player, dest: Pos) {
    if (!action_points) return false;
    let dist = xyDist(pos, dest);
    if (dist.x > range || dist.y > range) {
        return false;
    }
    return true;
}

function MoveAction({
    xy,
    game_id,
}: {
    xy: {x: number; y: number};
    game_id: string;
}) {
    const user_id = useRecoilValue(userAtom)?.user_id;
    const userPlayer = useRecoilValue(
        gamePlayersAtomFamily({game_id, user_id: user_id || ''})
    );
    const gameStats = useRecoilValue(gameStatsAtomFamily(game_id));

    if (
        user_id &&
        userPlayer &&
        ((gameStats?.phase === 'Init' &&
            gameStats.config.init_pos === 'Manual') ||
            (gameStats?.phase === 'InProg' && inRange(userPlayer, xy)))
    ) {
        const handleAction = () => {
            user_id
                ? RelayWS.sendPlayerAction({
                      user_id,
                      game_id,
                      action: {Move: {pos: {x: xy.x, y: xy.y}}},
                  })
                : console.warn('user not loaded');
        };
        const handleMouseAction: React.MouseEventHandler<HTMLDivElement> = (
            e
        ) => {
            if (e.button !== 0) return;
            handleAction();
        };
        return (
            <div
                onMouseUp={handleMouseAction}
                onTouchStart={handleAction}
                className={
                    'w-full h-full text-center flex justify-center items-center absolute inset-1/2 cursor-pointer select-none leading-none'
                }
                style={{
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#4141413b',
                }}
            >
                <span className="opacity-10">move</span>
            </div>
        );
    }
    return null;
}

export function Tile({
    i,
    len,
    game_id,
    coords,
}: {
    i: number;
    len: number;
    game_id: string;
    coords: {} | {left: number; top: number; width: number; height: number};
}) {
    const x = i % len;
    const y = Math.floor(i / len);
    const user_id = useRecoilValue(boardTileByUserFamily({x, y, game_id}));
    const hearts = useRecoilValue(boardHeartsByUserFamily({x, y, game_id}));
    const [isHover, setHover] = useState(false);
    const unmount = useCallback(() => setHover(false), []);
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onTouchEnd={() => setHover(true)}
            onMouseLeave={unmount}
            className={
                'overflow-visible grid-item relative ' +
                ((len % 2 ? i % 2 : (Math.floor(i / len) + i) % 2)
                    ? ' bg-gray-500'
                    : ' bg-gray-400')
            }
        >
            {user_id && 'top' in coords ? (
                <PlayerTile
                    user_id={user_id}
                    game_id={game_id}
                    coords={{...coords, x, y, len}}
                />
            ) : (
                <div className="select-none text-xs text-base-100">
                    <div className="absolute top-0.5 md:top-0 right-0.5">
                        {y}
                    </div>
                    <div className="absolute bottom-0 left-0.5 md:left-1">
                        {(x + 10).toString(36).toUpperCase()}
                    </div>
                </div>
            )}
            {hearts != null && hearts > 0 && (
                <div className="absolute top-2 md:top-1 right-2 text-black">
                    <div>
                        <img
                            className="pr-px mr-1 inline"
                            src="/Heart.png"
                            width="13"
                            height="13"
                            alt="lives"
                        ></img>
                        {hearts}
                    </div>
                </div>
            )}
            {isHover && !user_id && (
                <MoveTileSingleton tag={i} unmount={unmount}>
                    <MoveAction xy={{x, y}} game_id={game_id} />
                </MoveTileSingleton>
            )}
        </div>
    );
}
