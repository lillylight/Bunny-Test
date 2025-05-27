import { WebRTCSession } from '@/lib/webrtc-session'

export interface MusicGenerationConfig {
  bpm?: number
  temperature?: number
  guidance?: number
  density?: number
  brightness?: number
  scale?: string
  mute_bass?: boolean
  mute_drums?: boolean
  only_bass_and_drums?: boolean
  music_generation_mode?: 'QUALITY' | 'DIVERSITY'
}

export interface WeightedPrompt {
  text: string
  weight: number
}

export interface MusicRequest {
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

class MusicGenerationService {
  private musicRequests: MusicRequest[] = []
  private currentSession: any = null
  private isGenerating: boolean = false
  private audioContext: AudioContext | null = null
  private audioQueue: AudioBuffer[] = []
  
  // Genre to prompt mappings based on show type
  private readonly genrePrompts: { [key: string]: WeightedPrompt[] } = {
    'morning': [
      { text: 'Upbeat', weight: 2.0 },
      { text: 'Bright Tones', weight: 1.5 },
      { text: 'Acoustic Instruments', weight: 1.0 },
      { text: 'Indie Pop', weight: 1.0 }
    ],
    'tech': [
      { text: 'Minimal Techno', weight: 2.0 },
      { text: 'Synth Pads', weight: 1.5 },
      { text: 'EDM', weight: 1.0 },
      { text: 'Glitch Hop', weight: 0.5 }
    ],
    'midday': [
      { text: 'Funk', weight: 1.5 },
      { text: 'Groove', weight: 1.5 },
      { text: 'Contemporary R&B', weight: 1.0 },
      { text: 'Danceable', weight: 1.0 }
    ],
    'science': [
      { text: 'Ambient', weight: 2.0 },
      { text: 'Experimental', weight: 1.5 },
      { text: 'Ethereal Ambience', weight: 1.0 },
      { text: 'Spacey Synths', weight: 1.0 }
    ],
    'evening': [
      { text: 'Smooth Pianos', weight: 1.5 },
      { text: 'Jazz Fusion', weight: 1.5 },
      { text: 'Chill', weight: 1.0 },
      { text: 'Lo-Fi Hip Hop', weight: 1.0 }
    ],
    'night': [
      { text: 'Deep House', weight: 2.0 },
      { text: 'Trance', weight: 1.5 },
      { text: 'Dreamy', weight: 1.0 },
      { text: 'Psychedelic', weight: 0.5 }
    ],
    'overnight': [
      { text: 'Ambient', weight: 2.0 },
      { text: 'Subdued Melody', weight: 1.5 },
      { text: 'Lo-fi', weight: 1.0 },
      { text: 'Chill', weight: 1.0 }
    ]
  }

  constructor() {
    this.loadRequests()
    if (typeof window !== 'undefined') {
      this.audioContext = new AudioContext()
    }
  }

