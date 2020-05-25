#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cleaner = require('./compile/cleaner');
const formatter = require('./compile/formatter');
const parser = require('./compile/parser');
const transformer = require('./compile/transformer');

/**
 * Path
 * @string
 */
const dirname = path.join(__dirname);
const dbpath = path.join(dirname, 'dist', 'db.json');

/**
 * Mask searching
 * @string
 */
const mask = 'source/**/*.svg';

/**
 * Collection icons by `source` directory
 * @Object
 */
const db = {
    icons: [],
    duplicate: {},
    indexjs: [],
};

// Let'go, searching!
glob(path.join(dirname, mask), {}, async function (error, files) {
    if (error) {
        throw new Error(error);
    }

    // Get structure icons
    files.forEach((filepath) => {
        const parse = path.parse(filepath);

        const id = parse.name;
        const name = formatter.getComponentName(parse.name);
        const type = path.basename(parse.dir);

        // Checks duplicate icon name in different directories
        if (name in db.duplicate) {
            throw new Error(`Duplicate icon data ${type}/${name}, ${parse.base}`);
        }

        db.duplicate[name] = true;

        // Save to db
        db.icons.push({
            id,
            name,
            category: type,
            filename: parse.base,
            filepath: path.relative(dirname, filepath),
        });
    });

    // Save to db.json
    const dbDir = path.dirname(dbpath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
    fs.writeFileSync(dbpath, JSON.stringify(db.icons, null, 2), 'utf-8');

    // Convert svg to React components
    for (const icon of db.icons) {
        const directory = path.join(dirname, 'dist', icon.name);
        const location = path.join(dirname, 'dist', `${icon.name}/${icon.name}.tsx`);
        const indexts = path.join(dirname, 'dist', `${icon.name}/index.ts`);

        // Get content and cleaned
        const content = fs.readFileSync(path.join(dirname, icon.filepath), 'utf8');
        const svgo = await cleaner(content);

        // Parse
        const parse = parser.parse(svgo.data);
        const parseParentWithout =
            parse.children[0] && parse.children[0].tagName === 'svg' ? parse.children[0].children : parse;

        const morph = transformer.transform(parseParentWithout);
        const svg = parser.stringify(morph);

        // Generate code
        const code = formatter.getComponent(icon.name, svg);

        // Write code
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }

        // TODO: Было бы круто так, но что-то не подхватывает prettier наш конфиг
        // fs.writeFileSync(location, formatter.format(code), 'utf-8');
        // Сейчас форматируется через вызов npx prettier в package.json
        fs.writeFileSync(location, code, 'utf-8');

        // Write index.ts
        fs.writeFileSync(indexts, `export * from './${icon.name}';`, 'utf-8');

        // Generate global index.js
        db.indexjs.push(`export * from './${icon.name}';`);
    }

    // Write global dist/index.ts
    fs.writeFileSync(path.join(dirname, 'dist', 'index.ts'), db.indexjs.join('\r\n'), 'utf-8');
});
