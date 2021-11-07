import {
    boardTileByUserFamily,
    gamesAtomFamily,
    Player,
    PlayerAction,
} from '../state/game';
import {strColor} from '../lib/colors';
import {useRecoilValue} from 'recoil';
import styles from './Tile.module.css';
import {useState} from 'react';
import {userAtom} from '../state/user';
import RelayWS from '../state/websockets';

function PlayerTile({user_id, game_id}: {user_id: string; game_id: string}) {
    const gameData = useRecoilValue(gamesAtomFamily(game_id));
    const player = gameData?.players[user_id];
    if (gameData && player) {
        return (
            <div
                className={
                    'select-none p-1 w-full h-full rounded-lg flex justify-center items-center absolute ' +
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

function inGridRange(player: Player, {x, y}: {x: number; y: number}) {
    const xRes = player.pos.x - x;
    const yRes = player.pos.y - y;
    const range = Math.min(player.range || 2, player.action_points);
    if (xRes <= range && xRes >= -range) {
        if (yRes <= range && yRes >= -range) {
            return true;
        }
    }
    return false;
}

function MoveAction({
    xy,
    game_id,
}: {
    xy: {x: number; y: number};
    game_id: string;
}) {
    const user_id = useRecoilValue(userAtom)?.user_id;
    const game = useRecoilValue(gamesAtomFamily(game_id));
    const player = game?.players[user_id || ''];
    const handleAction = () =>
        user_id
            ? RelayWS.sendPlayerAction({
                  user_id,
                  game_id,
                  action: {MoveAction: {pos: {x: xy.x, y: xy.y}}},
              })
            : console.warn('user not loaded');

    if (
        user_id &&
        ((player && inGridRange(player, xy)) || game?.phase === 'Init')
    )
        return (
            <div
                onClick={handleAction}
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
