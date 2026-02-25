'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  FiCpu, FiSearch, FiZap, FiFileText, FiGrid, FiTarget, FiAward,
  FiCheckCircle, FiTrendingUp, FiLayers, FiAlertTriangle, FiMap,
  FiArrowRight, FiSave, FiRefreshCw, FiTrash2, FiCompass,
  FiAlertCircle, FiChevronRight, FiClock, FiExternalLink,
  FiActivity, FiStar, FiBookOpen
} from 'react-icons/fi'

// ============================================================
// Constants
// ============================================================

const MANAGER_AGENT_ID = '699e8a2fa3d2e42e6173b394'

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

const FOCUS_TAGS = [
  'AI/ML', 'IoT', 'Blockchain', 'DevTools', 'Cloud',
  'Security', 'Web3', 'AR/VR', 'Edge Computing', 'Quantum', 'Robotics'
]

const STORAGE_KEY = 'technova_history'

// ============================================================
// Types
// ============================================================

interface ExistingSolution {
  name?: string
  description?: string
  url?: string
  category?: string
}

interface EmergingTrend {
  trend?: string
  evidence?: string
  impact_level?: string
}

interface IdentifiedGap {
  gap?: string
  opportunity?: string
  difficulty?: string
}

interface TechStackItem {
  technology?: string
  purpose?: string
  justification?: string
  category?: string
}

interface KeyChallenge {
  challenge?: string
  severity?: string
  mitigation?: string
}

interface RoadmapPhase {
  phase?: string
  title?: string
  duration?: string
  milestones?: string[]
  deliverables?: string[]
}

interface InnovationReportData {
  executive_summary?: string
  domain_analyzed?: string
  focus_areas?: string[]
  existing_solutions?: ExistingSolution[]
  emerging_trends?: EmergingTrend[]
  identified_gaps?: IdentifiedGap[]
  novelty_score?: number
  novelty_reasoning?: string
  feasibility_score?: number
  feasibility_reasoning?: string
  tech_stack?: TechStackItem[]
  key_challenges?: KeyChallenge[]
  implementation_roadmap?: RoadmapPhase[]
  overall_assessment?: string
  market_opportunity?: string
  next_steps?: string[]
}

interface SavedReport {
  id: string
  domain: string
  focusTags: string[]
  noveltyScore: number
  feasibilityScore: number
  executiveSummary: string
  fullReport: InnovationReportData
  createdAt: string
}

// ============================================================
// Sample Data
// ============================================================

