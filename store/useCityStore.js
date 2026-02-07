import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clampArray } from "../lib/utils";

const initialState = {
  rawFeedback: [],
  clusters: [],
  selectedClusterId: null,
  problemBrief: null,
  solutionPlan: null,
  feasibilityPack: null,
  policyMemo: null,
  solutionsApproved: false,
  feasibilityApproved: false,
  chatLog: [],
  hasHydrated: false,
};

export const useCityStore = create(
  persist(
    (set) => ({
      ...initialState,
      setHydrated: () => set({ hasHydrated: true }),
      addFeedback: (item) =>
        set((state) => ({
          rawFeedback: clampArray([...state.rawFeedback, item], 240),
        })),
      setClusters: (clusters) => set({ clusters }),
      selectCluster: (id) =>
        set({
          selectedClusterId: id,
          problemBrief: null,
          solutionPlan: null,
          feasibilityPack: null,
          policyMemo: null,
          solutionsApproved: false,
          feasibilityApproved: false,
          chatLog: [],
        }),
      setProblemBrief: (brief) => set({ problemBrief: brief }),
      setSolutionPlan: (plan) => set({ solutionPlan: plan }),
      setFeasibilityPack: (pack) => set({ feasibilityPack: pack }),
      setPolicyMemo: (memo) => set({ policyMemo: memo }),
      setSolutionsApproved: (approved) => set({ solutionsApproved: approved }),
      setFeasibilityApproved: (approved) => set({ feasibilityApproved: approved }),
      addChatMessage: (message) => set((state) => ({ chatLog: [...state.chatLog, message] })),
      resetAll: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: "adaptive-city-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : undefined)),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
      },
    }
  )
);
