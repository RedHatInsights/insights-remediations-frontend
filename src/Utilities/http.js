const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
};

class HttpError extends Error {
  constructor(description) {
    super('Error communicating with the server');
    this.description = description;
  }
}

async function checkResponse(r) {
  if (r.ok) {
    return r;
  }

  if (r.headers.get('content-type').includes('application/json')) {
    // let's try to extract some more info
    let data = false;
    const DEBUG = false; // Set to true to enable debug logging

    try {
      data = await r.json();
    } catch (e) {
      if (DEBUG){
      console.log(e);
      }
    }

    if (data.errors && data.errors.length) {
      const error = data.errors[0];

      if (error.details && error.details.name) {
        throw new HttpError(`${error.title} (${error.details.name})`);
      }

      throw new HttpError(error.title);
    }
  }

  throw new HttpError(`Unexpected response code ${r.status}`);
}

async function json(r) {
  if (!r) {
    return;
  }

  const type = r.headers.get('content-type');
  if (!type.includes('application/json')) {
    throw new HttpError(`Unexpected response type (${type}) returned`);
  }

  return r.json();
}

function doFetch(
  uri,
  method = 'GET',
  data = false,
  headers = false,
  options = {},
) {
  const opts = {
    credentials: 'same-origin',
    method,
    ...options,
  };

  if (headers) {
    opts.headers = headers;
  }

  if (data) {
    opts.body = JSON.stringify(data);
  }

  return fetch(uri, opts);
}

export function doGet(uri) {
  return doFetch(uri.toString()).then(checkResponse).then(json);
}

export function doPost(uri, data) {
  return doFetch(uri, 'POST', data, HEADERS).then(checkResponse).then(json);
}

export function doPatch(uri, data) {
  return doFetch(uri, 'PATCH', data, HEADERS).then(checkResponse);
}

export function doDelete(uri) {
  return doFetch(uri, 'DELETE').then(checkResponse);
}
