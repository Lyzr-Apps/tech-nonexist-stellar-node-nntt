'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FiFilm, FiVideo, FiZap, FiLayout, FiTarget, FiSave, FiRefreshCw,
  FiTrash2, FiAlertCircle, FiClock, FiMusic, FiMic, FiType, FiSun,
  FiEye, FiArrowRight, FiHash, FiCopy, FiCheck, FiMessageCircle,
  FiFileText, FiSearch, FiSmartphone, FiMonitor, FiGrid,
  FiChevronRight, FiActivity
} from 'react-icons/fi'

// ============================================================
// Constants & Types
// ============================================================

const AGENT_ID = '699e8d1dafdc74dd12d77e27'

const THEME_VARS = {
  '--background': '231 18% 14%',
  '--foreground': '60 30% 96%',
  '--card': '232 16% 18%',
  '--card-foreground': '60 30% 96%',
  '--primary': '265 89% 72%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '232 16% 24%',
  '--secondary-foreground': '60 30% 96%',
  '--accent': '135 94% 60%',
  '--accent-foreground': '231 18% 10%',
  '--destructive': '0 100% 62%',
  '--muted': '232 16% 28%',
  '--muted-foreground': '228 10% 62%',
  '--border': '232 16% 28%',
  '--input': '232 16% 32%',
  '--ring': '265 89% 72%',
  '--chart-1': '265 89% 72%',
  '--chart-2': '135 94% 60%',
  '--chart-3': '191 97% 70%',
  '--chart-4': '326 100% 68%',
  '--chart-5': '31 100% 65%',
  '--radius': '0.875rem',
} as React.CSSProperties

const STORAGE_KEY = 'advision_saved_ads'

const PLATFORMS = [
  { label: 'TikTok/Reels', icon: 'smartphone' },
  { label: 'YouTube', icon: 'video' },
  { label: 'Instagram Feed', icon: 'grid' },
  { label: 'Facebook', icon: 'monitor' },
  { label: 'LinkedIn', icon: 'layout' },
  { label: 'TV/OTT', icon: 'film' },
]

const AD_STYLES = [
  'Emotional', 'Humorous', 'Educational', 'Cinematic',
  'Testimonial', 'Fast-Paced', 'Minimalist', 'Storytelling'
]

const AD_DURATIONS = ['15s', '30s', '60s', '90s', '2min+']

interface HookData {
  description?: string
  duration_seconds?: number
  visual_direction?: string
  text_overlay?: string
}

interface SceneData {
  scene_number?: number
  title?: string
  duration_seconds?: number
  setting?: string
  visual_direction?: string
  camera_movement?: string
  lighting?: string
  voiceover?: string
  on_screen_text?: string
  transition?: string
}

interface SoundEffectData {
  effect?: string
  timing?: string
}

interface MusicSoundData {
  genre?: string
  mood?: string
  tempo?: string
  sound_effects?: SoundEffectData[]
  energy_curve?: string
}

interface CTAData {
  primary_cta?: string
  secondary_cta?: string
  cta_timing?: string
  urgency_element?: string
  placement?: string
}

interface ProductionNotesData {
  budget_range?: string
  talent_needed?: string
  props_and_locations?: string
  platform_tips?: string
  post_production?: string
}

interface AdConceptData {
  ad_title?: string
  concept_summary?: string
  platform?: string
  duration?: string
  aspect_ratio?: string
  target_audience?: string
  ad_style?: string
  hook?: HookData
  scenes?: SceneData[]
  music_and_sound?: MusicSoundData
  call_to_action?: CTAData
  production_notes?: ProductionNotesData
  creative_rationale?: string
  full_voiceover_script?: string
  hashtag_suggestions?: string[]
}

interface SavedAd {
  id: string
  adTitle: string
  productName: string
  platform: string
  duration: string
  adStyle: string
  conceptSummary: string
  fullData: AdConceptData
  createdAt: string
}

interface FormData {
  productName: string
  productDescription: string
  targetAudience: string
  platform: string
  adStyle: string
  duration: string
  additionalNotes: string
}

// ============================================================
// Sample Data
// ============================================================

const SAMPLE_FORM: FormData = {
  productName: 'Nike Air Max Pulse',
  productDescription: 'Revolutionary sneakers featuring visible Air cushioning technology. Designed for everyday comfort and street style with sustainable materials and bold colorways.',
  targetAudience: 'Gen Z sneakerheads and streetwear enthusiasts, 18-28, urban',
  platform: 'TikTok/Reels',
  adStyle: 'Fast-Paced',
  duration: '30s',
  additionalNotes: 'Focus on the visible air unit and street culture. Include diverse cast.',
}

