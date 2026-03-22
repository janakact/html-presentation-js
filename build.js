const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
    const themeDir = path.join(__dirname, 'src', 'theme');
    let themeFiles = [];
    if (fs.existsSync(themeDir)) {
        themeFiles = fs.readdirSync(themeDir)
            .filter(file => file.endsWith('.css'))
            .map(file => path.join('src', 'theme', file));
    }

    const cssEntryPoints = ['src/presentation.css', ...themeFiles];

    const jsCommon = {
        entryPoints: ['src/presentation.ts'],
        bundle: true,
    };

    try {
        await Promise.all([
            esbuild.build({ ...jsCommon, outfile: 'dist/presentation.js', format: 'iife', globalName: 'PresentationWindow' }),
            esbuild.build({ ...jsCommon, outfile: 'dist/presentation.min.js', format: 'iife', globalName: 'PresentationWindow', minify: true }),
            esbuild.build({ ...jsCommon, outfile: 'dist/presentation.esm.js', format: 'esm' }),
            esbuild.build({ entryPoints: cssEntryPoints, outdir: 'dist', minify: true })
        ]);
        console.log('Build completed successfully.');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
