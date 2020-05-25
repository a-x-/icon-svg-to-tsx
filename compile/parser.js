const svgp = require('svg-parser');

// Export
module.exports = {
    parse,
    stringify,
    stringifyProperties,
    stringifyStyle,
};

/**
 * String is string
 *
 * @param {*} value The value
 * @returns {bool} Returns flag
 */
const isString = (value) => {
    return typeof value === 'string';
};

/**
 * Object is object
 *
 * @param {*} value The Value
 * @returns {bool} Returns flag
 */
const isObject = (value) => {
    return value === Object(value);
};

/**
 * Convert SVG to AST
 *
 * @param {string} data SVG
 * @returns {Object} Returns structure by parse
 */
function parse(data) {
    return svgp.parse(data);
}

/**
 * Convert SVG to AST
 * @by https://github.com/balajmarius/svg2jsx
 *
 * @param {Object} node The node
 * @returns {Object} Returns structure by parse
 */
function stringify(node) {
    if (isString(node)) {
        return node;
    }

    if (Array.isArray(node)) {
        return node.map((n) => stringify(n)).join('');
    }

    const attributes = stringifyProperties(node.properties);

    const children = node.children.reduce((accumulator, childrenNode) => {
        return accumulator + stringify(childrenNode);
    }, '');

    return `<${node.tagName}${attributes}>${children}</${node.tagName}>`;
}

/**
 * Stringify properties
 * @by https://github.com/balajmarius/svg2jsx
 *
 * @param {Object=} properties Node properties
 * @returns {string} Returns string plain
 */
function stringifyProperties(properties = {}) {
    const attributeNames = Object.keys(properties);

    return attributeNames.reduce((accumulator, attributeName) => {
        const attribute = properties[attributeName];

        if (isObject(attribute)) {
            return `${accumulator} ${attributeName}={{ ${stringifyStyle(attribute)} }}`;
        }

        return `${accumulator} ${attributeName}="${attribute}"`;
    }, '');
}

/**
 * Stringify style
 * @by https://github.com/balajmarius/svg2jsx
 *
 * @param {Object=} style Node style
 * @returns {string} Returns string styles
 */
function stringifyStyle(style = {}) {
    const propertyNames = Object.keys(style);

    return propertyNames.reduce((accumulator, propertyName) => {
        const property = style[propertyName];

        if (isString(property)) {
            return `${accumulator}${propertyName}: "${property}", `;
        }

        return `${accumulator}${propertyName}: ${property}, `;
    }, String());
}