const SAMPLE_AD: AdConceptData = {
  ad_title: 'Air Max Pulse: Feel the Beat',
  concept_summary: 'A high-energy, music-driven 30-second TikTok/Reels ad that positions the Nike Air Max Pulse as the ultimate street culture sneaker. The concept uses rhythmic editing synchronized to a bass-heavy beat, showcasing the visible Air unit as a visual heartbeat that connects music, movement, and urban energy.',
  platform: 'TikTok/Reels',
  duration: '30 seconds',
  aspect_ratio: '9:16',
  target_audience: 'Gen Z sneakerheads and streetwear enthusiasts, 18-28, urban',
  ad_style: 'Fast-Paced',
  hook: {
    description: 'Extreme close-up of the Air Max Pulse sole hitting a puddle in slow-motion, sending water rippling outward in sync with a deep bass drop.',
    duration_seconds: 3,
    visual_direction: 'Macro lens shot at ground level. The visible Air unit glows with an ethereal light as it impacts. Water droplets freeze mid-air before the tempo kicks in.',
    text_overlay: 'FEEL THE BEAT',
  },
  scenes: [
    {
      scene_number: 1,
      title: 'Urban Awakening',
      duration_seconds: 5,
      setting: 'Downtown city block at golden hour, graffiti walls and neon signs',
      visual_direction: 'Quick-cut montage of diverse feet in Air Max Pulse walking, running, dancing on different urban surfaces. Each step triggers a visual pulse effect.',
      camera_movement: 'Rapid low-angle tracking shots following feet, whip pans between locations',
      lighting: 'Golden hour warmth contrasted with neon accent lighting',
      voiceover: '',
      on_screen_text: 'EVERY STEP',
      transition: 'Beat-synced flash cut',
    },
    {
      scene_number: 2,
      title: 'The Pulse Effect',
      duration_seconds: 8,
      setting: 'Rooftop basketball court overlooking city skyline',
      visual_direction: 'A dancer performs explosive moves, each landing creating a visible shockwave emanating from the Air unit. Color grading shifts with each beat.',
      camera_movement: 'Circular dolly around dancer, drone pull-back to reveal skyline',
      lighting: 'Dramatic backlit silhouette transitioning to full color reveal',
      voiceover: 'When the city moves, you feel every beat.',
      on_screen_text: 'A PULSE',
      transition: 'Zoom through Air unit lens',
    },
    {
      scene_number: 3,
      title: 'Street Culture Montage',
      duration_seconds: 8,
      setting: 'Multiple locations: skate park, record store, food truck alley, subway platform',
      visual_direction: 'Rapid lifestyle montage showing diverse Gen Z cast wearing Air Max Pulse in their element. Each person adds their own rhythm to the visual beat.',
      camera_movement: 'Handheld energy, snap zooms, Dutch angles for dynamism',
      lighting: 'Mixed natural and urban artificial lighting for authentic feel',
      voiceover: 'Your street. Your sound. Your pulse.',
      on_screen_text: '',
      transition: 'Rhythmic wipe synced to music',
    },
    {
      scene_number: 4,
      title: 'Product Hero & CTA',
      duration_seconds: 6,
      setting: 'Clean dark studio with dramatic single spotlight',
      visual_direction: 'Slow-motion 360-degree rotation of the Air Max Pulse with the visible Air unit pulsing like a heartbeat. Shoe transforms through three colorways.',
      camera_movement: 'Smooth orbital shot tightening to Air unit close-up',
      lighting: 'Single dramatic spotlight with colored rim lights matching shoe colorways',
      voiceover: '',
      on_screen_text: 'NIKE AIR MAX PULSE',
      transition: 'Final beat drop to black',
    },
  ],
  music_and_sound: {
    genre: 'Electronic / Lo-fi Hip-Hop Hybrid',
    mood: 'Energetic, confident, urban, youthful',
    tempo: '128 BPM with half-time breakdowns',
    sound_effects: [
      { effect: 'Deep bass impact', timing: 'Every footstep landing (0:00-0:15)' },
      { effect: 'Whoosh / air release', timing: 'Air unit close-ups (0:03, 0:18)' },
      { effect: 'Vinyl scratch', timing: 'Scene transitions (0:08, 0:16)' },
      { effect: 'Heartbeat pulse', timing: 'Product hero shot (0:24-0:30)' },
      { effect: 'City ambience layer', timing: 'Throughout at low volume' },
    ],
    energy_curve: 'Starts with a dramatic bass drop hook, builds through scenes 1-2, peaks during the street culture montage, then drops to a clean, powerful product hero moment before the final beat.',
  },
  call_to_action: {
    primary_cta: 'Shop Air Max Pulse',
    secondary_cta: 'Explore All Colorways',
    cta_timing: 'Final 4 seconds with swipe-up prompt',
    urgency_element: 'Limited Launch Colorway - Available Now',
    placement: 'Bottom-center with Nike swoosh animation, swipe-up CTA for TikTok native interaction',
  },
  production_notes: {
    budget_range: '$15,000 - $25,000 (mid-range production)',
    talent_needed: '4-5 diverse Gen Z talent (dancers, skaters, lifestyle), no speaking roles required, strong movement skills preferred',
    props_and_locations: 'Air Max Pulse in 3 colorways, urban locations (rooftop, skate park, downtown), studio with backdrop for hero shot, skateboard, boombox, vinyl records for styling',
    platform_tips: 'Optimize for sound-on viewing (TikTok algorithm favors it). Use trending audio elements. Include closed captions for accessibility. First frame must be visually arresting for autoplay. Vertical 9:16 native format only.',
    post_production: 'Heavy color grading with Dracula-inspired dark tones. VFX for pulse/shockwave effects on footsteps. Speed ramping between slow-mo and hyper-speed. Beat-synced editing is critical. Add subtle screen shake on impacts.',
  },
  creative_rationale: 'This concept leverages the "visible technology" trend in sneaker marketing while adapting it for TikTok\'s fast-paced, music-driven format. By making the Air unit a visual "heartbeat," we create an ownable visual language that connects Nike\'s innovation story to Gen Z\'s music-first culture. The diverse cast and multiple urban settings ensure broad relatability, while the rhythmic editing style mirrors the content Gen Z already consumes and creates on TikTok, making the ad feel native rather than intrusive.',
  full_voiceover_script: '[0:00-0:03] (No voiceover - pure visual impact with bass drop)\n[0:03-0:08] (No voiceover - visual storytelling with on-screen text)\n[0:08-0:16] "When the city moves, you feel every beat."\n[0:16-0:24] "Your street. Your sound. Your pulse."\n[0:24-0:30] (No voiceover - product hero with on-screen text and CTA)',
  hashtag_suggestions: [
    '#AirMaxPulse', '#NikeAirMax', '#FeelTheBeat', '#StreetStyle',
    '#SneakerHead', '#NikeAd', '#UrbanFashion', '#GenZStyle',
    '#KickCheck', '#OOTD', '#Sneakers2024'
  ],
}

