import {
    boardTileAtomSelectorFamily,
    gamesAtomFamily,
    Player,
} from '../state/game';
import {strColor} from '../lib/colors';
import {useRecoilValue} from 'recoil';
import styles from './Tile.module.css';
import {useState} from 'react';
import {userAtom} from '../state/user';

function PlayerTile({playerId, game_id}: {playerId: string; game_id: string}) {
    const gameData = useRecoilValue(gamesAtomFamily(game_id));
    const player = gameData?.players[playerId];
    if (gameData && player) {
        return (
            <div
                className={
                    'p-1 w-full h-full rounded-lg flex justify-center items-center absolute ' +
                    ('shadow-md z-10 bg-' + strColor(playerId))
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
                        {playerId}
                    </div>
                    <div
                        className={
                            'flex justify-center items-center flex-row text-black font-bold ' +
                            styles['ts-tile']
                        }
                    >
                        <span className="px-1">{player.moves}</span>
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

function inGridRange(player: Player, {x, y}: {x: number; y: number}) {
    const xRes = player.pos.x - x;
    const yRes = player.pos.y - y;
    const range = Math.min(player.range || 2, player.moves);
    if (xRes <= range && xRes >= -range) {
        if (yRes <= range && yRes >= -range) {
            return true;
        }
    }
    return false;
}

function HoverAction({
    xy,
    game_id,
}: {
    xy: {x: number; y: number};
    game_id: string;
}) {
    const user_id = useRecoilValue(userAtom)?.user_id;
    const player = useRecoilValue(gamesAtomFamily(game_id))?.players[
        user_id || ''
    ];
    if (player && inGridRange(player, xy))
        return (
            <div
                className={
                    'w-full h-full flex justify-center items-center absolute cursor-pointer leading-none'
                }
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(255,255,255,0.25)',
                }}
            >
                move here
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
    const v = useRecoilValue(boardTileAtomSelectorFamily({x, y, game_id}));
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
            {v && <PlayerTile playerId={v} game_id={game_id} />}
            {isHover && v === null && (
                <HoverAction xy={{x, y}} game_id={game_id} />
            )}
        </div>
    );
}
