# BUSK Radio Advertising System

## Overview

The BUSK Radio advertising system allows businesses to place advertisements that are automatically played during radio shows. The system supports both text-based ads (read by AI DJs) and audio file uploads.

## Features

### 1. Advertisement Types
- **Text Script Ads**: Advertisers provide a script that the AI DJ reads during the show
- **Audio File Ads**: Advertisers upload pre-recorded audio files (MP3 format)

### 2. Ad Durations
- **10 seconds**: Quick brand mentions
- **20 seconds**: Product advertisements
- **30 seconds**: Detailed sponsor messages

### 3. Package Types
- **Standard Advertisement ($50)**: Single ad placement during selected show
- **Branded Time Slot ($100/week)**: Full hour sponsorship with mentions every 15 minutes

### 4. Smart Ad Scheduling

#### For 30-minute shows (2 minutes total advertising):
- 10 seconds after 5 minutes (brand slot)
- 20 seconds after 15 minutes (product slot)
- 10 seconds after 25 minutes (brand slot)
- 30 seconds after show ends (sponsor slot)

#### For 60-minute shows (5 minutes total advertising):
- 10 seconds after 5 minutes
- 30 seconds after 15 minutes
- 20 seconds after 25 minutes
- 30 seconds after 35 minutes
- 20 seconds after 45 minutes
- 10 seconds after 55 minutes
- 30 seconds after show ends

#### For 2+ hour shows (5 minutes total advertising):
- Similar distribution spread throughout the show
- Ads placed strategically to maintain listener engagement

### 5. Brand Matching
The system automatically matches advertisements to appropriate shows based on brand categories:

- **Technology**: Tech Talk, Science Hour
- **Lifestyle**: Morning Vibes, Evening Groove
- **Entertainment**: Midday Mix, Night Owl
- **Business**: Tech Talk, Morning Vibes
- **Health & Wellness**: Morning Vibes, Science Hour
- **Food & Beverage**: Midday Mix, Evening Groove
- **Automotive**: Night Owl, Midday Mix
- **Fashion & Beauty**: Evening Groove, Morning Vibes

## Implementation Details

### Core Components

1. **`/lib/advertising-service.ts`**
   - Manages ad storage and retrieval
   - Handles ad scheduling and playback timing
   - Tracks ad performance and analytics

2. **`/components/advertising-modal.tsx`**
   - User interface for creating new advertisements
   - Handles payment processing
   - Supports both text and audio ad creation

3. **`/components/advertising-dashboard.tsx`**
   - Analytics dashboard showing ad performance
   - Revenue tracking and statistics
   - Ad management interface

4. **`/app/api/advertising/route.ts`**
   - API endpoints for ad creation and retrieval
   - Integration with advertising service

5. **`/app/advertising/page.tsx`**
   - Dedicated advertising center page
   - Access to dashboard and ad creation

### How It Works

1. **Ad Creation**:
   - Advertisers access the advertising modal from the main radio interface
   - They select their package type, duration, and target show
   - Payment is processed through the integrated payment system
   - Ads are stored in localStorage (can be upgraded to database)

2. **Ad Playback**:
   - When a show starts, the advertising service is notified
   - The service monitors elapsed time and triggers ads at scheduled slots
   - Text ads use the TTS system with the show's voice profile
   - Audio ads are played directly through the browser

3. **Brand Matching**:
   - Advertisers select their brand category during ad creation
   - The system automatically includes their ad in relevant shows
   - This ensures ads reach the most appropriate audience

## Usage

### For Advertisers

1. Click the "Advertise" button in the requests panel
2. Fill out the advertising form:
   - Company name
   - Select target show
   - Choose brand category
   - Select ad duration (10s, 20s, or 30s)
   - Choose between text script or audio upload
   - Complete payment

3. Monitor your ads in the Advertising Center dashboard

### For Developers

To test the advertising system:

```javascript
// Add a test advertisement
import { advertisingService } from '@/lib/advertising-service'

const testAd = advertisingService.addAdvertisement({
  companyName: "Test Company",
  adScript: "Visit Test Company for all your testing needs!",
  selectedShow: "Morning Vibes with AI Alex",
  adType: "script",
  duration: 20,
  packageType: "standard",
  amount: 50,
  brandCategory: "technology"
})

// Start a show to trigger ad playback
advertisingService.startShow("Morning Vibes with AI Alex", 180)
```

## Future Enhancements

1. **Database Integration**: Move from localStorage to a proper database
2. **Advanced Analytics**: Detailed metrics on ad impressions and engagement
3. **Programmatic Advertising**: Automated ad placement based on available inventory
4. **Dynamic Pricing**: Adjust prices based on show popularity and time slots
5. **A/B Testing**: Test different ad variations for effectiveness
6. **Real-time Bidding**: Allow advertisers to bid for premium slots
7. **Audio Processing**: Validate and normalize uploaded audio files
8. **Campaign Management**: Multi-ad campaigns with scheduling options

## API Reference

### POST /api/advertising
Create a new advertisement

Request body:
```json
{
  "companyName": "string",
  "adScript": "string (optional)",
  "audioUrl": "string (optional)",
  "selectedShow": "string",
  "adType": "script | audio",
  "packageType": "standard | branded",
  "duration": 10 | 20 | 30,
  "brandCategory": "string",
  "amount": "number"
}
```

### GET /api/advertising
Get all advertisements or filter by show

Query parameters:
- `show`: Filter advertisements by show name

Response:
```json
{
  "advertisements": [...],
  "stats": {
    "totalAds": "number",
    "scheduledAds": "number",
    "completedAds": "number",
    "revenue": "number",
    "adsByShow": {},
    "adsByType": {}
  }
}
