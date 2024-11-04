import { getWazoRequester } from "../wazo"

const BASE_PATH: string = 'calld/1.0/emergency';
// const BASE_PATH: string = 'auth/0.1/users';

export const all = async () => {
  const requester = getWazoRequester();

  const response = await requester.call(`${BASE_PATH}?limit=100`);

  return response.items;
}

export const get = async (uuid: string) => {
  const requester = getWazoRequester();
  const response = await requester.call(`${BASE_PATH}/${uuid}`);
  delete response?._headers;

  return response;
}

export const create = async (emergency_type = 'fire') => {
    const requester = getWazoRequester();

  return await requester.call(BASE_PATH, 'POST', {
    emergency_type
  });
}
