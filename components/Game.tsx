import Settings from './svg/Settings';
import X from './svg/X';
import {Game as GameState, Pos} from '../state/game';
import RelayWS from '../state/websockets';
import {strColor} from '../lib/colors';
import {useCallback, useMemo} from 'react';

function tilePerimeter({x, y}: Pos, len: number): number[] {
    const c = y * len + x;
    return [c];
}

export function Board({game, userId}: {game: GameState; userId: string}) {
    const len = game.board.length;
    const actionables = useMemo(() => {
        const res = Array(len * len);
        const player = game.players[userId];
        for (let i of tilePerimeter(player.pos, len)) {
            res[i] = true;
            console.log(i);
        }
        console.log(player);
        return res;
    }, [game, userId, len]);
    const tileAction = useCallback(
        (x: number, y: number) => {
            const c = y * len + x;
            if (!actionables[c]) return;
            alert(x + ' | ' + y);
        },
        [actionables, len]
    );
    return (
        <div className="border-2 border-gray-900 p-1 rounded-lg shadow-lg max-h-10 board-scale xl:w-140 xl:h-140 lg:w-130 lg:h-130 md:w-120 md:h-120 sm:w-96 sm:h-96 w-96 h-96">
            <div
                className="w-full h-full"
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${len}, 1fr)`,
                    gridTemplateRows: `repeat(${len}, 1fr)`,
                    gridColumnGap: '0px',
                    gridRowGap: '0px',
                }}
            >
                {game.board.flat(1).map((v, i) => (
                    <Tile
                        key={i}
                        v={v}
                        i={i}
                        len={len}
                        action={actionables[i] ? tileAction : undefined}
                    />
                ))}
            </div>
        </div>
    );
}

function Tile({
    v,
    i,
    len,
    action,
}: {
    v: string | null;
    i: number;
    len: number;
    action?: (x: number, y: number) => void;
}) {
    const x = i % len;
    const y = Math.floor(i / len);
    return (
        <span
            style={{overflow: 'hidden'}}
            className={
                'relative ' +
                ((Math.floor(i / len) + i) % 2 == 0
                    ? ' bg-gray-500'
                    : ' bg-gray-400')
            }
        >
            <span
                className={
                    'text-black flex justify-center items-center text-center ' +
                    (v != null && 'shadow-md z-10 bg-' + strColor(v))
                }
            >
                <pre>
                    x:{x}
                    {`\n`}y:{y}
                </pre>
                <span className="absolute">
                    <b>{i}</b>
                </span>
                {action && (
                    <button
                        className="absolute btn btn-tile btn-square btn-outline rounded-lg"
                        onClick={() => action(x, y)}
                    />
                )}
            </span>
        </span>
    );
}

export default function Game({
    game,
    userId,
}: {
    game: GameState;
    userId: string;
}) {
    return (
        <div className="flex flex-grow flex-col sm:flex-row justify-center">
            <div className="flex flex-col gap-2 mr-6 w-58 overflow-hidden">
                <h1 className="m-5 text-4xl font-bold">{game.game_id}</h1>
                <div className="divider">
                    {Object.keys(game.players).length} Players
                </div>
                <div className="shadow stats" style={{overflow: 'hidden'}}>
                    <div className={'stat bg-' + strColor(game.host_user_id)}>
                        <div className="stat-title text-black">Host</div>
                        <div className="stat-value text-black">
                            {game.host_user_id || <pre> </pre>}
                        </div>
                    </div>
                </div>
                {Object.entries(game.players)
                    .filter(([k]) => k != game.host_user_id)
                    .map(([id]) => (
                        <div className="shadow stats" key={id}>
                            <div className={'stat bg-' + strColor(id)}>
                                <div className="stat-figure text-neutral btn btn-outline btn-square btn-sm">
                                    <X />
                                </div>
                                <div className="stat-value text-black">
                                    {id || <pre> </pre>}
                                </div>
                            </div>
                        </div>
                    ))}
                <div className="divider">Settings</div>
                <div className="shadow stats">
                    <div className="stat">
                        <div className="stat-figure text-neutral">
                            <Settings />
                        </div>
                        <div className="stat-desc">Time per turn</div>
                        <div className="stat-value">
                            {game.turn_time_secs} secs
                        </div>
                    </div>
                </div>
                <GamePhase game={game} />
            </div>
            <Board game={game} userId={userId} />
        </div>
    );
}
function GamePhase({game}: {game: GameState}) {
    const startGame = () => {
        RelayWS.sendStartGame(game.game_id);
    };
    return (
        <>
            <div className="divider"></div>
            {game.phase == 'Init' && (
                <button
                    className="btn btn-block btn-primary"
                    onClick={startGame}
                >
                    Play
                </button>
            )}
            {game.phase == 'InProg' && (
                <h1 className="m-5 text-3xl font-bold">{'<Clock />'}</h1>
            )}
        </>
    );
}