  private loadRequests() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('busk_music_requests')
      if (saved) {
        this.musicRequests = JSON.parse(saved)
      }
    }
  }

  private saveRequests() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('busk_music_requests', JSON.stringify(this.musicRequests))
    }
  }

  public async addMusicRequest(
    type: 'request' | 'dedication',
    userName: string,
    message: string,
    showName: string,
    dedicatedTo?: string
  ): Promise<MusicRequest> {
    const request: MusicRequest = {
      id: `music_${Math.random().toString(36).substring(2, 15)}`,
      type,
      userName,
      message,
      dedicatedTo,
      showName,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    // Parse the message for genre/mood/instrument keywords
    const parsed = this.parseRequestMessage(message)
    request.genre = parsed.genre
    request.mood = parsed.mood
    request.instruments = parsed.instruments

    this.musicRequests.push(request)
    this.saveRequests()

    // Start processing if not already
    if (!this.isGenerating) {
      this.processNextRequest()
    }

    return request
  }

  private parseRequestMessage(message: string): {
    genre?: string
    mood?: string
    instruments?: string[]
  } {
    const lowerMessage = message.toLowerCase()
    
    // Common genre keywords
    const genres = ['jazz', 'rock', 'pop', 'techno', 'classical', 'hip hop', 'r&b', 'funk', 'blues', 'reggae', 'country', 'metal']
    const foundGenre = genres.find(g => lowerMessage.includes(g))
    
    // Common mood keywords
    const moods = ['happy', 'sad', 'upbeat', 'chill', 'energetic', 'romantic', 'peaceful', 'intense', 'dreamy', 'dark']
    const foundMood = moods.find(m => lowerMessage.includes(m))
    
    // Common instruments
    const instruments = ['piano', 'guitar', 'drums', 'bass', 'violin', 'saxophone', 'trumpet', 'synth', 'flute', 'cello']
    const foundInstruments = instruments.filter(i => lowerMessage.includes(i))

    return {
      genre: foundGenre,
      mood: foundMood,
      instruments: foundInstruments.length > 0 ? foundInstruments : undefined
    }
  }

  private async processNextRequest() {
    const pendingRequest = this.musicRequests.find(r => r.status === 'pending')
    if (!pendingRequest) {
      this.isGenerating = false
      return
    }

    this.isGenerating = true
    pendingRequest.status = 'generating'
    this.saveRequests()

    try {
      // Generate music based on request
      await this.generateMusic(pendingRequest)
      
      pendingRequest.status = 'completed'
      this.saveRequests()
    } catch (error) {
      console.error('Error generating music:', error)
      pendingRequest.status = 'pending' // Retry later
      this.saveRequests()
    }

    // Process next request
    setTimeout(() => this.processNextRequest(), 2000)
  }

  private async generateMusic(request: MusicRequest) {
    // Build prompts based on request
    const prompts: WeightedPrompt[] = []
    
    // Add show-specific genre prompts
    const showGenre = this.getShowGenre(request.showName)
    if (showGenre) {
      prompts.push(...this.genrePrompts[showGenre])
    }

    // Add user-requested genre
    if (request.genre) {
      prompts.push({ text: request.genre, weight: 2.5 })
    }

    // Add mood
    if (request.mood) {
      prompts.push({ text: request.mood, weight: 2.0 })
    }

    // Add instruments
    if (request.instruments) {
      request.instruments.forEach(instrument => {
        prompts.push({ text: instrument, weight: 1.5 })
      })
    }

    // For dedications, add romantic/emotional elements
    if (request.type === 'dedication') {
      prompts.push({ text: 'Emotional', weight: 1.5 })
      prompts.push({ text: 'Romantic', weight: 1.0 })
    }

    // Announce the request/dedication
    const webrtcSession = new WebRTCSession()
    let announcement = ''
    
    if (request.type === 'dedication') {
      announcement = `This next song is a special dedication from ${request.userName} to ${request.dedicatedTo}. ${request.userName} says: "${request.message}". Here's a beautiful AI-generated song just for you.`
    } else {
      announcement = `Coming up next, we have a song request from ${request.userName}. They asked for: "${request.message}". Let me generate something special based on that request.`
    }

    // Use TTS to announce
    await webrtcSession.triggerResponse(announcement, true, false, 'Music Request')

    // In a real implementation, you would:
    // 1. Connect to Google's Lyria API
    // 2. Send the prompts
    // 3. Stream the generated audio
    // 4. Play it through the radio system

    // For now, we'll simulate with a placeholder
    console.log('Generating music with prompts:', prompts)
    
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  private getShowGenre(showName: string): string | null {
    if (showName.includes('Morning')) return 'morning'
    if (showName.includes('Tech')) return 'tech'
    if (showName.includes('Midday')) return 'midday'
    if (showName.includes('Science')) return 'science'
    if (showName.includes('Evening')) return 'evening'
    if (showName.includes('Night Owl')) return 'night'
    if (showName.includes('Overnight')) return 'overnight'
    return null
  }

  public getPendingRequests(showName?: string): MusicRequest[] {
    let requests = this.musicRequests.filter(r => r.status === 'pending')
    if (showName) {
      requests = requests.filter(r => r.showName === showName)
    }
    return requests
  }

  public getAllRequests(): MusicRequest[] {
    return this.musicRequests
  }

  // Configuration for different show types
  public getShowMusicConfig(showName: string): MusicGenerationConfig {
    const configs: { [key: string]: MusicGenerationConfig } = {
      'morning': {
        bpm: 120,
        temperature: 0.8,
        guidance: 4.0,
        density: 0.6,
        brightness: 0.8,
        music_generation_mode: 'QUALITY'
      },
      'tech': {
        bpm: 128,
        temperature: 1.2,
        guidance: 4.5,
        density: 0.8,
        brightness: 0.7,
        music_generation_mode: 'DIVERSITY'
      },
      'midday': {
        bpm: 110,
        temperature: 1.0,
        guidance: 4.0,
        density: 0.7,
        brightness: 0.7,
        music_generation_mode: 'QUALITY'
      },
      'evening': {
        bpm: 90,
        temperature: 0.9,
        guidance: 3.5,
        density: 0.5,
        brightness: 0.5,
        music_generation_mode: 'QUALITY'
      },
      'night': {
        bpm: 125,
        temperature: 1.1,
        guidance: 4.0,
        density: 0.9,
        brightness: 0.6,
        music_generation_mode: 'DIVERSITY'
      },
      'overnight': {
        bpm: 85,
        temperature: 0.7,
        guidance: 3.0,
        density: 0.3,
        brightness: 0.3,
        music_generation_mode: 'QUALITY'
      }
    }

    const genre = this.getShowGenre(showName)
    return configs[genre || 'midday'] || configs['midday']
  }
}

// Export singleton instance
export const musicGenerationService = new MusicGenerationService()
