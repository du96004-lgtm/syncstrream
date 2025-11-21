import { config } from 'dotenv';
config();

import '@/services/youtube';
import '@/ai/flows/music-suggestion.ts';
import '@/ai/flows/youtube-search.ts';
