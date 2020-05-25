module.exports = {
    transform,
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
 * Convert string to camelCase
 *
 * @param {*} str The string
 * @returns {string} Returns convert string
 */
const camelCase = (str) => {
    return str
        .replace(/\-/g, ' ')
        .split(' ')
        .map((word, index) => {
            if (index === 0) {
                return word.toLowerCase();
            }

            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
};

/**
 * Specific rules for attributes
 * @type {Object}
 */
const ATTRIBUTES_RULES = {
    class: 'className',
};

/**
 * Apply transforms to SVG tree
 *
 * @param {Object} node The node
 * @returns {Object} Returns new nodes
 */
function transform(node) {
    if (isString(node)) {
        return node;
    }

    if (Array.isArray(node)) {
        return node.map((n) => transform(n));
    }

    const children = node.children.map(transform);
    const properties = Object.keys(node.properties).reduce((result, name) => {
        const attribute = node.properties[name];

        const isStyleAttribute = name === 'style';
        const isDataAttribute = name.startsWith('data-');

        if (isDataAttribute || isStyleAttribute) {
            return {
                ...result,
                [name]: attribute,
            };
        }

        if (ATTRIBUTES_RULES[name]) {
            return {
                ...result,
                [ATTRIBUTES_RULES[name]]: attribute,
            };
        }

        return {
            ...result,
            [camelCase(name)]: attribute,
        };
    }, {});

    return {
        ...node,
        children,
        properties,
    };
}
