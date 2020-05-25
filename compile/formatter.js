const prettier = require('prettier');

/**
 * Creates React component and formats with Prettier
 *
 * @param {string} code The code
 * @returns {string} Returns formatted code
 */
function format(code) {
    return prettier.format(code, {
        parser: 'typescript',
    });
}
/**
 * Generate React components
 *
 * @param {string} name The name component
 * @param {string} content The content svg (without svg)
 * @returns {string} Returns React-component code
 */
function getComponent(name, content) {
    return `
        import React from 'react';

        interface Props {
            size?: 'xs' | 's' | 'm' | 'l' | 'xl' | number;
            color?: string;
            [key: string]: any;
        }

        interface HTMLAttributeProps {
            id?: string;
            title?: string;
            className?: string;
            role?: string;
            spellCheck?: boolean;
            tabIndex?: number;
        }

        const sizes = { xs: 12, s: 16, m: 20, l: 24, xl: 32 };
        export const ${name}: React.FC<HTMLAttributeProps & Props> = (props: Props): JSX.Element => {
            const { color = 'currentColor', size = 'm', ...attrs } = props;
            const d = sizes[size] || size;

            return (
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width={d} height={d} fill={color} {...attrs}>
                    ${content}
                </svg>
            )
        };

        ${name}.displayName = '${name}';
        ${name}.defaultProps = {
            size: 'm',
            color: 'currentColor',
        };

        export default ${name};
    `;
}

/**
 * Convert string to React Component name
 *
 * @param {string} str String
 * @returns {string} Returns component name
 */
function getComponentName(str) {
    return str
        .replace(/-/g, ' ')
        .replace(/(\w)(\w*)/g, (g0, g1, g2) => {
            return g1.toUpperCase() + g2.toLowerCase();
        })
        .replace(/\s/g, '');
}

module.exports = {
    format,
    getComponentName,
    getComponent,
};
