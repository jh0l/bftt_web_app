import {GameStats} from '../state/game';
import RelayWS from '../state/websockets';
import {useEffect, useMemo, useRef} from 'react';
import {Tile} from './Tile';
import GameSidebar from './GameSidebar';

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

// make size of squares whole numbers, avoid uneven spacing
// formula by Joshua Rasquinha (oklusion) (I'm dumb)
function sizeDivisible(source: number, divisor: number) {
    return source - (source % divisor);
}

function Sizer({
    children,
    boardSize = 18,
}: {
    children: JSX.Element;
    boardSize?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const resizeListener = () => {
        requestAnimationFrame(() => {
            if (ref.current) {
                let {width, height} = document.body.getBoundingClientRect();
                height = height;
                const sizeDirty = Math.min(width, height) - 20;
                const size = sizeDivisible(sizeDirty, boardSize) + 'px';
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
        <div className="flex flex-grow flex-col lg:flex-row justify-center items-center lg:items-start">
            <Sizer>
                <Board gameStats={gameStats} />
            </Sizer>
            <GameSidebar gameStats={gameStats} playerIds={playerIds} />
        </div>
    );
}
