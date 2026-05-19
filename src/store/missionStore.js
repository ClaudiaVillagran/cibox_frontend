import { create } from "zustand";
import { getMissions, verifyMission, claimMissionReward } from "../services/missionService";

const useMissionStore = create((set, get) => ({
  missions: [],
  stats: { completed: 0, total: 5 },
  loading: false,

  loadMissions: async () => {
    try {
      set({ loading: true });
      const data = await getMissions();
      set({
        missions: data.missions ?? [],
        stats: data.stats ?? { completed: 0, total: 5 },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  verifyMission: async (key) => {
    const result = await verifyMission(key);
    if (result.data?.completed) await get().loadMissions();
    return result;
  },

  claimReward: async (key) => {
    const result = await claimMissionReward(key);
    await get().loadMissions();
    return result;
  },
}));

export default useMissionStore;