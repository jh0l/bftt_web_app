import Settings from './svg/Settings';
import {GameStats} from '../state/game';
import RelayWS from '../state/websockets';
import {strColor} from '../lib/colors';
import {useEffect, useMemo, useRef} from 'react';
import {Tile} from './Tile';
import {useRecoilValue} from 'recoil';
import {userAtom} from '../state/user';

export function Board({gameStats: {size, game_id}}: {gameStats: GameStats}) {
    const tileMap = useMemo(() => {
        return Array(size * size)
            .fill(0)
            .map((_, i) => <Tile key={i} i={i} len={size} game_id={game_id} />);
    }, [size, game_id]);
    return (
        <div
            className="shadow-2xl"
            style={{
                margin: '0 auto',
                boxSizing: 'border-box',
                display: 'grid',
                gridTemplateColumns: `repeat(${size}, 1fr)`,
                gridTemplateRows: `auto`,
            }}
        >
            {tileMap}
        </div>
    );
}

function Sizer({children}: {children: JSX.Element}) {
    const ref = useRef<HTMLDivElement>(null);
    const resizeListener = () => {
        requestAnimationFrame(() => {
            if (ref.current) {
                let {width, height} = document.body.getBoundingClientRect();
                height = height - 30;
                const size = Math.min(width, height) - 20 + 'px';
                ref.current.setAttribute('style', 'width: 1px; height: 1px');
                ref.current.style.height = size;
                ref.current.style.width = size;
            }
        });
    };
    useEffect(() => {
        resizeListener();
        window.addEventListener('resize', resizeListener);
        return () => window.removeEventListener('resize', resizeListener);
    });
    return (
        <div style={{margin: '0 auto'}} ref={ref}>
            {children}
        </div>
    );
}

export default function Game({
    gameStats,
    playerIds,
}: {
    gameStats: GameStats;
    playerIds: string[];
}) {
    return (
        <div className="flex flex-grow flex-col lg:flex-row justify-center items-center">
            <Sizer>
                <Board gameStats={gameStats} />
            </Sizer>
            <Sidebar gameStats={gameStats} playerIds={playerIds} />
        </div>
    );
}

function Sidebar({
    gameStats,
    playerIds,
}: {
    gameStats: GameStats;
    playerIds: string[];
}) {
    const userId = useRecoilValue(userAtom);
    return (
        <div className="flex flex-col gap-2 mx-6 w-72">
            <h1 className="m-5 text-4xl font-bold">{gameStats.game_id}</h1>
            <div className="divider">{playerIds.length} Players</div>
            <div className="shadow visible">
                <div
                    className={
                        'indicator stat bg-' + strColor(gameStats.host_user_id)
                    }
                >
                    {gameStats.host_user_id === userId?.user_id && (
                        <div className="indicator-item badge badge-primary">
                            💻
                        </div>
                    )}
                    <div className="stat-figure text-neutral">• • •</div>
                    <div className="stat-title text-black">Host</div>
                    <div className="text-black font-bold">
                        {gameStats.host_user_id || <pre> </pre>}
                    </div>
                </div>
            </div>
            {playerIds
                .filter((k) => k != gameStats.host_user_id)
                .map((id) => (
                    <div className="shadow" key={id}>
                        <div className={'indicator stat bg-' + strColor(id)}>
                            {id === userId?.user_id && (
                                <div className="indicator-item badge badge-primary">
                                    💻
                                </div>
                            )}
                            <div className="stat-figure text-neutral">
                                • • •
                            </div>
                            <div className="text-black font-bold">
                                {id || <pre> </pre>}
                            </div>
                        </div>
                    </div>
                ))}
            <div className="divider">Settings</div>
            <div className="shadow">
                <div className="stat">
                    <div className="stat-figure text-neutral">
                        <Settings />
                    </div>
                    <div className="stat-desc">Time per turn</div>
                    <div className="stat-value">
                        {gameStats.turn_time_secs} secs
                    </div>
                </div>
            </div>
            <GamePhase gameStats={gameStats} />
        </div>
    );
}

function GamePhase({gameStats}: {gameStats: GameStats}) {
    const startGame = () => {
        RelayWS.sendStartGame(gameStats.game_id);
    };
    return (
        <>
            <div className="divider"></div>
            {gameStats.phase == 'Init' && (
                <button
                    className="btn btn-block btn-primary"
                    onClick={startGame}
                >
                    Play
                </button>
            )}
            {gameStats.phase == 'InProg' && (
                <h1 className="m-5 text-3xl font-bold">{'<Clock />'}</h1>
            )}
        </>
    );
}
