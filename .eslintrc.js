module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
  // Edge Functions는 Deno 런타임이라 jsr:/npm: 프로토콜을 사용하므로 Node ESLint 검사에서 제외
  ignorePatterns: ['supabase/'],
};
