const fs = require('fs');
TYPES = ['info', 'success', 'warning', 'error'];
COMPONENTS = ['alert', 'badge'];
const SAFELIST = TYPES.reduce(
    (acc, T) => [...acc, ...COMPONENTS.map((C) => C + '-' + T)],
    []
);
// fs.writeFileSync('tw_safelist.txt', SAFELIST.join(`\n`), {flag: 'w'});
module.exports = {
    mode: 'jit',
    purge: {
        content: [
            './pages/**/*.{js,ts,jsx,tsx}',
            './components/**/*.{js,ts,jsx,tsx}',
            './tw_safelist.txt',
        ],
    },
    darkMode: 'media',
    theme: {
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [require('daisyui')],
    safelist: [SAFELIST],
};
