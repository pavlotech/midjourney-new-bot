import { customButtons, generationButtons } from "../../settings";

export const generationParams = (task_id: string, button: string, user: any) => {
  const buttonsToUse = [
    'variation1', 'variation2', 'variation3', 'variation4',
    'reroll',
    'high_variation', 'low_variation',
    'outpaint_1.5x', 'outpaint_2x', ,'outpaint_custom',
    'pan_down', 'pan_left', 'pan_right', 'pan_up'
  ];
  const generationType = buttonsToUse.includes(button) ? generationButtons : customButtons;

  switch(button) {
    case 'upscale1':
    case 'upscale2':
    case 'upscale3':
    case 'upscale4':
    case 'variation1':
    case 'variation2':
    case 'variation3':
    case 'variation4':
      return {
        name: button.replace(/\d/g, ''),
        params: { origin_task_id: task_id, index: button.slice(-1) },
        generationType: generationType
      };
    case 'reroll':
      return {
        name: 'reroll',
        params: { origin_task_id: task_id, prompt: user.prompt, aspect_ratio: user.ratio },
        generationType: generationType
      };
    case 'high_variation':
    case 'low_variation':
      return {
        name: 'variation',
        params: { origin_task_id: task_id, index: button },
        generationType: generationType
      };
    case 'outpaint_1.5x':
    case 'outpaint_2x':
      return {
        name: 'outpaint',
        params: { origin_task_id: task_id, zoom_ratio: button.split('_')[1].slice(0, -1) },
        generationType: generationType
      };
    case 'outpaint_custom':
      return {
        name: 'outpaint',
        params: { origin_task_id: task_id, zoom_ratio: '1.2' },
        generationType: generationType
      };
    case 'pan_down':
    case 'pan_left':
    case 'pan_right':
    case 'pan_up':
      return {
        name: 'pan',
        params: { origin_task_id: task_id, direction: button.split('_')[1] },
        generationType: generationType
      };
    case 'upscale_2x':
    case 'upscale_4x':
      return {
        name: 'upscale',
        params: { origin_task_id: task_id, index: button.split('_')[1] },
        generationType: []
      };
    default:
      return { name: '', params: {} };
  }
};