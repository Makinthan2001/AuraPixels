import dotenv from 'dotenv';

dotenv.config();

const IMAGE_API_URL = 'https://image.pollinations.ai/prompt';

export type AIStyle = 'cinematic' | 'anime' | 'minimal' | 'abstract' | 'cyberpunk' | 'realistic';
export type AISize = 'square' | 'portrait' | 'landscape' | 'tablet' | 'ultrawide';

interface SizeMapping {
  width: number;
  height: number;
}

const SIZE_MAP: Record<AISize, SizeMapping> = {
  square: { width: 512, height: 512 },
  portrait: { width: 768, height: 1344 },
  landscape: { width: 1344, height: 768 },
  tablet: { width: 1024, height: 1365 },
  ultrawide: { width: 1536, height: 640 },
};

const STYLE_PROMPTS: Record<AIStyle, string> = {
  cinematic: 'cinematic lighting, dramatic atmosphere, high contrast, 8k resolution, detailed shadows',
  anime: 'anime style, vibrant colors, clean lines, studio ghibli inspired, high quality digital art',
  minimal: 'minimalist design, clean lines, simple composition, flat colors, modern aesthetic',
  abstract: 'abstract art, fluid shapes, conceptual composition, bold colors, artistic interpretation',
  cyberpunk: 'cyberpunk cityscape, neon glow, futuristic technology, dark atmosphere, vibrant contrast',
  realistic: 'photorealistic, ultra detailed, sharp focus, 4k resolution, natural lighting',
};

export class AIService {
  static enhancePrompt(prompt: string, style?: AIStyle): string {
    let enhanced = prompt.trim();
    
    if (style && STYLE_PROMPTS[style]) {
      enhanced += `, ${STYLE_PROMPTS[style]}`;
    }

    // Common enhancement tags
    enhanced += ', ultra detailed, 4k wallpaper, high resolution, aesthetic composition';
    
    return enhanced;
  }

  static getSizeDimensions(size: AISize): SizeMapping {
    return SIZE_MAP[size] || SIZE_MAP.square;
  }

  static async fetchImageAsDataUrl(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const error = new Error(
        errorText || `HTTP error ${response.status}: ${response.statusText}`,
      ) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    return `data:${contentType};base64,${base64Image}`;
  }

  static async generateImage(prompt: string, style: AIStyle, size: AISize) {
    const enhancedPrompt = this.enhancePrompt(prompt, style);
    const { width, height } = this.getSizeDimensions(size);

    console.log(`Generating image for prompt: "${enhancedPrompt}" with style: ${style}`);

    const imageUrl = `${IMAGE_API_URL}/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
    const dataUrl = await this.fetchImageAsDataUrl(imageUrl);
    
    return {
      imageUrl: dataUrl,
      enhancedPrompt,
      size:
        size === 'portrait'
          ? '9:16'
          : size === 'landscape'
            ? '16:9'
            : size === 'tablet'
              ? '3:4'
              : size === 'ultrawide'
                ? '21:9'
                : '1:1',
    };
  }
}
