import axios from 'axios';

/*
 * ENDEREÇO LOCAL DA API
 *
 * No emulador Android, 10.0.2.2
 * representa o computador em que
 * o backend está sendo executado.
 *
 * Quando o backend for hospedado,
 * esta URL será substituída pela
 * URL pública da API.
 */
const API_URL =
  'http://10.0.2.2:3333';

/*
 * INSTÂNCIA PRINCIPAL DA API
 */
const api = axios.create({
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