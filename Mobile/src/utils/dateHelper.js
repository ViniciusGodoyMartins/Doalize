/*
 * FORMATAÇÃO PADRÃO DE DATAS DO DOALIZE
 *
 * Entrada:
 *
 * 2026-08-26T16:52:24.000Z
 *
 * Saída:
 *
 * 26/08/2026
 */

export function formatDate(
  dateValue
) {
  if (!dateValue) {
    return '';
  }

  /*
   * Se a API enviar uma string iniciando
   * com YYYY-MM-DD, usamos diretamente
   * ano, mês e dia.
   *
   * Isso evita que o fuso horário altere
   * o dia da postagem ou mensagem.
   */
  if (
    typeof dateValue ===
    'string'
  ) {
    const match =
      dateValue.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );

    if (match) {
      const [
        ,
        year,
        month,
        day,
      ] = match;

      return `${day}/${month}/${year}`;
    }
  }

  /*
   * Fallback para datas recebidas em
   * outros formatos.
   */
  const parsedDate =
    new Date(dateValue);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return '';
  }

  const day =
    String(
      parsedDate.getDate()
    ).padStart(
      2,
      '0'
    );

  const month =
    String(
      parsedDate.getMonth() +
        1
    ).padStart(
      2,
      '0'
    );

  const year =
    parsedDate.getFullYear();

  return `${day}/${month}/${year}`;
}

export default formatDate;