const SAMPLE_REPORT: InnovationReportData = {
  executive_summary: "The AI-powered code review space is rapidly evolving with significant opportunities in automated security analysis and context-aware suggestions. While several established players exist, there are notable gaps in real-time collaborative review and cross-language pattern detection that present compelling market opportunities.",
  domain_analyzed: "AI-Powered Code Review Tools",
  focus_areas: ["AI/ML", "DevTools", "Security"],
  existing_solutions: [
    { name: "CodeRabbit", description: "AI-first code review tool that provides contextual suggestions and automated reviews for pull requests across multiple languages.", url: "https://coderabbit.ai", category: "AI Review" },
    { name: "Snyk Code", description: "Real-time static analysis powered by machine learning, focusing on security vulnerabilities in code.", url: "https://snyk.io", category: "Security" },
    { name: "Codacy", description: "Automated code quality and security platform with multi-language support and CI/CD integration.", url: "https://codacy.com", category: "Quality" },
    { name: "DeepSource", description: "Static analysis platform with AI-powered auto-fix suggestions and continuous monitoring.", url: "https://deepsource.io", category: "Analysis" }
  ],
  emerging_trends: [
    { trend: "LLM-Powered Contextual Reviews", evidence: "Major players integrating GPT-4 and Claude for nuanced code understanding beyond pattern matching.", impact_level: "High" },
    { trend: "Shift-Left Security", evidence: "Growing adoption of pre-commit and IDE-integrated security scanning, reducing vulnerabilities by 60%.", impact_level: "High" },
    { trend: "Real-time Collaborative AI Review", evidence: "Early-stage startups exploring pair-programming-style AI review during coding, not just at PR time.", impact_level: "Medium" }
  ],
  identified_gaps: [
    { gap: "Cross-language pattern detection", opportunity: "Build a unified analysis engine that identifies anti-patterns across polyglot codebases", difficulty: "Hard" },
    { gap: "Team-aware code style enforcement", opportunity: "Learn team-specific patterns and enforce consistency beyond linting rules", difficulty: "Medium" },
    { gap: "Impact-based review prioritization", opportunity: "Prioritize review comments by blast radius and business criticality", difficulty: "Easy" }
  ],
  novelty_score: 7,
  novelty_reasoning: "While AI code review exists, the combination of cross-language pattern detection with team-aware style learning represents a genuinely novel approach. The impact-based prioritization adds unique value not seen in current tools.",
  feasibility_score: 8,
  feasibility_reasoning: "Strong technical feasibility leveraging existing LLM infrastructure and AST parsing libraries. The main challenges are training data acquisition and real-time performance at scale, both of which have proven solutions.",
  tech_stack: [
    { technology: "Tree-sitter", purpose: "Multi-language AST parsing", justification: "Industry-standard incremental parser supporting 100+ languages with consistent API", category: "Core" },
    { technology: "FastAPI + Python", purpose: "Backend analysis service", justification: "Optimal for ML model serving with async support and strong ecosystem", category: "Backend" },
    { technology: "Claude/GPT-4 API", purpose: "Contextual review generation", justification: "Best-in-class code understanding with instruction following for structured output", category: "AI" },
    { technology: "Redis + PostgreSQL", purpose: "Caching and persistence", justification: "Redis for real-time analysis caching, PostgreSQL for historical pattern storage", category: "Data" }
  ],
  key_challenges: [
    { challenge: "Latency for real-time reviews", severity: "High", mitigation: "Implement incremental analysis with pre-computed caches and streaming responses" },
    { challenge: "Training data quality", severity: "Medium", mitigation: "Partner with open-source projects for curated review datasets with expert annotations" },
    { challenge: "False positive rate", severity: "High", mitigation: "Implement confidence scoring with human-in-the-loop feedback mechanism to improve over time" }
  ],
  implementation_roadmap: [
    { phase: "Phase 1", title: "Foundation", duration: "2-3 months", milestones: ["AST parser integration", "Basic pattern detection", "API scaffolding"], deliverables: ["MVP CLI tool", "Core analysis engine", "API documentation"] },
    { phase: "Phase 2", title: "AI Integration", duration: "2-3 months", milestones: ["LLM integration", "Contextual review generation", "GitHub/GitLab webhooks"], deliverables: ["PR bot", "Review dashboard", "Team onboarding flow"] },
    { phase: "Phase 3", title: "Intelligence Layer", duration: "3-4 months", milestones: ["Cross-language patterns", "Team style learning", "Impact scoring"], deliverables: ["Full platform launch", "Enterprise features", "Analytics dashboard"] }
  ],
  overall_assessment: "This is a strong opportunity with a clear path to market. The AI code review space is growing rapidly, and the proposed differentiation through cross-language analysis and team-aware intelligence fills genuine gaps. Recommend proceeding with Phase 1 immediately.",
  market_opportunity: "The global code review tools market is projected to reach $1.2B by 2027, with AI-assisted tools capturing an increasing share. Developer tool spending per engineer averages $2,500/year, with security and quality tools seeing 35% YoY growth.",
  next_steps: [
    "Conduct 10 developer interviews to validate pain points around cross-language reviews",
    "Build proof-of-concept with Tree-sitter for 3 languages (Python, TypeScript, Go)",
    "Set up LLM evaluation pipeline comparing review quality across models",
    "Create landing page and waitlist to gauge market interest",
    "Identify 3-5 open source projects for pilot partnerships"
  ]
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

function getScoreColor(score: number): string {
  if (score >= 9) return 'hsl(135 94% 60%)'
  if (score >= 7) return 'hsl(191 97% 70%)'
  if (score >= 4) return 'hsl(31 100% 65%)'
  return 'hsl(0 100% 62%)'
}

function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excellent'
  if (score >= 7) return 'Strong'
  if (score >= 4) return 'Moderate'
  return 'Low'
}

function getDifficultyColor(difficulty: string): string {
  const d = (difficulty ?? '').toLowerCase()
  if (d === 'easy') return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (d === 'medium') return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  if (d === 'hard') return 'bg-red-500/20 text-red-400 border-red-500/30'
  return 'bg-muted text-muted-foreground border-border'
}