// ============================================================
// Helper Functions
// ============================================================

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

function loadSavedAds(): SavedAd[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveSavedAds(ads: SavedAd[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ads))
  } catch {
    // storage full
  }
}

function getPlatformIcon(icon: string) {
  switch (icon) {
    case 'smartphone': return <FiSmartphone className="w-4 h-4" />
    case 'video': return <FiVideo className="w-4 h-4" />
    case 'grid': return <FiGrid className="w-4 h-4" />
    case 'monitor': return <FiMonitor className="w-4 h-4" />
    case 'layout': return <FiLayout className="w-4 h-4" />
    case 'film': return <FiFilm className="w-4 h-4" />
    default: return <FiMonitor className="w-4 h-4" />
  }
}

// ============================================================
// Sub-Components
// ============================================================

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text])

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCopy}
      className="border-border text-foreground hover:bg-muted shrink-0"
    >
      {copied ? (
        <><FiCheck className="w-3.5 h-3.5 mr-1 text-green-400" />{label ? 'Copied!' : 'Copied!'}</>
      ) : (
        <><FiCopy className="w-3.5 h-3.5 mr-1" />{label ?? 'Copy'}</>
      )}
    </Button>
  )
}

function PlatformSelector({ selected, onSelect }: { selected: string; onSelect: (p: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORMS.map((p) => {
        const isSelected = selected === p.label
        return (
          <button
            key={p.label}
            onClick={() => onSelect(p.label)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25' : 'bg-secondary text-secondary-foreground border-border hover:bg-muted hover:border-muted-foreground/30'}`}
          >
            {getPlatformIcon(p.icon)}
            {p.label}
          </button>
        )
      })}
    </div>
  )
}

function StyleSelector({ selected, onSelect }: { selected: string; onSelect: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {AD_STYLES.map((style) => {
        const isSelected = selected === style
        return (
          <button
            key={style}
            onClick={() => onSelect(style)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25' : 'bg-secondary text-secondary-foreground border-border hover:bg-muted hover:border-muted-foreground/30'}`}
          >
            {style}
          </button>
        )
      })}
    </div>
  )
}

function DurationSelector({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {AD_DURATIONS.map((dur) => {
        const isSelected = selected === dur
        return (
          <button
            key={dur}
            onClick={() => onSelect(dur)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25' : 'bg-secondary text-secondary-foreground border-border hover:bg-muted hover:border-muted-foreground/30'}`}
          >
            <FiClock className="inline w-3.5 h-3.5 mr-1.5" />
            {dur}
          </button>
        )
      })}
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 animate-pulse" />
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FiActivity className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Crafting your video ad concept</span>
            <span className="text-sm text-muted-foreground animate-pulse">...</span>
          </div>
          <Skeleton className="h-6 w-2/3 bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-5/6 bg-muted" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-20 rounded-full bg-muted" />
            <Skeleton className="h-6 w-16 rounded-full bg-muted" />
            <Skeleton className="h-6 w-24 rounded-full bg-muted" />
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(n => (
          <Card key={n} className="bg-card border-border">
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-5 w-1/3 bg-muted" />
              <Skeleton className="h-24 w-full bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-5 w-1/4 bg-muted" />
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                  <Skeleton className="h-16 w-full bg-muted rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function HookCard({ hook }: { hook: HookData | null }) {
  if (!hook) return null
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <FiZap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg">The Hook</h3>
          {typeof hook?.duration_seconds === 'number' && (
            <Badge className="mt-1 bg-primary/20 text-primary border-primary/30 text-xs">
              <FiClock className="w-3 h-3 mr-1" />{hook.duration_seconds}s
            </Badge>
          )}
        </div>
      </div>
      {hook?.description && (
        <p className="text-foreground text-sm leading-relaxed mb-4">{hook.description}</p>
      )}
      {hook?.visual_direction && (
        <div className="mb-3 p-3 bg-secondary/60 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1.5">
            <FiEye className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visual Direction</span>
          </div>
          <p className="text-sm text-foreground/90">{hook.visual_direction}</p>
        </div>
      )}
      {hook?.text_overlay && (
        <div className="p-3 bg-secondary/60 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1.5">
            <FiType className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Text Overlay</span>
          </div>
          <p className="text-lg font-bold text-foreground tracking-wide">{hook.text_overlay}</p>
        </div>
      )}
    </div>
  )
}

function SceneCard({ scene, isLast }: { scene: SceneData; isLast: boolean }) {
  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-sm shrink-0 z-10">
          {typeof scene?.scene_number === 'number' ? scene.scene_number : '?'}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-border min-h-[2rem]" />}
      </div>

      {/* Scene content */}
      <div className="flex-1 pb-6">
        <Card className="bg-secondary/50 border-border hover:border-muted-foreground/30 transition-colors">
          <CardContent className="p-5">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h4 className="font-semibold text-foreground">{scene?.title ?? 'Untitled Scene'}</h4>
              {typeof scene?.duration_seconds === 'number' && (
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                  <FiClock className="w-3 h-3 mr-1" />{scene.duration_seconds}s
                </Badge>
              )}
            </div>

            {/* Setting */}
            {scene?.setting && (
              <p className="text-sm text-muted-foreground mb-3 italic">{scene.setting}</p>
            )}

            {/* Details grid */}
            <div className="space-y-2.5">
              {scene?.visual_direction && (
                <div className="flex items-start gap-2.5">
                  <FiEye className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Visual</span>
                    <p className="text-sm text-foreground/90 mt-0.5">{scene.visual_direction}</p>
                  </div>
                </div>
              )}

              {scene?.camera_movement && (
                <div className="flex items-start gap-2.5">
                  <FiVideo className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Camera</span>
                    <p className="text-sm text-foreground/90 mt-0.5">{scene.camera_movement}</p>
                  </div>
                </div>
              )}

              {scene?.lighting && (
                <div className="flex items-start gap-2.5">
                  <FiSun className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Lighting</span>
                    <p className="text-sm text-foreground/90 mt-0.5">{scene.lighting}</p>
                  </div>
                </div>
              )}

              {scene?.voiceover && (
                <div className="flex items-start gap-2.5">
                  <FiMic className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Voiceover</span>
                    <p className="text-sm text-foreground/90 mt-0.5 italic">&ldquo;{scene.voiceover}&rdquo;</p>
                  </div>
                </div>
              )}

              {scene?.on_screen_text && (
                <div className="flex items-start gap-2.5">
                  <FiType className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-pink-400">On-Screen Text</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{scene.on_screen_text}</p>
                  </div>
                </div>
              )}

              {scene?.transition && (
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <FiArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Transition: {scene.transition}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StoryboardTimeline({ scenes }: { scenes: SceneData[] }) {
  const safeScenes = Array.isArray(scenes) ? scenes : []
  if (safeScenes.length === 0) return <p className="text-sm text-muted-foreground">No scenes available.</p>

  return (
    <div className="space-y-0">
      {safeScenes.map((scene, idx) => (
        <SceneCard key={idx} scene={scene} isLast={idx === safeScenes.length - 1} />
      ))}
    </div>
  )
}

function MusicSoundCard({ data }: { data: MusicSoundData | null }) {
  if (!data) return null
  const soundEffects = Array.isArray(data?.sound_effects) ? data.sound_effects : []

  return (
    <div className="space-y-4">
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {data?.genre && (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm">
            <FiMusic className="w-3.5 h-3.5 mr-1.5" />{data.genre}
          </Badge>
        )}
        {data?.mood && (
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-sm">{data.mood}</Badge>
        )}
        {data?.tempo && (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-sm">
            <FiActivity className="w-3.5 h-3.5 mr-1.5" />{data.tempo}
          </Badge>
        )}
      </div>

      {/* Sound Effects */}
      {soundEffects.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sound Effects</h4>
          <div className="space-y-2">
            {soundEffects.map((sfx, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-secondary/60 rounded-lg border border-border">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{sfx?.effect ?? 'Unknown effect'}</span>
                  {sfx?.timing && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <FiClock className="inline w-3 h-3 mr-1" />{sfx.timing}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Energy Curve */}
      {data?.energy_curve && (
        <div className="p-4 bg-secondary/60 rounded-lg border border-border">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Energy Curve</h4>
          <p className="text-sm text-foreground/90 leading-relaxed">{data.energy_curve}</p>
        </div>
      )}
    </div>
  )
}

function CTACard({ data }: { data: CTAData | null }) {
  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Primary CTA */}
      {data?.primary_cta && (
        <div className="p-5 bg-gradient-to-r from-primary/15 to-primary/5 rounded-xl border border-primary/30 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">Primary CTA</span>
          <p className="text-xl font-bold text-foreground">{data.primary_cta}</p>
        </div>
      )}

      {/* Secondary CTA */}
      {data?.secondary_cta && (
        <div className="p-4 bg-secondary/60 rounded-lg border border-border text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Secondary CTA</span>
          <p className="text-sm font-medium text-foreground">{data.secondary_cta}</p>
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {data?.cta_timing && (
          <div className="p-3 bg-secondary/60 rounded-lg border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Timing</span>
            <p className="text-sm text-foreground">{data.cta_timing}</p>
          </div>
        )}
        {data?.urgency_element && (
          <div className="p-3 bg-secondary/60 rounded-lg border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Urgency</span>
            <p className="text-sm text-foreground">{data.urgency_element}</p>
          </div>
        )}
        {data?.placement && (
          <div className="p-3 bg-secondary/60 rounded-lg border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Placement</span>
            <p className="text-sm text-foreground">{data.placement}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductionNotesCard({ data }: { data: ProductionNotesData | null }) {
  if (!data) return null

  const notes = [
    { label: 'Budget Range', value: data?.budget_range, color: 'text-green-400' },
    { label: 'Talent Needed', value: data?.talent_needed, color: 'text-cyan-400' },
    { label: 'Props & Locations', value: data?.props_and_locations, color: 'text-purple-400' },
    { label: 'Platform Tips', value: data?.platform_tips, color: 'text-orange-400' },
    { label: 'Post-Production', value: data?.post_production, color: 'text-pink-400' },
  ].filter(n => n.value)

  return (
    <div className="space-y-3">
      {notes.map((note, i) => (
        <div key={i} className="p-4 bg-secondary/60 rounded-lg border border-border">
          <span className={`text-xs font-semibold uppercase tracking-wider ${note.color} block mb-1.5`}>{note.label}</span>
          <p className="text-sm text-foreground/90 leading-relaxed">{note.value}</p>
        </div>
      ))}
    </div>
  )
}

function AdConceptDisplay({ data, onSave, onNewBrief, saveMessage }: {
  data: AdConceptData
  onSave: () => void
  onNewBrief: () => void
  saveMessage: string
}) {
  const scenes = Array.isArray(data?.scenes) ? data.scenes : []
  const hashtags = Array.isArray(data?.hashtag_suggestions) ? data.hashtag_suggestions : []
  const hook = data?.hook && typeof data.hook === 'object' ? data.hook : null
  const musicAndSound = data?.music_and_sound && typeof data.music_and_sound === 'object' ? data.music_and_sound : null
  const callToAction = data?.call_to_action && typeof data.call_to_action === 'object' ? data.call_to_action : null
  const productionNotes = data?.production_notes && typeof data.production_notes === 'object' ? data.production_notes : null

  return (
    <div className="space-y-4">
      {/* Ad Overview Header */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400" />
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <FiFilm className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground tracking-tight">{data?.ad_title ?? 'Video Ad Concept'}</h2>
              {data?.concept_summary && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{data.concept_summary}</p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {data?.platform && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{data.platform}</Badge>
            )}
            {data?.duration && (
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <FiClock className="w-3 h-3 mr-1" />{data.duration}
              </Badge>
            )}
            {data?.aspect_ratio && (
              <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">{data.aspect_ratio}</Badge>
            )}
            {data?.ad_style && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{data.ad_style}</Badge>
            )}
            {data?.target_audience && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <FiTarget className="w-3 h-3 mr-1" />{data.target_audience}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onSave} variant="outline" className="bg-secondary border-border text-foreground hover:bg-muted">
              <FiSave className="w-4 h-4 mr-2" />Save Ad Concept
            </Button>
            <Button onClick={onNewBrief} variant="outline" className="bg-secondary border-border text-foreground hover:bg-muted">
              <FiRefreshCw className="w-4 h-4 mr-2" />New Brief
            </Button>
            {data?.full_voiceover_script && (
              <CopyButton text={data.full_voiceover_script} label="Copy Script" />
            )}
            {saveMessage && (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <FiCheck className="w-4 h-4" />{saveMessage}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={['hook', 'storyboard', 'music', 'cta']} className="space-y-2">

        {/* Hook */}
        {hook && (
          <AccordionItem value="hook" className="bg-card border border-border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-3 text-foreground">
                <FiZap className="w-5 h-5 text-primary" />
                <span className="font-semibold">The Hook</span>
                {typeof hook?.duration_seconds === 'number' && (
                  <Badge variant="secondary" className="bg-secondary text-muted-foreground ml-1">{hook.duration_seconds}s</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <HookCard hook={hook} />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Storyboard */}
        <AccordionItem value="storyboard" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-foreground">
              <FiLayout className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold">Scene-by-Scene Storyboard</span>
              <Badge variant="secondary" className="bg-secondary text-muted-foreground ml-1">{scenes.length} scenes</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <StoryboardTimeline scenes={scenes} />
          </AccordionContent>
        </AccordionItem>

        {/* Music & Sound */}
        {musicAndSound && (
          <AccordionItem value="music" className="bg-card border border-border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-3 text-foreground">
                <FiMusic className="w-5 h-5 text-pink-400" />
                <span className="font-semibold">Music & Sound Design</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <MusicSoundCard data={musicAndSound} />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Call to Action */}
        {callToAction && (
          <AccordionItem value="cta" className="bg-card border border-border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-3 text-foreground">
                <FiTarget className="w-5 h-5 text-green-400" />
                <span className="font-semibold">Call to Action Strategy</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <CTACard data={callToAction} />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Production Notes */}
        {productionNotes && (
          <AccordionItem value="production" className="bg-card border border-border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-3 text-foreground">
                <FiFileText className="w-5 h-5 text-orange-400" />
                <span className="font-semibold">Production Notes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <ProductionNotesCard data={productionNotes} />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Creative Rationale */}
        {data?.creative_rationale && (
          <AccordionItem value="rationale" className="bg-card border border-border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-3 text-foreground">
                <FiMessageCircle className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">Creative Rationale</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="p-5 bg-secondary/40 rounded-xl border-l-4 border-primary">
                <div className="text-foreground">{renderMarkdown(data.creative_rationale)}</div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Full Voiceover Script */}
        {data?.full_voiceover_script && (
          <AccordionItem value="script" className="bg-card border border-border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-3 text-foreground">
                <FiMic className="w-5 h-5 text-green-400" />
                <span className="font-semibold">Full Voiceover Script</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="relative">
                <div className="absolute top-3 right-3 z-10">
                  <CopyButton text={data.full_voiceover_script} />
                </div>
                <pre className="p-5 pr-24 bg-secondary/60 rounded-xl border border-border font-mono text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {data.full_voiceover_script}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Hashtag Suggestions */}
        {hashtags.length > 0 && (
          <AccordionItem value="hashtags" className="bg-card border border-border rounded-xl overflow-hidden">
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
              <div className="flex items-center gap-3 text-foreground">
                <FiHash className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold">Hashtag Suggestions</span>
                <Badge variant="secondary" className="bg-secondary text-muted-foreground ml-1">{hashtags.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="flex flex-wrap gap-2 mb-4">
                {hashtags.map((tag, i) => (
                  <Badge key={i} className="bg-primary/15 text-primary border-primary/30 text-sm px-3 py-1.5">
                    {typeof tag === 'string' && !tag.startsWith('#') ? `#${tag}` : tag}
                  </Badge>
                ))}
              </div>
              <CopyButton
                text={hashtags.map(t => typeof t === 'string' && !t.startsWith('#') ? `#${t}` : t).join(' ')}
                label="Copy All Hashtags"
              />
            </AccordionContent>
          </AccordionItem>
        )}

      </Accordion>
    </div>
  )
}

function SavedAdCard({ ad, onDelete, onExpand, expanded }: {
  ad: SavedAd
  onDelete: () => void
  onExpand: () => void
  expanded: boolean
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-0">
        <button onClick={onExpand} className="w-full text-left p-5 hover:bg-muted/20 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{ad.adTitle || ad.productName || 'Untitled Ad'}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {ad.platform && (
                  <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">{ad.platform}</Badge>
                )}
                {ad.duration && (
                  <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{ad.duration}</Badge>
                )}
                {ad.adStyle && (
                  <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">{ad.adStyle}</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  <FiClock className="inline w-3 h-3 mr-1" />
                  {new Date(ad.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ad.conceptSummary}</p>
            </div>
            <FiChevronRight className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 mt-1 ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {expanded && (
          <div className="border-t border-border p-5">
            <AdConceptDisplay
              data={ad.fullData}
              onSave={() => {}}
              onNewBrief={() => {}}
              saveMessage=""
            />
            <div className="mt-4 flex justify-end">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Delete this ad?</span>
                  <Button size="sm" variant="destructive" onClick={() => { onDelete(); setConfirmDelete(false) }} className="bg-destructive text-white">
                    Yes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)} className="border-border text-foreground">
                    No
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setConfirmDelete(true)} className="border-border text-red-400 hover:bg-red-500/10">
                  <FiTrash2 className="w-4 h-4 mr-1" />Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================
// ErrorBoundary
// ============================================================

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ============================================================
// Main Page Component
// ============================================================

export default function Page() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'create' | 'myads'>('create')

  // Form state
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    productDescription: '',
    targetAudience: '',
    platform: '',
    adStyle: '',
    duration: '',
    additionalNotes: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})

  // Agent state
  const [loading, setLoading] = useState(false)
  const [adConcept, setAdConcept] = useState<AdConceptData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Sample data toggle
  const [showSample, setShowSample] = useState(false)

  // History state
  const [savedAds, setSavedAds] = useState<SavedAd[]>([])
  const [historySearch, setHistorySearch] = useState('')
  const [historySort, setHistorySort] = useState<'date' | 'platform'>('date')
  const [expandedAdId, setExpandedAdId] = useState<string | null>(null)

  // Refs
  const resultRef = useRef<HTMLDivElement>(null)

  // Load saved ads on mount
  useEffect(() => {
    setSavedAds(loadSavedAds())
  }, [])

  // Sample data toggle
  useEffect(() => {
    if (showSample) {
      setFormData(SAMPLE_FORM)
      setAdConcept(SAMPLE_AD)
      setError(null)
      setValidationErrors({})
    } else {
      setFormData({
        productName: '',
        productDescription: '',
        targetAudience: '',
        platform: '',
        adStyle: '',
        duration: '',
        additionalNotes: '',
      })
      setAdConcept(null)
      setError(null)
      setValidationErrors({})
    }
  }, [showSample])

  const isFormValid = useMemo(() => {
    return (
      formData.productName.trim() !== '' &&
      formData.productDescription.trim() !== '' &&
      formData.targetAudience.trim() !== '' &&
      formData.platform !== '' &&
      formData.adStyle !== '' &&
      formData.duration !== ''
    )
  }, [formData])

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, boolean> = {}
    if (!formData.productName.trim()) errors.productName = true
    if (!formData.productDescription.trim()) errors.productDescription = true
    if (!formData.targetAudience.trim()) errors.targetAudience = true
    if (!formData.platform) errors.platform = true
    if (!formData.adStyle) errors.adStyle = true
    if (!formData.duration) errors.duration = true
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  const handleGenerate = useCallback(async () => {
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setAdConcept(null)
    setActiveAgentId(AGENT_ID)

    try {
      const message = `Generate a video advertisement concept for the following brief:

Product/Brand: ${formData.productName}
Product Description: ${formData.productDescription}
Target Audience: ${formData.targetAudience}
Platform: ${formData.platform}
Ad Style: ${formData.adStyle}
Duration: ${formData.duration}
${formData.additionalNotes.trim() ? `Additional Notes: ${formData.additionalNotes}` : ''}

Please create a complete, production-ready video ad concept with detailed scenes, visual directions, voiceover script, music/sound design, call-to-action strategy, and production notes.`

      const result = await callAIAgent(message, AGENT_ID)

      if (result.success && result.response) {
        let data = result?.response?.result
        if (typeof data === 'string') {
          try { data = JSON.parse(data) } catch {
            data = { concept_summary: data }
          }
        }
        if (data && typeof data === 'object') {
          setAdConcept(data as AdConceptData)
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 200)
        } else {
          setError('Received an unexpected response format. Please try again.')
        }
      } else {
        setError(result?.error ?? 'Failed to generate ad concept. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [formData, validateForm])

  const handleSaveAd = useCallback(() => {
    if (!adConcept) return

    const saved: SavedAd = {
      id: generateId(),
      adTitle: adConcept?.ad_title ?? formData.productName,
      productName: formData.productName,
      platform: adConcept?.platform ?? formData.platform,
      duration: adConcept?.duration ?? formData.duration,
      adStyle: adConcept?.ad_style ?? formData.adStyle,
      conceptSummary: adConcept?.concept_summary ?? '',
      fullData: adConcept,
      createdAt: new Date().toISOString(),
    }

    const updated = [saved, ...savedAds]
    setSavedAds(updated)
    saveSavedAds(updated)

    setSaveMessage('Ad concept saved!')
    setTimeout(() => setSaveMessage(''), 3000)
  }, [adConcept, formData, savedAds])

  const handleNewBrief = useCallback(() => {
    setFormData({
      productName: '',
      productDescription: '',
      targetAudience: '',
      platform: '',
      adStyle: '',
      duration: '',
      additionalNotes: '',
    })
    setAdConcept(null)
    setError(null)
    setValidationErrors({})
    setShowSample(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleDeleteAd = useCallback((id: string) => {
    const updated = savedAds.filter(a => a.id !== id)
    setSavedAds(updated)
    saveSavedAds(updated)
    if (expandedAdId === id) setExpandedAdId(null)
  }, [savedAds, expandedAdId])

  // Filtered and sorted history
  const filteredAds = useMemo(() => {
    return savedAds
      .filter(ad => {
        if (!historySearch.trim()) return true
        const q = historySearch.toLowerCase()
        return (
          (ad.adTitle ?? '').toLowerCase().includes(q) ||
          (ad.productName ?? '').toLowerCase().includes(q) ||
          (ad.platform ?? '').toLowerCase().includes(q) ||
          (ad.conceptSummary ?? '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (historySort === 'platform') return (a.platform ?? '').localeCompare(b.platform ?? '')
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [savedAds, historySearch, historySort])

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen bg-background text-foreground font-sans" >
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <FiFilm className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.01em' }}>AdVision AI</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Sample Data Toggle */}
              <div className="flex items-center gap-2">
                <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground hidden sm:inline">Sample Data</Label>
                <Switch
                  id="sample-toggle"
                  checked={showSample}
                  onCheckedChange={setShowSample}
                />
              </div>

              <div className="flex bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'create' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Create
                </button>
                <button
                  onClick={() => setActiveTab('myads')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'myads' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  My Ads
                  {savedAds.length > 0 && (
                    <span className="ml-1.5 text-xs opacity-75">({savedAds.length})</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* =================== CREATE VIEW =================== */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              {/* Hero Section */}
              {!adConcept && !loading && (
                <div className="text-center py-6">
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3" style={{ letterSpacing: '-0.02em' }}>
                    Generate Video Ad Concepts in Seconds
                  </h1>
                  <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
                    AI-powered creative director that crafts production-ready video advertisement scripts, storyboards, and strategies
                  </p>
                </div>
              )}

              {/* Ad Brief Form */}
              <Card className="bg-card border-border shadow-xl shadow-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FiFileText className="w-5 h-5 text-primary" />
                    Ad Brief
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Product Name */}
                  <div>
                    <Label htmlFor="productName" className="text-sm font-medium text-foreground mb-1.5 block">
                      Product/Brand Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, productName: e.target.value }))
                        setValidationErrors(prev => ({ ...prev, productName: false }))
                      }}
                      placeholder="e.g., Nike Air Max, Spotify Premium"
                      className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${validationErrors.productName ? 'border-destructive ring-1 ring-destructive' : ''}`}
                      disabled={loading}
                    />
                    {validationErrors.productName && (
                      <p className="text-xs text-destructive mt-1">Product name is required</p>
                    )}
                  </div>

                  {/* Product Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="productDescription" className="text-sm font-medium text-foreground">
                        Product Description <span className="text-destructive">*</span>
                      </Label>
                      <span className={`text-xs ${formData.productDescription.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {formData.productDescription.length}/500
                      </span>
                    </div>
                    <Textarea
                      id="productDescription"
                      value={formData.productDescription}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setFormData(prev => ({ ...prev, productDescription: e.target.value }))
                          setValidationErrors(prev => ({ ...prev, productDescription: false }))
                        }
                      }}
                      placeholder="Describe your product, its key features, and unique selling points..."
                      className={`min-h-[100px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none ${validationErrors.productDescription ? 'border-destructive ring-1 ring-destructive' : ''}`}
                      disabled={loading}
                    />
                    {validationErrors.productDescription && (
                      <p className="text-xs text-destructive mt-1">Product description is required</p>
                    )}
                  </div>

                  {/* Target Audience */}
                  <div>
                    <Label htmlFor="targetAudience" className="text-sm font-medium text-foreground mb-1.5 block">
                      Target Audience <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, targetAudience: e.target.value }))
                        setValidationErrors(prev => ({ ...prev, targetAudience: false }))
                      }}
                      placeholder="e.g., Gen Z fitness enthusiasts, 18-25, urban"
                      className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${validationErrors.targetAudience ? 'border-destructive ring-1 ring-destructive' : ''}`}
                      disabled={loading}
                    />
                    {validationErrors.targetAudience && (
                      <p className="text-xs text-destructive mt-1">Target audience is required</p>
                    )}
                  </div>

                  {/* Platform */}
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Platform <span className="text-destructive">*</span>
                    </Label>
                    <PlatformSelector
                      selected={formData.platform}
                      onSelect={(p) => {
                        setFormData(prev => ({ ...prev, platform: p }))
                        setValidationErrors(prev => ({ ...prev, platform: false }))
                      }}
                    />
                    {validationErrors.platform && (
                      <p className="text-xs text-destructive mt-1">Please select a platform</p>
                    )}
                  </div>

                  {/* Ad Style */}
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Ad Style <span className="text-destructive">*</span>
                    </Label>
                    <StyleSelector
                      selected={formData.adStyle}
                      onSelect={(s) => {
                        setFormData(prev => ({ ...prev, adStyle: s }))
                        setValidationErrors(prev => ({ ...prev, adStyle: false }))
                      }}
                    />
                    {validationErrors.adStyle && (
                      <p className="text-xs text-destructive mt-1">Please select an ad style</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">
                      Ad Duration <span className="text-destructive">*</span>
                    </Label>
                    <DurationSelector
                      selected={formData.duration}
                      onSelect={(d) => {
                        setFormData(prev => ({ ...prev, duration: d }))
                        setValidationErrors(prev => ({ ...prev, duration: false }))
                      }}
                    />
                    {validationErrors.duration && (
                      <p className="text-xs text-destructive mt-1">Please select a duration</p>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="additionalNotes" className="text-sm font-medium text-foreground">
                        Additional Notes <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <span className={`text-xs ${formData.additionalNotes.length > 270 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {formData.additionalNotes.length}/300
                      </span>
                    </div>
                    <Textarea
                      id="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={(e) => {
                        if (e.target.value.length <= 300) {
                          setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))
                        }
                      }}
                      placeholder="Any specific requirements, brand guidelines, tone preferences..."
                      className="min-h-[80px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
                      disabled={loading}
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={loading || !isFormValid}
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200 text-base py-5 px-8"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <FiActivity className="w-5 h-5 mr-2 animate-spin" />Generating Ad Concept...
                      </>
                    ) : (
                      <>
                        <FiZap className="w-5 h-5 mr-2" />Generate Ad Concept
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Error Banner */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <FiAlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive font-medium">Error</p>
                    <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGenerate}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <FiRefreshCw className="w-4 h-4 mr-1" />Retry
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {loading && <SkeletonLoader />}

              {/* Generated Ad Concept */}
              {adConcept && !loading && (
                <div ref={resultRef}>
                  <AdConceptDisplay
                    data={adConcept}
                    onSave={handleSaveAd}
                    onNewBrief={handleNewBrief}
                    saveMessage={saveMessage}
                  />
                </div>
              )}
            </div>
          )}

          {/* =================== MY ADS VIEW =================== */}
          {activeTab === 'myads' && (
            <div className="space-y-6">
              {savedAds.length > 0 ? (
                <>
                  {/* Search & Sort */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        placeholder="Search by product name or platform..."
                        className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="flex bg-secondary rounded-lg p-1 shrink-0">
                      <button
                        onClick={() => setHistorySort('date')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${historySort === 'date' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <FiClock className="inline w-3 h-3 mr-1" />By Date
                      </button>
                      <button
                        onClick={() => setHistorySort('platform')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${historySort === 'platform' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <FiMonitor className="inline w-3 h-3 mr-1" />By Platform
                      </button>
                    </div>
                  </div>

                  {/* Saved Ad Cards */}
                  <div className="space-y-3">
                    {filteredAds.length === 0 ? (
                      <div className="text-center py-12">
                        <FiSearch className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No ads match your search.</p>
                      </div>
                    ) : (
                      filteredAds.map((ad) => (
                        <SavedAdCard
                          key={ad.id}
                          ad={ad}
                          expanded={expandedAdId === ad.id}
                          onExpand={() => setExpandedAdId(expandedAdId === ad.id ? null : ad.id)}
                          onDelete={() => handleDeleteAd(ad.id)}
                        />
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary border border-border flex items-center justify-center">
                    <FiFilm className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No ad concepts yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Create your first video ad concept and it will appear here for future reference.
                  </p>
                  <Button onClick={() => setActiveTab('create')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <FiZap className="w-4 h-4 mr-2" />Create Your First Ad
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Agent Info Footer */}
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground text-sm">Powered by</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeAgentId === AGENT_ID ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground/40'}`} />
                <span>Video Ad Generator Agent</span>
                <span className="text-muted-foreground/40">|</span>
                <span className="opacity-60">generates production-ready video ad concepts</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
