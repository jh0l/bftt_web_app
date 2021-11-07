import Settings from './svg/Settings';
import {Game as GameState} from '../state/game';
import RelayWS from '../state/websockets';
import {strColor} from '../lib/colors';
import {useEffect, useMemo, useRef} from 'react';
import {Tile} from './Tile';
import {useRecoilValue} from 'recoil';
import {userAtom} from '../state/user';

export function Board({game}: {game: GameState}) {
    const len = game.board.length;
    useEffect(() => {});
    const tileMap = useMemo(() => {
        return Array(len * len)
            .fill(0)
            .map((_, i) => (
                <Tile key={i} i={i} len={len} game_id={game.game_id} />
            ));
    }, [len, game]);
    return (
        <div
            className="shadow-2xl"
            style={{
                margin: '0 auto',
                boxSizing: 'border-box',
                display: 'grid',
                gridTemplateColumns: `repeat(${len}, 1fr)`,
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

export default function Game({game}: {game: GameState}) {
    return (
        <div className="flex flex-grow flex-col lg:flex-row justify-center items-center">
            <Sizer>
                <Board game={game} />
            </Sizer>
            <Sidebar game={game} />
        </div>
    );
}

function Sidebar({game}: {game: GameState}) {
    const userId = useRecoilValue(userAtom);
    return (
        <div className="flex flex-col gap-2 mx-6 w-72">
            <h1 className="m-5 text-4xl font-bold">{game.game_id}</h1>
            <div className="divider">
                {Object.keys(game.players).length} Players
            </div>
            <div className="shadow visible">
                <div
                    className={
                        'indicator stat bg-' + strColor(game.host_user_id)
                    }
                >
                    {game.host_user_id === userId?.user_id && (
                        <div className="indicator-item badge badge-primary">
                            💻
                        </div>
                    )}
                    <div className="stat-figure text-neutral">• • •</div>
                    <div className="stat-title text-black">Host</div>
                    <div className="text-black font-bold">
                        {game.host_user_id || <pre> </pre>}
                    </div>
                </div>
            </div>
            {Object.entries(game.players)
                .filter(([k]) => k != game.host_user_id)
                .map(([id]) => (
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
                    <div className="stat-value">{game.turn_time_secs} secs</div>
                </div>
            </div>
            <GamePhase game={game} />
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
