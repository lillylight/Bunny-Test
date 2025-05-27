import { WebRTCSession } from '@/lib/webrtc-session'

export interface Advertisement {
  id: string
  companyName: string
  adScript?: string
  audioUrl?: string
  selectedShow: string
  adType: 'script' | 'audio'
  duration: 10 | 20 | 30 // seconds
  packageType: 'standard' | 'branded'
  amount: number
  createdAt: string
  status: 'scheduled' | 'playing' | 'completed'
  targetAudience?: string[]
  brandCategory?: string
}

export interface AdSlot {
  position: number // minutes into the show
  duration: 10 | 20 | 30
  type: 'brand' | 'product' | 'sponsor'
  label?: string // Human-readable label like "Beginning", "Middle", "End"
  available?: boolean // Whether this slot is available
}

export interface ShowAdSchedule {
  showName: string
  showDuration: number // minutes
  totalAdTime: number // minutes
  adSlots: AdSlot[]
}

class AdvertisingService {
  private advertisements: Advertisement[] = []
  private currentAdIndex: number = 0
  private lastAdPlayedTime: number = 0
  private showStartTime: number = Date.now()
  private currentShow: string = ''
  private adPlaybackTimer: NodeJS.Timeout | null = null

  // Define ad schedules for different show durations
  private readonly adSchedules: { [key: string]: ShowAdSchedule } = {
    '30min': {
      showName: '',
      showDuration: 30,
      totalAdTime: 2,
      adSlots: [
        { position: 5, duration: 10, type: 'brand' },
        { position: 15, duration: 20, type: 'product' },
        { position: 25, duration: 10, type: 'brand' },
        { position: 30, duration: 30, type: 'sponsor' } // After show ends
      ]
    },
    '60min': {
      showName: '',
      showDuration: 60,
      totalAdTime: 5,
      adSlots: [
        { position: 5, duration: 10, type: 'brand' },
        { position: 15, duration: 30, type: 'product' },
        { position: 25, duration: 20, type: 'product' },
        { position: 35, duration: 30, type: 'sponsor' },
        { position: 45, duration: 20, type: 'product' },
        { position: 55, duration: 10, type: 'brand' },
        { position: 60, duration: 30, type: 'sponsor' } // After show ends
      ]
    },
    '120min': {
      showName: '',
      showDuration: 120,
      totalAdTime: 5,
      adSlots: [
        { position: 5, duration: 10, type: 'brand' },
        { position: 20, duration: 30, type: 'product' },
        { position: 40, duration: 20, type: 'product' },
        { position: 60, duration: 30, type: 'sponsor' },
        { position: 80, duration: 20, type: 'product' },
        { position: 100, duration: 30, type: 'product' },
        { position: 115, duration: 10, type: 'brand' },
        { position: 120, duration: 30, type: 'sponsor' } // After show ends
      ]
    }
  }

  // Brand categories and their matching shows
  private readonly brandShowMatching: { [key: string]: string[] } = {
    'technology': ['Tech Talk with Neural Nancy', 'Science Hour with Synthetic Sam'],
    'lifestyle': ['Morning Vibes with AI Alex', 'Evening Groove with Virtual Vicky'],
    'entertainment': ['Midday Mix with Digital Dave', 'Night Owl with Algorithmic Andy'],
    'business': ['Tech Talk with Neural Nancy', 'Morning Vibes with AI Alex'],
    'health': ['Morning Vibes with AI Alex', 'Science Hour with Synthetic Sam'],
    'food': ['Midday Mix with Digital Dave', 'Evening Groove with Virtual Vicky'],
    'automotive': ['Night Owl with Algorithmic Andy', 'Midday Mix with Digital Dave'],
    'fashion': ['Evening Groove with Virtual Vicky', 'Morning Vibes with AI Alex']
  }

  constructor() {
    // Load any saved advertisements from localStorage
    this.loadAdvertisements()
  }

