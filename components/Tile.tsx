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
import React, {DOMElement, ReactNode, useRef, useState} from 'react';
import {userAtom} from '../state/user';
import RelayWS from '../state/websockets';
import Portal from './Portal';

function PlayerAction({user_id}: {user_id: string}) {
    const user = useRecoilValue(userAtom);
    if (user?.user_id == user_id)
        return (
            <ul
                tabIndex={0}
                className="menu rounded-lg grid grid-col-2 gap-1 z-50"
            >
                <li>
                    <button className="btn btn-sm">upgrade</button>
                </li>
                <li>
                    <button className="btn-info btn btn-sm ">give</button>
                </li>
                <li>
                    <button className="btn-success btn btn-sm ">move</button>
                </li>
            </ul>
        );
    return (
        <div
            // style={{transform: 'translateY(20%)'}}
            tabIndex={0}
            className="menu rounded-lg"
        >
            <div className="flex direction-row gap-1">
                <div>
                    <button className="btn-error btn btn-sm ">attack</button>
                </div>
            </div>
        </div>
    );
}
const btnRef: React.RefObject<HTMLDivElement> = React.createRef();
function PlayerTile({user_id, game_id}: {user_id: string; game_id: string}) {
    const player = useRecoilValue(gamePlayersAtomFamily({game_id, user_id}));
    const user = useRecoilValue(userAtom);
    const [isOn, setOn] = useState(false);
    const [coords, setCoords] = useState({});
    const updateTooltipCoords = (el: HTMLDivElement | null) => {
        const rect = el?.getBoundingClientRect();
        if (rect) {
            setCoords({
                left: (rect.x + rect.width) | 2,
                top: rect.y + window.scrollY,
            });
        }
    };
    if (player) {
        return (
            <div
                ref={btnRef}
                onMouseEnter={(e) => {
                    updateTooltipCoords(e.target as HTMLDivElement);
                    setOn(true);
                }}
                onMouseLeave={() => {
                    setOn(false);
                }}
                className="overflow-visible rounded-lg translate-center flex justify-center items-center absolute w-full h-full"
            >
                <div
                    className={
                        'indicator translate-center flex justify-center items-center absolute w-5/6 h-5/6 animate-bounce-once select-none p-1 rounded-lg ' +
                        ('shadow-md z-10 bg-' + strColor(user_id))
                    }
                >
                    {player?.user_id == user?.user_id && (
                        <div className="indicator-item indicator-start badge badge-primary">
                            💻
                        </div>
                    )}
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
                            className={
                                'text-black font-bold ' + styles['ts-tile']
                            }
                        >
                            {user_id}
                        </div>
                    </div>
                    {isOn && (
                        <Portal>
                            <div className="absolute" style={coords}>
                                <PlayerAction user_id={user_id} />
                            </div>
                        </Portal>
                    )}
                </div>
            </div>
        );
    }
    return null;
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
    const player = useRecoilValue(
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
        ((player && inRange(player, xy)) || gameStats?.phase === 'Init')
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
            ></div>
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
    const v = useRecoilValue(boardTileByUserFamily({x, y, game_id}));
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
            {v && <PlayerTile user_id={v} game_id={game_id} />}
            {isHover && v === null && (
                <MoveAction xy={{x, y}} game_id={game_id} />
            )}
        </div>
    );
}
