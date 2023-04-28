type Environment = 'ANY' | 'NOT_PRODUCTION';

const runInEnv = (callback: Function, env: Environment) => {
  if (env === 'NOT_PRODUCTION' && process.env.NODE_ENV === 'production') return;
  callback();
};

export const throwInEnv = (message: string, env: Environment = 'NOT_PRODUCTION') => {
  runInEnv(() => {
    throw new Error(message);
  }, env);
};

export const warnInEnv = (message: string, env: Environment = 'NOT_PRODUCTION') => {
  runInEnv(() => {
    console.warn(message);
  }, env);
};
