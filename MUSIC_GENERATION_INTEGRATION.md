# Music Generation Integration with Google Lyria RealTime

## Overview

BUSK Radio now supports AI-generated music for song requests and dedications using Google's Lyria RealTime API. This allows listeners to request custom songs that match the show's genre and their personal preferences.

## Features

### 1. Song Requests
- Users can request custom AI-generated songs
- Specify genre, mood, instruments, or style
- Songs are generated to match the current show's vibe
- Example: "upbeat jazz with saxophone and piano"

### 2. Song Dedications
- Dedicate AI-generated songs to someone special
- Custom messages are announced before the song
- Romantic/emotional elements added automatically
- Example: "For my wife Sarah on our anniversary. Please play something romantic with piano and strings"

### 3. Show-Specific Music Profiles

Each show has its own music generation profile:

#### Morning Vibes (6 AM - 9 AM)
- **Style**: Upbeat, Bright Tones, Acoustic, Indie Pop
- **BPM**: 120
- **Mood**: Energetic and positive

#### Tech Talk (9 AM - 11 AM)
- **Style**: Minimal Techno, Synth Pads, EDM, Glitch Hop
- **BPM**: 128
- **Mood**: Modern and innovative

#### Midday Mix (11 AM - 2 PM)
- **Style**: Funk, Groove, Contemporary R&B, Danceable
- **BPM**: 110
- **Mood**: Fun and groovy

#### Science Hour (2 PM - 4 PM)
- **Style**: Ambient, Experimental, Ethereal, Spacey Synths
- **BPM**: 90
- **Mood**: Thoughtful and atmospheric

#### Evening Groove (4 PM - 7 PM)
- **Style**: Smooth Pianos, Jazz Fusion, Chill, Lo-Fi Hip Hop
- **BPM**: 90
- **Mood**: Relaxed and sophisticated

#### Night Owl (7 PM - 10 PM)
- **Style**: Deep House, Trance, Dreamy, Psychedelic
- **BPM**: 125
- **Mood**: Energetic nightlife vibe

#### Overnight Automation (10 PM - 6 AM)
- **Style**: Ambient, Subdued, Lo-fi, Chill
- **BPM**: 85
- **Mood**: Calm and peaceful

## Implementation Details

### Music Generation Service (`lib/music-generation-service.ts`)

The service handles:
1. **Request Processing**: Parses user messages for genre, mood, and instrument keywords
2. **Queue Management**: Maintains a queue of pending music requests
3. **Prompt Generation**: Creates weighted prompts based on show genre and user preferences
4. **Announcement Integration**: Uses TTS to announce dedications and requests

### Key Components

```typescript
interface MusicRequest {
  id: string
  type: 'request' | 'dedication'
  userName: string
  message: string
  genre?: string
  mood?: string
  instruments?: string[]
  dedicatedTo?: string
  showName: string
  status: 'pending' | 'generating' | 'playing' | 'completed'
  createdAt: string
}
```

### Integration with Lyria RealTime

To fully integrate with Google's Lyria RealTime API:

1. **Install Dependencies**:
```bash
npm install @google/genai
```

2. **Set up API Key**:
```env
GOOGLE_AI_API_KEY=your_api_key_here
```

3. **Update Music Generation Service**:
```typescript
import { genai } from '@google/genai'

const client = genai.Client({
  apiKey: process.env.GOOGLE_AI_API_KEY,
  httpOptions: { apiVersion: 'v1alpha' }
})

async function generateMusic(prompts: WeightedPrompt[], config: MusicGenerationConfig) {
  const session = await client.aio.live.music.connect(
    model='models/lyria-realtime-exp'
  )
  
  await session.set_weighted_prompts(prompts)
  await session.set_music_generation_config(config)
  await session.play()
  
  // Stream audio chunks to radio system
}
```

## User Experience

1. **Request Flow**:
   - User clicks "Song Request" or "Song Dedication"
   - Enters their name and song description
   - System parses keywords and generates appropriate prompts
   - Request is queued and processed
   - DJ announces the request/dedication
   - AI-generated song plays on air

2. **Smart Parsing**:
   - Detects genres: jazz, rock, pop, techno, classical, etc.
   - Identifies moods: happy, sad, upbeat, chill, energetic, etc.
   - Recognizes instruments: piano, guitar, drums, saxophone, etc.

3. **Queue Management**:
   - Shows queue position to users
   - Processes requests in order
   - Prioritizes based on show schedule

## Future Enhancements

1. **Premium Features**:
   - Priority queue for paid requests
   - Longer song generation (standard 30s, premium 60s+)
   - Custom voice announcements

2. **Advanced Controls**:
   - Real-time music steering during generation
   - User voting on generated songs
   - Save favorite generated songs

3. **Integration Improvements**:
   - Direct audio streaming to WebRTC
   - Crossfading between songs
   - Beat matching with current playlist

## Configuration

The system uses different configurations based on show type:

- **Guidance**: Controls how strictly the model follows prompts (0.0-6.0)
- **Temperature**: Controls creativity/randomness (0.0-3.0)
- **Density**: Controls musical complexity (0.0-1.0)
- **Brightness**: Controls tonal quality (0.0-1.0)
- **BPM**: Beats per minute (60-200)

## Best Practices

1. **Prompt Engineering**:
   - Be descriptive with adjectives
   - Combine multiple weighted prompts
   - Gradually transition between styles

2. **Show Consistency**:
   - Maintain genre consistency within shows
   - Use appropriate BPM for time of day
   - Match energy levels to audience expectations

3. **User Guidance**:
   - Provide example requests in UI
   - Show available genres/moods
   - Explain AI generation process

## Testing

To test the music generation integration:

1. Navigate to a music show
2. Click "Song Request" or "Song Dedication"
3. Enter a descriptive request
4. Monitor the console for generated prompts
5. Verify queue position updates
6. Check announcement text generation

The system currently simulates music generation. Full integration requires:
- Google AI API key
- WebSocket connection setup
- Audio streaming implementation
- Buffer management for smooth playback
