const config = require('js-rules').eslint

// You can update the ESLint config by modifying the properties
// If you want to extend ESLint with another configuration
config.extends.push('plugin:react/recommended')
// If you want to add a plugin
config.plugins.push('react')
// If you want to modify or add a specific rule
config.rules['react/prop-types'] = 'off'

module.exports = config
