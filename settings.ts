export const start = {
  firstMessage: `
Вы подписались на KolerskyMidjorneyBot!

Он генерирует изображения с помощью нейросети Midjorney. Одной из лучших на данный момент.
Подпишитесь на канал, чтобы всегда иметь актуальную информацию: @kolerskych. Там же обсуждение и вопросы.
  
[Инструкция](https://kolersky.com/mj)
Чтобы сгенерировать фото, просто напишите свой запрос боту.
  `,
  secondMessage: `
*Для использования нейросети оплатите доступ.
                
После этого вы сразу сможете пользоваться нейросетью.
                          
Для просмотра тарифов жмите /vip*
  `
}
export const errorMessage = `*Произошла ошибка попробуйте позже*`
export const waitRequest = `*Дождитесь выполнения предыдущего запроса*`
export const vip = {
  price: 490,
  quantity: 50,
  firstMessage: `
*Подписка дает 50 обработок изображений в сумме. 

Стоимость: 490 руб

Чтобы купить нажмите на кнопку ниже*
  `,
  paymentCheck: `
*Обработка оплаты...*
  `
}
export const mode = {
  rem_background: `*Режим изменен на удаление фона*`,
  rem_text: `*Режим изменен на удаление текста*`,
  rem_logo: `*Режим изменен на удаление логотипа*`,
}
export const admin = {
  text: `*Права администратора*`,
  button: `Получить`
}
export const noRequest = `У вас закончились запросы.\nКупить еще ${vip.quantity} - /vip`

export const generationButtons = [
  [
    { text: 'U1', callback_data: 'upscale1' },
    { text: 'U2', callback_data: 'upscale2' },
    { text: 'U3', callback_data: 'upscale3' },
    { text: 'U4', callback_data: 'upscale4' },
  ],
  [
    { text: 'V1', callback_data: 'variation1' },
    { text: 'V2', callback_data: 'variation2' },
    { text: 'V3', callback_data: 'variation3' },
    { text: 'V4', callback_data: 'variation4' }
  ],
  [
    { text: '🔄', callback_data: 'reroll' }
  ]
]
export const customButtons = [
  [
    { text: 'Upscale (2x)', callback_data: 'upscale_2x' },
    { text: 'Upscale (4x)', callback_data: 'upscale_4x' },
  ],
  [
    { text: 'Vary (Subtle)', callback_data: 'low_variation' },
    { text: 'Vary (Strong)', callback_data: 'high_variation' },
  ],
  [
    { text: 'Zoom Out 2x', callback_data: 'outpaint_2x' },
    { text: 'Zoom Out 1.5x', callback_data: 'outpaint_1.5x' },
    { text: 'Custom Zoom', callback_data: 'outpaint_custom' },
  ],
  [
    { text: '⬅️', callback_data: 'pan_left' },
    { text: '➡️', callback_data: 'pan_right' },
    { text: '⬆️', callback_data: 'pan_up' },
    { text: '⬇️', callback_data: 'pan_down' }
  ],
];
export const buttons = [
  'upscale1', 'upscale2', 'upscale3', 'upscale4',
  'variation1', 'variation2', 'variation3', 'variation4',
  'reroll',
  
  'high_variation', 'low_variation',
  'outpaint_1.5x', 'outpaint_2x', 'outpaint_custom',
  'pan_down', 'pan_left', 'pan_right', 'pan_up',
  'upscale_2x', 'upscale_4x'
];

export const buttonArray = [
  [{ text: `Создать обьявление`, callback_data: 'create_announcement' }],
  [{ text: `Удалить обьявление`, callback_data: 'remove_announcement' }],
  [{ text: `Выдать права`, callback_data: 'add_admin' }],
  [{ text: `Удалить права`, callback_data: 'remove_admin' }],
  [{ text: `Забанить`, callback_data: 'ban_user' }],
  [{ text: `Разбанить`, callback_data: 'unban_user' }],
  [{ text: `Профиль пользователя`, callback_data: 'profile_user' }],
  [{ text: `Выдать запросы`, callback_data: 'give_requests' }],
  [{ text: `Забрать запросы`, callback_data: 'take_away_requests' }],
  [{ text: `Добавить слово`, callback_data: 'add_word' }],
  [{ text: `Удалить слово`, callback_data: 'remove_word' }]
]
export const adminButtons = [
  'create_announcement',
  'remove_announcement',
  'remove_admin',
  'ban_user',
  'unban_user', 
  'profile_user', 
  'give_requests', 
  'take_away_requests',
  'add_word',
  'remove_word'
]

/* export function moderation (prompt: string) {
  return ;
} */