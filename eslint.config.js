import ashNazg from 'eslint-config-ash-nazg';
import globals from 'globals';

export default [
    {
        ignores: [
            'polyfills/browser-polyfill.min.js',
            'options/jml.js'
        ]
    },
    ...ashNazg(['sauron', 'browser']).map((cfg) => {
        return {
            ...cfg,
            ...(cfg.languageOptions
                ? {
                    languageOptions: {
                        ...cfg.languageOptions,
                        globals: {
                            ...cfg.languageOptions.globals,
                            ...globals.webextensions
                        }
                    }
                }
                : {})
        };
    }),
    {
        rules: {
            '@stylistic/indent': ['error', 4, {outerIIFEBody: 0}]
        }
    }
];
