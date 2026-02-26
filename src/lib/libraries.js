export async function getDefaultExport(path) {
  const { default: defaultFunc } = await import(path);
  return defaultFunc;
}

export async function getNamedExport(name, path) {
  const module = await import(path);

  if (Object.hasOwn(module, name)) {
    return module[name];
  }

  return null;
}

export async function getAllExport(path) {
  const module = await import(path);

  return module;
}

export function dotEnvToString(dotEnvConfigObj) {
  const parsedEnvs = dotEnvConfigObj.parsed;
  let strEnv = '';

  Object.keys(parsedEnvs).forEach((k) => {
    strEnv += `${k}=${parsedEnvs[k]} `;
  });

  return strEnv.trim();
}

export function getConnectionString(url) {
  if (url) {
    let isProd = process.env.NODE_ENV == 'production';
    let username = process.env.DB_USERNAME ?? '';
    let password = process.env.DB_PASSWORD ?? '';
    let hosts = url.replace('mongodb://', '').replace(/\/.*/, '');
    let database = process.env.DB_NAME;
    let options = '?replicaSet=1f7f5bb0584c40feb992bf25980eaa56';
    let credentials = username && password ? `${username}:${password}@` : '';

    let connectionString =
      'mongodb://' + credentials + hosts + '/' + database + `${isProd ? options : ''}`;
    return connectionString;
  } else {
    return '';
  }
}
