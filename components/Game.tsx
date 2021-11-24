import {GameStats} from '../state/game';
import {useLayoutEffect, useMemo, useRef} from 'react';
import {Tile} from './Tile';
import GameSidebar from './GameSidebar';

export function Board({gameStats}: {gameStats: GameStats}) {
    const {boardSize: size, game_id} = gameStats;
    const tileMap = useMemo(() => {
        return Array(size * size)
            .fill(0)
            .map((_, i) => <Tile key={i} i={i} len={size} game_id={game_id} />);
    }, [size, game_id]);
    return (
        <div className="px-3">
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
        </div>
    );
}

// make size of squares whole numbers, avoid uneven spacing
// formula by Joshua Rasquinha (oklusion) (I'm dumb)
function sizeDivisible(source: number, divisor: number) {
    return source - (source % divisor);
}

function Sizer({children, divisor}: {children: JSX.Element; divisor: number}) {
    const ref = useRef<HTMLDivElement>(null);
    const resizeListener = () => {
        requestAnimationFrame(() => {
            if (ref.current && parent) {
                let {width, height} = document.body.getBoundingClientRect();
                const sizeDirty = Math.min(width, height) - 20;
                const size = sizeDivisible(sizeDirty, divisor) + 'px';
                ref.current.setAttribute('style', 'width: 1px; height: 1px');
                ref.current.style.height = size;
                ref.current.style.width = size;
            }
        });
    };
    useLayoutEffect(() => {
        resizeListener();
        window.addEventListener('resize', resizeListener);
        return () => window.removeEventListener('resize', resizeListener);
    });
    return (
        <div
            // style={{ margin: '0 auto' }}
            ref={ref}
        >
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
        <div className="flex flex-grow flex-col-reverse lg:flex-row-reverse justify-center items-center lg:items-start">
            <GameSidebar gameStats={gameStats} playerIds={playerIds} />
            <Sizer divisor={gameStats.boardSize}>
                <Board gameStats={gameStats} />
            </Sizer>
        </div>
    );
}
