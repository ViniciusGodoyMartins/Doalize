import axios from 'axios';

/*
 * ENDEREÇO DA API PARA
 * CELULAR CONECTADO POR USB
 *
 * É necessário executar:
 *
 * adb reverse tcp:3333 tcp:3333
 *
 * antes de abrir o aplicativo.
 */
const API_URL =
  'http://127.0.0.1:3333';

/*
 * INSTÂNCIA PRINCIPAL DA API
 */
const api =
  axios.create({
    baseURL:
      API_URL,

    timeout:
      30000,

    headers: {
      Accept:
        'application/json',

      'Content-Type':
        'application/json',
    },
  });

export default api;