import next from 'eslint-config-next'

export default [
  ...next,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'import/no-anonymous-default-export': 'off'
    },
    ignores: ['.next/**', 'node_modules/**', 'dist/**']
  }
]
