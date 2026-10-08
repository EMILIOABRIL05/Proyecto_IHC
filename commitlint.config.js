export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'test', 'refactor', 'docs', 'style', 'chore', 'build', 'ci', 'perf'],
    ],
    // Alcances de docs/WORKFLOW.md §3
    'scope-enum': [
      2,
      'always',
      [
        'plans',
        'sessions',
        'evidence',
        'metrics',
        'ai',
        'findings',
        'improvements',
        'sprints',
        'reports',
        'shared',
        'db',
        'web',
        'api',
        'ui',
        'a11y',
        'infra',
        'docs',
        'lint',
        'docker',
        'ci',
      ],
    ],
    'header-max-length': [2, 'always', 72],
    'subject-case': [0],
  },
};
