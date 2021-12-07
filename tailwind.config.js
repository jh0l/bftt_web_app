// // GENERATE WHITELISTED CSS rules
// const fs = require('fs');
// const TYPES = ['info', 'success', 'warning', 'error'];
// const COMPONENTS = ['alert', 'badge'];

// function zip(arr, brr, combine) {
//     return arr.reduce((acc, a) => [...acc, ...brr.map(combine(a))], []);
// }

// const SAFELIST = zip(COMPONENTS, TYPES, (a) => (b) => a + '-' + b);

// const colors = ['red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink'];
// const grades = ['100', '300', '500', '700', '900'];
// const typees = ['bg', 'border', 'text'];

// const cg = zip(colors, grades, (c) => (g) => c + '-' + g);
// const tcg = zip(typees, cg, (t) => (cg) => t + '-' + cg);

// SAFELIST.push(...tcg);
// SAFELIST.push(
//     ...`btn-success
// btn-error
// btn-info
// dropdown-top
// opacity-0
// opacity-100
// `.split('\n')
// );
// fs.writeFileSync('tw_safelist.txt', SAFELIST.join(`\n`), { flag: 'w' });

// ACTUAL CONFIG

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
        extend: {
            fontSize: {
                '2xs': '0.35rem',
            },
            spacing: {
                110: '27rem',
                120: '30rem',
                130: '46rem',
                140: '52rem',
                150: '39rem',
            },
            animation: {
                'bounce-once': 'bounceonce 0.1s ease-out 1',
            },
            keyframes: {
                bounceonce: {
                    '0%, 100%': {
                        transform: 'translate(-50%, -50%)',
                    },
                    '25%': {
                        transform: 'translate(-50%, -55%)',
                    },
                    '75%': {
                        transform: 'translate(-52%, -50%)',
                    },
                },
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [require('daisyui')],
};
