import { getWazoRequester } from "../wazo"

// @todo use right path
// const BASE_PATH: string = 'calld/1.0/emergency';
const BASE_PATH: string = 'auth/0.1/users';

export const all = async () => {
  const requester = getWazoRequester();

  const response = await requester.call(`${BASE_PATH}?limit=100`);

  // @todo enhance response
  return response.items;
}

export const get = async (uuid: string) => {
  const requester = getWazoRequester();

  // @todo enhance response
  return await requester.call(`${BASE_PATH}/${uuid}`);
}
