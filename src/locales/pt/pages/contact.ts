import { type BaseTranslation } from '../../en';

export const contact: BaseTranslation['pages']['contact'] = {
  title: 'Contato | Gabriel Trzimajewski',
  tagline: 'Manda um email. Como nos velhos tempos.',
  description:
    '<strong>Amo conversar</strong> com engenheiros de software, desenvolvedores no geral, estudantes, and criadores. <strong>Sou uma pessoa ocupada</strong>, então não posso prometer que vou responder ao seu e-mail na hora, mas vou dar o meu melhor para responder com tempo.',
  email: 'Mande um email',
  toast: {
    success: {
      title: 'Email enviado :D',
      description: 'Obrigado por separar um tempo para escrever.'
    },
    fail: {
      title: 'Erro :(',
      description: 'Algo deu errado. Tente novamente mais tarde.'
    }
  },
  labels: {
    name: 'nome',
    email: 'email',
    message: 'mensagem'
  },

  placeholders: {
    message: 'Sua mensagem aqui :P'
  },
  send: 'Enviar'
};