  private loadAdvertisements() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('busk_advertisements')
      if (saved) {
        this.advertisements = JSON.parse(saved)
      }
    }
  }

  private saveAdvertisements() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('busk_advertisements', JSON.stringify(this.advertisements))
    }
  }

  public addAdvertisement(ad: Omit<Advertisement, 'id' | 'createdAt' | 'status'>): Advertisement {
    const newAd: Advertisement = {
      ...ad,
      id: `ad_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    }
    
    this.advertisements.push(newAd)
    this.saveAdvertisements()
    
    return newAd
  }

  public getAdvertisementsForShow(showName: string): Advertisement[] {
    return this.advertisements.filter(ad => 
      ad.status === 'scheduled' && 
      (ad.selectedShow === showName || this.isBrandMatch(ad, showName))
    )
  }

  private isBrandMatch(ad: Advertisement, showName: string): boolean {
    if (!ad.brandCategory) return false
    
    const matchingShows = this.brandShowMatching[ad.brandCategory] || []
    return matchingShows.includes(showName)
  }

  public startShow(showName: string, showDuration: number) {
    this.currentShow = showName
    this.showStartTime = Date.now()
    
    // Clear any existing timer
    if (this.adPlaybackTimer) {
      clearInterval(this.adPlaybackTimer)
    }
    
    // Determine which schedule to use based on show duration
    let scheduleKey = '30min'
    if (showDuration >= 120) {
      scheduleKey = '120min'
    } else if (showDuration >= 60) {
      scheduleKey = '60min'
    }
    
    const schedule = this.adSchedules[scheduleKey]
    
    // Start monitoring for ad slots
    this.adPlaybackTimer = setInterval(() => {
      this.checkAndPlayAds(schedule)
    }, 10000) // Check every 10 seconds
  }

  private async checkAndPlayAds(schedule: ShowAdSchedule) {
    const elapsedMinutes = (Date.now() - this.showStartTime) / 60000
    
    // Find the next ad slot
    const nextSlot = schedule.adSlots.find(slot => {
      const slotTime = slot.position
      return Math.abs(elapsedMinutes - slotTime) < 0.2 && // Within 12 seconds
             (Date.now() - this.lastAdPlayedTime) > 30000 // At least 30 seconds since last ad
    })
    
    if (nextSlot) {
      const availableAds = this.getAdvertisementsForShow(this.currentShow)
        .filter(ad => ad.duration === nextSlot.duration)
      
      if (availableAds.length > 0) {
        // Pick the next ad in rotation
        const ad = availableAds[this.currentAdIndex % availableAds.length]
        this.currentAdIndex++
        
        await this.playAdvertisement(ad)
        this.lastAdPlayedTime = Date.now()
      }
    }
  }

  private async playAdvertisement(ad: Advertisement) {
    try {
      ad.status = 'playing'
      this.saveAdvertisements()
      
      const session = new WebRTCSession()
      
      if (ad.adType === 'script' && ad.adScript) {
        // Format the ad script based on package type
        let formattedScript = ''
        
        if (ad.packageType === 'branded') {
          formattedScript = `This hour is brought to you by ${ad.companyName}. ${ad.adScript}`
        } else {
          formattedScript = `A message from our sponsor, ${ad.companyName}: ${ad.adScript}`
        }
        
        // Use TTS to read the advertisement
        await session.triggerResponse(formattedScript, true, false, 'Advertisement')
        
      } else if (ad.adType === 'audio' && ad.audioUrl) {
        // Play the audio file
        const audio = new Audio(ad.audioUrl)
        audio.volume = 1.0
        
        await new Promise((resolve, reject) => {
          audio.onended = resolve
          audio.onerror = reject
          audio.play()
        })
      }
      
      // Mark as completed after the duration
      setTimeout(() => {
        ad.status = 'completed'
        this.saveAdvertisements()
      }, ad.duration * 1000)
      
    } catch (error) {
      console.error('Error playing advertisement:', error)
      ad.status = 'scheduled' // Reset status on error
      this.saveAdvertisements()
    }
  }

  public stopShow() {
    if (this.adPlaybackTimer) {
      clearInterval(this.adPlaybackTimer)
      this.adPlaybackTimer = null
    }
    this.currentShow = ''
    this.showStartTime = Date.now()
    this.lastAdPlayedTime = 0
    this.currentAdIndex = 0
  }

  public getAdScheduleForShow(showDuration: number): ShowAdSchedule {
    let scheduleKey = '30min'
    if (showDuration >= 120) {
      scheduleKey = '120min'
    } else if (showDuration >= 60) {
      scheduleKey = '60min'
    }
    
    return this.adSchedules[scheduleKey]
  }

  public getAllAdvertisements(): Advertisement[] {
    return this.advertisements
  }

  public deleteAdvertisement(id: string) {
    this.advertisements = this.advertisements.filter(ad => ad.id !== id)
    this.saveAdvertisements()
  }

  public updateAdvertisement(id: string, updates: Partial<Advertisement>) {
    const index = this.advertisements.findIndex(ad => ad.id === id)
    if (index !== -1) {
      this.advertisements[index] = { ...this.advertisements[index], ...updates }
      this.saveAdvertisements()
    }
  }

  // Get available ad slots for a specific show
  public getAvailableSlots(showName: string, showDuration: number): AdSlot[] {
    const schedule = this.getAdScheduleForShow(showDuration)
    const bookedAds = this.getAdvertisementsForShow(showName)
    const now = Date.now()
    const showElapsedMinutes = (now - this.showStartTime) / 60000
    
    // Add labels to slots and check availability
    return schedule.adSlots.map(slot => {
      // Determine label based on position
      let label = ''
      if (slot.position <= 5) {
        label = 'Beginning of show'
      } else if (slot.position >= showDuration - 5) {
        label = 'End of show'
      } else if (slot.position === showDuration) {
        label = 'After show ends'
      } else {
        label = 'Middle of show'
      }
      
      // Check if slot is already past (for current show)
      const isPast = this.currentShow === showName && showElapsedMinutes > slot.position
      
      // Check if slot is fully booked
      const adsForSlot = bookedAds.filter(ad => ad.duration === slot.duration)
      const isFullyBooked = adsForSlot.length >= 3 // Max 3 ads per slot
      
      return {
        ...slot,
        label,
        available: !isPast && !isFullyBooked
      }
    }).filter(slot => slot.available) // Only return available slots
  }

  // Get pricing based on duration and package type
  public static getPricing(duration: 10 | 20 | 30, packageType: 'standard' | 'branded'): number {
    const pricing = {
      10: { standard: 0.05, branded: 50 },
      20: { standard: 30, branded: 60 },
      30: { standard: 50, branded: 100 }
    }
    
    return pricing[duration][packageType]
  }

  // Analytics
  public getAdvertisingStats() {
    const totalAds = this.advertisements.length
    const scheduledAds = this.advertisements.filter(ad => ad.status === 'scheduled').length
    const completedAds = this.advertisements.filter(ad => ad.status === 'completed').length
    const revenue = this.advertisements.reduce((sum, ad) => sum + ad.amount, 0)
    
    return {
      totalAds,
      scheduledAds,
      completedAds,
      revenue,
      adsByShow: this.getAdsByShow(),
      adsByType: this.getAdsByType()
    }
  }

  private getAdsByShow(): { [key: string]: number } {
    const byShow: { [key: string]: number } = {}
    this.advertisements.forEach(ad => {
      byShow[ad.selectedShow] = (byShow[ad.selectedShow] || 0) + 1
    })
    return byShow
  }

  private getAdsByType(): { [key: string]: number } {
    const byType: { [key: string]: number } = {}
    this.advertisements.forEach(ad => {
      byType[ad.adType] = (byType[ad.adType] || 0) + 1
    })
    return byType
  }
}

// Export singleton instance
export const advertisingService = new AdvertisingService()

// Export the class for static method access
export { AdvertisingService }
