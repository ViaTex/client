import { create } from 'zustand'

export type InterviewTab = 'all' | 'upcoming' | 'completed' | 'cancelled'

interface InterviewStoreState {
  search: string
  tab: InterviewTab
  companyFilter: string
  selectedInterviewId: string | null
  setSearch: (value: string) => void
  setTab: (value: InterviewTab) => void
  setCompanyFilter: (value: string) => void
  setSelectedInterviewId: (value: string | null) => void
}

export const useInterviewStore = create<InterviewStoreState>((set) => ({
  search: '',
  tab: 'all',
  companyFilter: '',
  selectedInterviewId: null,
  setSearch: (value) => set({ search: value }),
  setTab: (value) => set({ tab: value }),
  setCompanyFilter: (value) => set({ companyFilter: value }),
  setSelectedInterviewId: (value) => set({ selectedInterviewId: value }),
}))
