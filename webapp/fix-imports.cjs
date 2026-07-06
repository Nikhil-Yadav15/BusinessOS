const fs = require('fs');
const path = require('path');

function fixImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixImports(fullPath);
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let relPathStr = path.relative(path.dirname(fullPath), 'p:/Atlas - BuisnessOS/CodeWork/BusinessOS/webapp/src').replace(/\\/g, '/');
            if (relPathStr === '') relPathStr = '.';
            
            const newContent = content.replace(/from\s+['"](?:\.\.\/)+((?:application|infrastructure)\/[^'"]+)['"]/g, `from '${relPathStr}/$1'`);
            
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Fixed', fullPath);
            }
        }
    }
}

fixImports('p:/Atlas - BuisnessOS/CodeWork/BusinessOS/webapp/src/app/api');
