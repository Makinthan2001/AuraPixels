export const repairImageUrl = (value?: string) => {
  const source = (value || '').trim();

  if (!source.startsWith('data:image/')) {
    return source;
  }

  const commaIndex = source.indexOf(',');
  if (commaIndex === -1) {
    return source;
  }

  const header = source.slice(0, commaIndex);
  const payload = source.slice(commaIndex + 1).replace(/\s+/g, '');

  if (payload.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${payload}`;
  }

  if (payload.startsWith('iVBOR')) {
    return `data:image/png;base64,${payload}`;
  }

  return `${header},${payload}`;
};

export const getAspectRatioFromResolution = (resolution?: string) => {
  const normalized = (resolution || '').toLowerCase().trim();

  if (!normalized) {
    return 4 / 5;
  }

  if (normalized.includes(':')) {
    const [widthPart, heightPart] = normalized.split(':').map((value) => Number(value));
    if (widthPart > 0 && heightPart > 0) {
      return widthPart / heightPart;
    }
  }

  switch (normalized) {
    case 'portrait':
    case '9:16':
      return 9 / 16;
    case 'landscape':
    case '16:9':
      return 16 / 9;
    case 'square':
    case '1:1':
      return 1;
    case 'tablet':
    case '3:4':
      return 3 / 4;
    case 'ultrawide':
    case '21:9':
      return 21 / 9;
    default:
      return 4 / 5;
  }
};

export const formatResolutionLabel = (resolution?: string) => {
  const normalized = (resolution || '').toLowerCase().trim();

  switch (normalized) {
    case 'portrait':
    case '9:16':
      return '9:16';
    case 'landscape':
    case '16:9':
      return '16:9';
    case 'square':
    case '1:1':
      return '1:1';
    case 'tablet':
    case '3:4':
      return '3:4';
    case 'ultrawide':
    case '21:9':
      return '21:9';
    default:
      return resolution || '';
  }
};

export const GENERATION_STATUS_MESSAGES = [
  'Generating your wallpaper...',
  'AI is creating your image...',
  'Preparing AI model...',
  'Almost ready...',
];