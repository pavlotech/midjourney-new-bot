export const start = {
  firstMessage: `
Вы подписались на Kolersky_Photo_Bot!  

Он качественно удаляет фона или водяные знаки с фото с помощью нейросетей.  
Подпишитесь на канал, чтобы всегда иметь актуальную информацию: @kolerskych.  
Там же обсуждение и вопросы.  
  
- удаление фона с изображений;  
- удаление водяных знаков;  
- одиночные и множественные запросы;  
  
[Инструкция и примеры](https://kolersky.com/photo)  
Для работы с нейросетью отравьте фото боту
  `,
  secondMessage: `
*Для использования нейросети оплатите доступ.
                
После этого вы сразу сможете пользоваться нейросетью.
                          
Для просмотра тарифов жмите /vip*
  `
}

export const vip = {
  price: 490,
  quantity: 30,
  firstMessage: `
*Подписка дает 30 обработок изображений в сумме. 

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

export const buttonsImagine = [
  [
    { text: 'U1', callback_data: 'U1' },
    { text: 'U2', callback_data: 'U2' },
    { text: 'U3', callback_data: 'U3' },
    { text: 'U4', callback_data: 'U4' },
  ],
  [
    { text: 'V1', callback_data: 'V1' },
    { text: 'V2', callback_data: 'V2' },
    { text: 'V3', callback_data: 'V3' },
    { text: 'V4', callback_data: 'V4' }
  ],
  [
    { text: '🔄', callback_data: '🔄' }
  ]
]
export const buttonsCustom = [
  [
    { text: 'Upscale (2x)', callback_data: 'Upscale (2x)' },
    { text: 'Upscale (4x)', callback_data: 'Upscale (4x)' },
    { text: 'Vary (Subtle)', callback_data: 'Vary (Subtle)' },
    { text: 'Vary (Strong)', callback_data: 'Vary (Strong)' },
  ],
  [
    { text: 'Vary (Region)', callback_data: 'Vary (Region)' },
    { text: 'Zoom Out 2x', callback_data: 'Zoom Out 2x' },
    { text: 'Zoom Out 1.5x', callback_data: 'Zoom Out 1.5x' },
    { text: 'Custom Zoom', callback_data: 'Custom Zoom' }
  ],
  [
    { text: '⬅️', callback_data: '⬅️' },
    { text: '➡️', callback_data: '➡️' },
    { text: '⬆️', callback_data: '⬆️' },
    { text: '⬇️', callback_data: '⬇️' }
  ],
];
export const labels = [
  'U1', 'U2', 'U3', 'U4',
  'V1', 'V2', 'V3', 'V4',
  '🔄',
  'Upscale (2x)', 'Upscale (4x)', 'Vary (Subtle)', 'Vary (Strong)',
  'Vary (Region)', 'Zoom Out 2x', 'Zoom Out 1.5x', 'Custom Zoom',
  '⬅️', '➡️', '⬆️', '⬇️',
];