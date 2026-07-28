import axios from 'axios';

/*
 * EMULADOR ANDROID:
 * http://10.0.2.2:3333
 *
 * CELULAR FÍSICO:
 * substitua 10.0.2.2 pelo IPv4 do computador.
 */
export const API_BASE_URL = 'http://10.0.2.2:3333';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
  },
});

export default api;