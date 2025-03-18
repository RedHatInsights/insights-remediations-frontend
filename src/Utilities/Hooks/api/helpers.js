export const compileResult = (fetchResult, params) => {
  const data = fetchResult.data?.data || fetchResult.data;
  const meta = fetchResult.data?.meta;

  return {
    data,
    meta: {
      ...params,
      ...(meta || {}),
    },
  };
};

const defaultCompileResult = (fetchResult) => fetchResult;

export const fetchResult = async (
  fn,
  params,
  convertToArray,
  compileResult = defaultCompileResult
) => {
  const convertedParams =
    (convertToArray && !Array.isArray(params)
      ? convertToArray(params)
      : params) || [];

  if (Array.isArray(convertedParams)) {
    return compileResult(await fn(...convertedParams), params);
  } else {
    return compileResult(await fn(convertedParams), params);
  }
};
