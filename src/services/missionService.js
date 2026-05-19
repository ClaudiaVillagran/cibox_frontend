import client from "../api/client";

const unwrap = (res) => res.data?.data ?? res.data;

export const getMissions = async () => {
  const res = await client.get("/missions");
  return unwrap(res);
};

export const verifyMission = async (key) => {
  const res = await client.post(`/missions/${key}/verify`);
  return res.data; // { success, data: { completed }, message }
};

export const claimMissionReward = async (key) => {
  const res = await client.post(`/missions/${key}/claim`);
  return res.data; // { success, data: { reward_code, expires_at }, message }
};