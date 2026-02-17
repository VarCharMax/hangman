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
