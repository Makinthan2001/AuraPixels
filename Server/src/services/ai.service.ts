import dotenv from 'dotenv';

dotenv.config();

const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';
const HF_API_KEY = process.env.HF_API_KEY || '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';

export type AIStyle = 'cinematic' | 'anime' | 'minimal' | 'abstract' | 'realistic';
export type AISize = 'square' | 'portrait' | 'landscape';

interface SizeMapping {
  width: number;
  height: number;
}

const SIZE_MAP: Record<AISize, SizeMapping> = {
  square: { width: 512, height: 512 },
  portrait: { width: 768, height: 1344 },
  landscape: { width: 1344, height: 768 },
};

const STYLE_PROMPTS: Record<AIStyle, string> = {
  cinematic: 'cinematic lighting, dramatic atmosphere, high contrast, 8k resolution, detailed shadows',
  anime: 'anime style, vibrant colors, clean lines, studio ghibli inspired, high quality digital art',
  minimal: 'minimalist design, clean lines, simple composition, flat colors, modern aesthetic',
  abstract: 'abstract art, fluid shapes, conceptual composition, bold colors, artistic interpretation',
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

  static async generateImage(prompt: string, style: AIStyle, size: AISize) {
    const enhancedPrompt = this.enhancePrompt(prompt, style);
    const { width, height } = this.getSizeDimensions(size);

    console.log(`Generating image for prompt: "${enhancedPrompt}" with style: ${style}`);

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          width,
          height,
          negative_prompt: 'blurry, distorted, low quality, low resolution, ugly, deformed',
          seed: Math.floor(Math.random() * 1000000), // Random seed for variety
        },
        options: {
          use_cache: false // Disable HF cache
        }
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate image from Hugging Face';
      try {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText) as { error?: string };
        errorMessage = errorData.error || errorText || errorMessage;
      } catch (e) {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
      const error = new Error(`${errorMessage} (upstream status: ${response.status})`) as Error & { status?: number };
      error.status = 502;
      throw error;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    return {
      imageUrl: `data:image/png;base64,${base64Image}`,
      enhancedPrompt,
      size: size === 'portrait' ? '9:16' : size === 'landscape' ? '16:9' : '1:1',
    };
  }
}