function getSeverityColor(severity: string): string {
  const s = (severity ?? '').toLowerCase()
  if (s === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30'
  if (s === 'medium') return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  if (s === 'low') return 'bg-green-500/20 text-green-400 border-green-500/30'
  return 'bg-muted text-muted-foreground border-border'
}

function getImpactColor(impact: string): string {
  const i = (impact ?? '').toLowerCase()
  if (i === 'high') return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  if (i === 'medium') return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  if (i === 'low') return 'bg-muted text-muted-foreground border-border'
  return 'bg-muted text-muted-foreground border-border'
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

function loadHistory(): SavedReport[] {
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

function saveHistory(reports: SavedReport[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  } catch {
    // storage full or unavailable
  }
}

// ============================================================
// Sub-Components (defined before default export)
// ============================================================

function ScoreGauge({ score, label, reasoning }: { score: number; label: string; reasoning: string }) {
  const color = getScoreColor(score)
  const percentage = (score / 10) * 100
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(232 16% 28%)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-muted-foreground">/10</span>
        </div>
      </div>
      <div className="text-center">
        <Badge className="mb-2" style={{ backgroundColor: color + '33', color, borderColor: color + '55' }}>{getScoreLabel(score)}</Badge>
        <h4 className="font-semibold text-sm text-foreground mb-1">{label}</h4>
      </div>
      {reasoning && (
        <div className="text-sm text-muted-foreground leading-relaxed">{renderMarkdown(reasoning)}</div>
      )}
    </div>
  )
}

function FocusTagSelector({ selected, onToggle }: { selected: string[]; onToggle: (tag: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FOCUS_TAGS.map((tag) => {
        const isSelected = selected.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25' : 'bg-secondary text-secondary-foreground border-border hover:bg-muted hover:border-muted-foreground/30'}`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FiActivity className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Researching the tech landscape</span>
            <span className="text-sm text-muted-foreground animate-pulse">...</span>
          </div>
          <Skeleton className="h-4 w-3/4 bg-muted" />
          <Skeleton className="h-4 w-1/2 bg-muted" />
          <Skeleton className="h-4 w-5/6 bg-muted" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-1/3 bg-muted" />
            <Skeleton className="h-20 w-full bg-muted" />
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-1/3 bg-muted" />
            <Skeleton className="h-20 w-full bg-muted" />
          </CardContent>
        </Card>
      </div>
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-5 w-1/4 bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Skeleton className="h-24 bg-muted rounded-lg" />
            <Skeleton className="h-24 bg-muted rounded-lg" />
            <Skeleton className="h-24 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RoadmapTimeline({ phases }: { phases: RoadmapPhase[] }) {
  const safePhases = Array.isArray(phases) ? phases : []
  if (safePhases.length === 0) return <p className="text-sm text-muted-foreground">No roadmap data available.</p>

  return (
    <div className="space-y-0">
      {safePhases.map((phase, idx) => {
        const milestones = Array.isArray(phase?.milestones) ? phase.milestones : []
        const deliverables = Array.isArray(phase?.deliverables) ? phase.deliverables : []
        const isLast = idx === safePhases.length - 1

        return (
          <div key={idx} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {idx + 1}
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-border min-h-[2rem]" />}
            </div>
            <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h4 className="font-semibold text-foreground">{phase?.title ?? phase?.phase ?? 'Untitled Phase'}</h4>
                {phase?.duration && (
                  <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                    <FiClock className="w-3 h-3 mr-1" />{phase.duration}
                  </Badge>
                )}
              </div>
              {milestones.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Milestones</span>
                  <ul className="mt-1 space-y-1">
                    {milestones.map((m, mi) => (
                      <li key={mi} className="text-sm text-foreground flex items-start gap-2">
                        <FiCheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {deliverables.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deliverables</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {deliverables.map((d, di) => (
                      <Badge key={di} variant="secondary" className="text-xs bg-secondary text-secondary-foreground border-border">{d}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function InnovationReport({ data, onSave, onRefine, saveMessage }: {
  data: InnovationReportData
  onSave: () => void
  onRefine: () => void
  saveMessage: string
}) {
  const solutions = Array.isArray(data?.existing_solutions) ? data.existing_solutions : []
  const trends = Array.isArray(data?.emerging_trends) ? data.emerging_trends : []
  const gaps = Array.isArray(data?.identified_gaps) ? data.identified_gaps : []
  const techStack = Array.isArray(data?.tech_stack) ? data.tech_stack : []
  const challenges = Array.isArray(data?.key_challenges) ? data.key_challenges : []
  const roadmap = Array.isArray(data?.implementation_roadmap) ? data.implementation_roadmap : []
  const focusAreas = Array.isArray(data?.focus_areas) ? data.focus_areas : []
  const nextSteps = Array.isArray(data?.next_steps) ? data.next_steps : []
  const noveltyScore = typeof data?.novelty_score === 'number' ? data.novelty_score : 0
  const feasibilityScore = typeof data?.feasibility_score === 'number' ? data.feasibility_score : 0

  return (
    <div className="space-y-4">
      {/* Report Header */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-green-400" />
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">{data?.domain_analyzed ?? 'Innovation Report'}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {focusAreas.map((area, i) => (
                  <Badge key={i} className="bg-primary/20 text-primary border-primary/30 text-xs">{area}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: getScoreColor(noveltyScore) }}>{noveltyScore}</div>
                <div className="text-xs text-muted-foreground">Novelty</div>
              </div>
              <Separator orientation="vertical" className="h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: getScoreColor(feasibilityScore) }}>{feasibilityScore}</div>
                <div className="text-xs text-muted-foreground">Feasibility</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onSave} variant="outline" className="bg-secondary border-border text-foreground hover:bg-muted">
              <FiSave className="w-4 h-4 mr-2" />Save Report
            </Button>
            <Button onClick={onRefine} variant="outline" className="bg-secondary border-border text-foreground hover:bg-muted">
              <FiRefreshCw className="w-4 h-4 mr-2" />Refine Idea
            </Button>
            {saveMessage && (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <FiCheckCircle className="w-4 h-4" />{saveMessage}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={['executive-summary', 'scores', 'gaps']} className="space-y-2">

        {/* 1. Executive Summary */}
        <AccordionItem value="executive-summary" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-foreground">
              <FiFileText className="w-5 h-5 text-purple-400" />
              <span className="font-semibold">Executive Summary</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="text-foreground">{renderMarkdown(data?.executive_summary ?? '')}</div>
            {data?.overall_assessment && (
              <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FiStar className="w-4 h-4 text-yellow-400" />Overall Assessment
                </h4>
                <div className="text-foreground">{renderMarkdown(data.overall_assessment)}</div>
              </div>
            )}
            {data?.market_opportunity && (
              <div className="mt-3 p-4 bg-secondary/50 rounded-lg border border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-cyan-400" />Market Opportunity
                </h4>
                <div className="text-foreground">{renderMarkdown(data.market_opportunity)}</div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 2. Existing Solutions */}
        <AccordionItem value="solutions" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-foreground">
              <FiGrid className="w-5 h-5 text-cyan-400" />
              <span className="font-semibold">Existing Solutions</span>
              <Badge variant="secondary" className="bg-secondary text-muted-foreground ml-1">{solutions.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            {solutions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No existing solutions identified.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {solutions.map((sol, i) => (
                  <div key={i} className="p-4 bg-secondary/50 rounded-lg border border-border hover:border-muted-foreground/30 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-foreground">{sol?.name ?? 'Unknown'}</h4>
                      {sol?.category && <Badge variant="outline" className="text-xs border-border text-muted-foreground shrink-0">{sol.category}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{sol?.description ?? ''}</p>
                    {sol?.url && (
                      <a href={sol.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <FiExternalLink className="w-3 h-3" />{sol.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 3. Identified Gaps */}
        <AccordionItem value="gaps" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-foreground">
              <FiTarget className="w-5 h-5 text-pink-400" />
              <span className="font-semibold">Identified Gaps</span>
              <Badge variant="secondary" className="bg-secondary text-muted-foreground ml-1">{gaps.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            {gaps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No gaps identified.</p>
            ) : (
              <div className="space-y-3">
                {gaps.map((gap, i) => (
                  <div key={i} className="p-4 bg-secondary/50 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-foreground">{gap?.gap ?? 'Unknown Gap'}</h4>
                      {gap?.difficulty && (
                        <Badge className={`text-xs border shrink-0 ${getDifficultyColor(gap.difficulty)}`}>{gap.difficulty}</Badge>
                      )}
                    </div>
                    {gap?.opportunity && (
                      <div className="flex items-start gap-2">
                        <FiArrowRight className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">{gap.opportunity}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 4. Novelty Score */}
        <AccordionItem value="scores" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-foreground">
              <FiAward className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Novelty & Feasibility Scores</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScoreGauge score={noveltyScore} label="Novelty Score" reasoning={data?.novelty_reasoning ?? ''} />
              <ScoreGauge score={feasibilityScore} label="Feasibility Score" reasoning={data?.feasibility_reasoning ?? ''} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Emerging Trends */}
        <AccordionItem value="trends" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-foreground">
              <FiTrendingUp className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Emerging Trends</span>
              <Badge variant="secondary" className="bg-secondary text-muted-foreground ml-1">{trends.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            {trends.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trends identified.</p>
            ) : (
              <div className="space-y-3">
                {trends.map((trend, i) => (
                  <div key={i} className="p-4 bg-secondary/50 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-foreground">{trend?.trend ?? 'Unknown Trend'}</h4>
                      {trend?.impact_level && (
                        <Badge className={`text-xs border shrink-0 ${getImpactColor(trend.impact_level)}`}>{trend.impact_level} Impact</Badge>
                      )}
                    </div>
                    {trend?.evidence && <p className="text-sm text-muted-foreground">{trend.evidence}</p>}
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 6. Tech Stack Recommendations */}
        <AccordionItem value="tech-stack" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-foreground">
              <FiLayers className="w-5 h-5 text-orange-400" />
              <span className="font-semibold">Tech Stack Recommendations</span>
              <Badge variant="secondary" className="bg-secondary text-muted-foreground ml-1">{techStack.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            {techStack.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tech stack recommendations.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {techStack.map((tech, i) => (
                  <div key={i} className="p-4 bg-secondary/50 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <FiCpu className="w-4 h-4 text-primary shrink-0" />{tech?.technology ?? 'Unknown'}
                      </h4>
                      {tech?.category && <Badge variant="outline" className="text-xs border-border text-muted-foreground shrink-0">{tech.category}</Badge>}
                    </div>
                    {tech?.purpose && <p className="text-sm text-cyan-400 mb-1">{tech.purpose}</p>}
                    {tech?.justification && <p className="text-sm text-muted-foreground">{tech.justification}</p>}
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 7. Key Challenges */}
        <AccordionItem value="challenges" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-foreground">
              <FiAlertTriangle className="w-5 h-5 text-red-400" />
              <span className="font-semibold">Key Challenges</span>
              <Badge variant="secondary" className="bg-secondary text-muted-foreground ml-1">{challenges.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            {challenges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No challenges identified.</p>
            ) : (
              <div className="space-y-3">
                {challenges.map((ch, i) => (
                  <div key={i} className="p-4 bg-secondary/50 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-foreground">{ch?.challenge ?? 'Unknown Challenge'}</h4>
                      {ch?.severity && (
                        <Badge className={`text-xs border shrink-0 ${getSeverityColor(ch.severity)}`}>{ch.severity}</Badge>
                      )}
                    </div>
                    {ch?.mitigation && (
                      <div className="flex items-start gap-2">
                        <FiCheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground"><strong className="text-foreground">Mitigation:</strong> {ch.mitigation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* 8. Implementation Roadmap */}
        <AccordionItem value="roadmap" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-foreground">
              <FiMap className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">Implementation Roadmap</span>
              <Badge variant="secondary" className="bg-secondary text-muted-foreground ml-1">{roadmap.length} phases</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <RoadmapTimeline phases={roadmap} />
          </AccordionContent>
        </AccordionItem>

        {/* 9. Next Steps */}
        <AccordionItem value="next-steps" className="bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-foreground">
              <FiArrowRight className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Next Steps</span>
              <Badge variant="secondary" className="bg-secondary text-muted-foreground ml-1">{nextSteps.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            {nextSteps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No next steps provided.</p>
            ) : (
              <ol className="space-y-3">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</span>
                    <p className="text-sm text-foreground leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

function HistoryCard({ report, onDelete, onExpand, expanded }: {
  report: SavedReport
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
              <h3 className="font-semibold text-foreground truncate">{report.domain}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {Array.isArray(report.focusTags) && report.focusTags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-secondary text-muted-foreground">{tag}</Badge>
                ))}
                <span className="text-xs text-muted-foreground">
                  <FiClock className="inline w-3 h-3 mr-1" />
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{report.executiveSummary}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: getScoreColor(report.noveltyScore) }}>{report.noveltyScore}</div>
                <div className="text-xs text-muted-foreground">Novelty</div>
              </div>
              <FiChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </button>

        {expanded && (
          <div className="border-t border-border p-5">
            <InnovationReport data={report.fullReport} onSave={() => {}} onRefine={() => {}} saveMessage="" />
            <div className="mt-4 flex justify-end">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Delete this report?</span>
                  <Button size="sm" variant="destructive" onClick={() => { onDelete(); setConfirmDelete(false) }} className="bg-destructive text-white">
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)} className="border-border text-foreground">
                    Cancel
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
  const [activeTab, setActiveTab] = useState<'explore' | 'history'>('explore')

  // Explore state
  const [userInput, setUserInput] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<InnovationReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Sample data toggle
  const [showSample, setShowSample] = useState(false)

  // History state
  const [history, setHistory] = useState<SavedReport[]>([])
  const [historySearch, setHistorySearch] = useState('')
  const [historySort, setHistorySort] = useState<'date' | 'novelty'>('date')
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  // Handle sample data toggle
  useEffect(() => {
    if (showSample) {
      setUserInput('AI-powered code review tools for developer teams')
      setSelectedTags(['AI/ML', 'DevTools', 'Security'])
      setReportData(SAMPLE_REPORT)
      setError(null)
    } else {
      setUserInput('')
      setSelectedTags([])
      setReportData(null)
      setError(null)
    }
  }, [showSample])

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }, [])

  const handleExplore = useCallback(async () => {
    if (!userInput.trim()) return

    setLoading(true)
    setError(null)
    setReportData(null)
    setActiveAgentId(MANAGER_AGENT_ID)

    try {
      const focusTagsStr = selectedTags.length > 0 ? `\n\nFocus areas: ${selectedTags.join(', ')}` : ''
      const message = `${userInput.trim()}${focusTagsStr}`

      const result = await callAIAgent(message, MANAGER_AGENT_ID)

      if (result.success && result.response) {
        let data = result?.response?.result
        // Try to parse if data is a string
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data)
          } catch {
            // If it can't be parsed, wrap it
            data = { executive_summary: data }
          }
        }
        if (data && typeof data === 'object') {
          setReportData(data as InnovationReportData)
          // Auto scroll to report
          setTimeout(() => {
            reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 200)
        } else {
          setError('Received an unexpected response format. Please try again.')
        }
      } else {
        setError(result?.error ?? result?.response?.message ?? 'Failed to generate innovation report. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [userInput, selectedTags])

  const handleSaveReport = useCallback(() => {
    if (!reportData) return

    const saved: SavedReport = {
      id: generateId(),
      domain: reportData?.domain_analyzed ?? userInput.trim().slice(0, 100),
      focusTags: Array.isArray(reportData?.focus_areas) ? reportData.focus_areas : selectedTags,
      noveltyScore: typeof reportData?.novelty_score === 'number' ? reportData.novelty_score : 0,
      feasibilityScore: typeof reportData?.feasibility_score === 'number' ? reportData.feasibility_score : 0,
      executiveSummary: reportData?.executive_summary ?? '',
      fullReport: reportData,
      createdAt: new Date().toISOString(),
    }

    const updated = [saved, ...history]
    setHistory(updated)
    saveHistory(updated)

    setSaveMessage('Report saved successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }, [reportData, userInput, selectedTags, history])

  const handleRefine = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      inputRef.current.focus()
    }
  }, [])

  const handleDeleteHistory = useCallback((id: string) => {
    const updated = history.filter(r => r.id !== id)
    setHistory(updated)
    saveHistory(updated)
    if (expandedHistoryId === id) setExpandedHistoryId(null)
  }, [history, expandedHistoryId])

  // Filtered and sorted history
  const filteredHistory = history
    .filter(r => {
      if (!historySearch.trim()) return true
      const q = historySearch.toLowerCase()
      return (r.domain ?? '').toLowerCase().includes(q) || (r.executiveSummary ?? '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (historySort === 'novelty') return (b.noveltyScore ?? 0) - (a.noveltyScore ?? 0)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen bg-background text-foreground font-sans" >
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <FiCpu className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground" style={{ letterSpacing: '-0.01em' }}>TechNova</span>
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
                  onClick={() => setActiveTab('explore')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'explore' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Explore
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'history' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  History
                  {history.length > 0 && (
                    <span className="ml-1.5 text-xs opacity-75">({history.length})</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* =================== EXPLORE VIEW =================== */}
          {activeTab === 'explore' && (
            <div className="space-y-6">
              {/* Input Section */}
              <Card className="bg-card border-border shadow-xl shadow-primary/5">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <FiBookOpen className="w-5 h-5 text-primary" />
                        Explore Innovation
                      </h2>
                      <span className={`text-xs ${userInput.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {userInput.length}/500
                      </span>
                    </div>
                    <Textarea
                      ref={inputRef}
                      value={userInput}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setUserInput(e.target.value)
                        }
                      }}
                      placeholder="Describe a technical domain to explore or an idea to validate..."
                      className="min-h-[120px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Focus Tags</Label>
                    <FocusTagSelector selected={selectedTags} onToggle={handleTagToggle} />
                  </div>

                  <Button
                    onClick={handleExplore}
                    disabled={loading || !userInput.trim()}
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <FiActivity className="w-4 h-4 mr-2 animate-spin" />Analyzing...
                      </>
                    ) : (
                      <>
                        <FiZap className="w-4 h-4 mr-2" />Explore & Validate
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
                    onClick={handleExplore}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <FiRefreshCw className="w-4 h-4 mr-1" />Retry
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {loading && <SkeletonLoader />}

              {/* Innovation Report */}
              {reportData && !loading && (
                <div ref={reportRef}>
                  <InnovationReport
                    data={reportData}
                    onSave={handleSaveReport}
                    onRefine={handleRefine}
                    saveMessage={saveMessage}
                  />
                </div>
              )}

              {/* Empty State */}
              {!reportData && !loading && !error && !showSample && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary border border-border flex items-center justify-center">
                    <FiCompass className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Explore</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Enter a technical domain or idea above and TechNova will research existing solutions, identify gaps, and validate your concept with a comprehensive innovation report.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* =================== HISTORY VIEW =================== */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {history.length > 0 ? (
                <>
                  {/* Search & Sort */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        placeholder="Search reports..."
                        className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="flex bg-secondary rounded-lg p-1 shrink-0">
                      <button
                        onClick={() => setHistorySort('date')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${historySort === 'date' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <FiClock className="inline w-3 h-3 mr-1" />Latest
                      </button>
                      <button
                        onClick={() => setHistorySort('novelty')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${historySort === 'novelty' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <FiAward className="inline w-3 h-3 mr-1" />Novelty
                      </button>
                    </div>
                  </div>

                  {/* History Cards */}
                  <div className="space-y-3">
                    {filteredHistory.length === 0 ? (
                      <div className="text-center py-12">
                        <FiSearch className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No reports match your search.</p>
                      </div>
                    ) : (
                      filteredHistory.map((report) => (
                        <HistoryCard
                          key={report.id}
                          report={report}
                          expanded={expandedHistoryId === report.id}
                          onExpand={() => setExpandedHistoryId(expandedHistoryId === report.id ? null : report.id)}
                          onDelete={() => handleDeleteHistory(report.id)}
                        />
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary border border-border flex items-center justify-center">
                    <FiCompass className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Start Your First Exploration!</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Saved innovation reports will appear here. Head over to the Explore tab to research a technical domain.
                  </p>
                  <Button onClick={() => setActiveTab('explore')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <FiZap className="w-4 h-4 mr-2" />Go to Explore
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Agent Info Footer */}
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground text-sm">Powered by</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeAgentId === MANAGER_AGENT_ID ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground/40'}`} />
                <span>Tech Innovation Manager</span>
                <span className="text-muted-foreground/40">|</span>
                <span className="opacity-60">coordinates research & validation</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-border hidden sm:block" />
              <div className="flex items-center gap-2 opacity-60">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span>Tech Research Agent</span>
                <span className="text-muted-foreground/40">|</span>
                <span>web research sub-agent</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-border hidden sm:block" />
              <div className="flex items-center gap-2 opacity-60">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span>Idea Validator Agent</span>
                <span className="text-muted-foreground/40">|</span>
                <span>feasibility sub-agent</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
