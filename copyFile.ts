import * as fs from 'fs';
import * as path from 'path';

const copyPackageJson = () => {
    try {
        // Create all required directories
        const dirs = [
            'dist/handlers/authenticate',
            'dist/handlers/notification'
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Read package.json
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        // Keep only production dependencies
        const prodPackageJson = {
            ...packageJson,
            devDependencies: {},
            scripts: {
                start: packageJson.scripts?.start || 'node index.js'
            }
        };

        // Write package.json to each handler directory
        dirs.forEach(dir => {
            fs.writeFileSync(
                path.join(dir, 'package.json'),
                JSON.stringify(prodPackageJson, null, 2)
            );

            // Copy the compiled JS files to their respective directories
            const handlerName = path.basename(dir);
            if (fs.existsSync(`dist/handlers/${handlerName}.js`)) {
                fs.copyFileSync(
                    `dist/handlers/${handlerName}.js`,
                    path.join(dir, `${handlerName}.js`)
                );
            }
        });

        // Install dependencies in each handler directory
        console.log('📦 Installing production dependencies...');
        const { execSync } = require('child_process');
        
        dirs.forEach(dir => {
            console.log(`Installing dependencies in ${dir}...`);
            execSync(`cd ${dir} && npm install --production`, { stdio: 'inherit' });
        });

        console.log('✅ All files copied and dependencies installed successfully');

    } catch (error) {
        console.error('❌ Error during file operations:', error);
        process.exit(1);
    }
};

copyPackageJson();