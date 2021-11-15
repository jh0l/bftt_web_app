import {
    boardTileByUserFamily,
    gamePlayersAtomFamily,
    gameStatsAtomFamily,
    Player,
    Pos,
} from '../state/game';
import {strColor} from '../lib/colors';
import {useRecoilValue} from 'recoil';
import styles from './Tile.module.css';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {User, userAtom} from '../state/user';
import RelayWS from '../state/websockets';
import Portal from './Portal';

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
    if (
        isOn &&
        gameStats.phase === 'InProg' &&
        inRange(userPlayer, player.pos)
    ) {
        if (user.user_id === player.user_id)
            return (
                <ul className="menu rounded-lg grid grid-col-2 gap-1 z-50">
                    <li>
                        <button className="btn btn-xs btn-outline btn-info">
                            upgrade
                        </button>
                    </li>
                </ul>
            );
        const attackHandler = () =>
            RelayWS.sendPlayerAction({
                action: {Attack: {lives_effect: -1, target_user_id: user_id}},
                game_id,
                user_id,
            });
        return (
            <ul className="menu rounded-lg grid grid-col-2 gap-1 z-50">
                <li>
                    <button
                        className="btn btn-xs btn-outline btn-error"
                        onMouseDown={attackHandler}
                    >
                        attack
                    </button>
                </li>
                <li>
                    <button className="btn btn-xs btn-outline btn-success">
                        give
                    </button>
                </li>
            </ul>
        );
    }
    if (gameStats.phase === 'InProg') {
        const lives = player.lives > 99 ? '99+' : player.lives;
        const points = player.action_points > 99 ? '99+' : player.action_points;
        return (
            <div
                className="flex flex-row absolute translate-center"
                style={{top: 16}}
            >
                <div className="badge badge-xs">
                    {lives}
                    <img className="pl-0.5" src="/Heart.png" alt="lives"></img>
                </div>
                <div className="badge badge-xs">
                    {points}
                    <img
                        className="pl-0.5"
                        src="/ActionToken.png"
                        alt="action points"
                    ></img>
                </div>
            </div>
        );
    }
    return null;
}
function PlayerTile({user_id, game_id}: {user_id: string; game_id: string}) {
    const user = useRecoilValue(userAtom);
    const [isOn, setOn] = useState(false);
    const [coords, setCoords] = useState({});
    const btnRef = useRef<HTMLDivElement>(null);
    const updateTooltipCoords = useCallback(() => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) {
            setCoords({
                left: rect.x + rect.width / 2,
                top: rect.y + window.scrollY + rect.width / 2,
            });
        } else {
            console.log('player tile ' + user_id + ' no btnRef');
        }
    }, [user_id]);
    useLayoutEffect(() => {
        setTimeout(updateTooltipCoords, 1);
        window.addEventListener('resize', updateTooltipCoords);
        return () => {
            window.removeEventListener('resize', updateTooltipCoords);
        };
    }, [updateTooltipCoords, user_id]);
    return (
        <div
            ref={btnRef}
            onMouseEnter={() => {
                updateTooltipCoords();
                setOn(true);
            }}
            onMouseLeave={() => {
                setOn(false);
            }}
            className="overflow-visible rounded-lg translate-center flex justify-center items-center absolute w-full h-full"
        >
            <div
                className={
                    ' translate-center flex justify-center items-center absolute w-5/6 h-5/6 animate-bounce-once select-none p-1 rounded-lg ' +
                    ('shadow-md z-10 bg-' + strColor(user_id))
                }
            >
                <div
                    tabIndex={0}
                    className={
                        'indicator w-full h-full rounded-md flex justify-center items-center flex-col leading-none text-sm ' +
                        styles['centeroverflow']
                    }
                    style={{
                        backgroundColor: '#ffffff67',
                    }}
                >
                    {user_id == user?.user_id && (
                        <div className="indicator-item indicator-start badge badge-primary badge-xs">
                            💻
                        </div>
                    )}
                    <div
                        className={'text-black font-bold ' + styles['ts-tile']}
                    >
                        {user_id}
                    </div>
                </div>
            </div>
            <Portal>
                <div className="absolute" style={coords}>
                    <div className="relative">
                        <div className="absolute translate-center">
                            {user && (
                                <PlayerOverlay
                                    game_id={game_id}
                                    user_id={user_id}
                                    user={user}
                                    isOn={isOn}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Portal>
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

    const handleAction = () =>
        user_id
            ? RelayWS.sendPlayerAction({
                  user_id,
                  game_id,
                  action: {Move: {pos: {x: xy.x, y: xy.y}}},
              })
            : console.warn('user not loaded');

    if (
        user_id &&
        ((userPlayer && inRange(userPlayer, xy)) || gameStats?.phase === 'Init')
    )
        return (
            <div
                onMouseDown={handleAction}
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
    return null;
}

export function Tile({
    i,
    len,
    game_id,
}: {
    i: number;
    len: number;
    game_id: string;
}) {
    const x = i % len;
    const y = Math.floor(i / len);
    const user_id = useRecoilValue(boardTileByUserFamily({x, y, game_id}));
    const [isHover, setHover] = useState(false);
    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={
                'overflow-visible grid-item relative ' +
                ((Math.floor(i / len) + i) % 2 == 0
                    ? ' bg-gray-500'
                    : ' bg-gray-400')
            }
        >
            {user_id && <PlayerTile user_id={user_id} game_id={game_id} />}
            {isHover && !user_id && (
                <MoveAction xy={{x, y}} game_id={game_id} />
            )}
        </div>
    );
}
