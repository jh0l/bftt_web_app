import {
    boardTileByUserFamily,
    gamePlayersAtomFamily,
    gameStatsAtomFamily,
    Player,
    Pos,
} from '../state/game';
import {strColor} from '../lib/colors';
import {atom, useRecoilState, useRecoilValue} from 'recoil';
import styles from './Tile.module.css';
import React, {useEffect, useRef, useState} from 'react';
import {userAtom} from '../state/user';
import RelayWS from '../state/websockets';

function PlayerTile({user_id, game_id}: {user_id: string; game_id: string}) {
    const player = useRecoilValue(gamePlayersAtomFamily({game_id, user_id}));
    if (player) {
        return (
            <div
                className={
                    'animate-bounce-once select-none p-1 w-full h-full rounded-lg flex justify-center items-center absolute ' +
                    ('shadow-md z-10 bg-' + strColor(user_id))
                }
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div
                    className={
                        'w-full h-full rounded-md flex justify-center items-center flex-col leading-none text-sm ' +
                        styles['centeroverflow']
                    }
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.48)',
                    }}
                >
                    <div
                        className={'text-black font-bold ' + styles['ts-tile']}
                    >
                        {user_id}
                    </div>
                    <div
                        className={
                            'flex justify-center items-center flex-row text-black font-bold ' +
                            styles['ts-tile']
                        }
                    >
                        <span className="px-1">{player.action_points}</span>
                        <img alt="Action Token" src="/ActionToken.png"></img>
                    </div>
                    <div
                        className={
                            'flex justify-center items-center flex-row text-black font-bold ' +
                            styles['ts-tile']
                        }
                    >
                        <span className="px-1">{player.lives}</span>
                        <img alt="Health Points" src="/Heart.png"></img>
                    </div>
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
                'grid-item relative ' +
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
