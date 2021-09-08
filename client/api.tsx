const BASE_URL = '/';

export const post = async (path : string, params : object) => {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  });
  return await res.json();
}

export const postMultipart = async (path : string, params : { [name: string]: any }) => {
  const formData  = new FormData();

  for(const name of Object.keys(params)) {
    formData.append(name, params[name]);
  }

  const res = await fetch(path, {
    method: 'POST',
    body: formData,
  });
  return await res.json();
}

export const httpDelete = async (path : string) => {
  const res = await fetch(path, {
    method: 'DELETE',
  });
  return await res.json();
}
