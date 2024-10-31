import { Alert, AlertUser, EnhanceAlert } from "../types";

const getUsersByStatus = (targetedUsers: AlertUser) => Object.keys(targetedUsers).reduce((accumulator: Record<string, any>, uuid: string) => {
  const status = targetedUsers[uuid];
  const key = `${status}_users`;

  if (!accumulator[key]) {
    accumulator[key] = [];
  }
  accumulator[key].push({ uuid, status});
  return accumulator;
}, {});

export const enhanceAlert = (alert: Alert): EnhanceAlert => {
  const usersByStatus = getUsersByStatus(alert.targeted_users);

  return {
    ...alert,
    ...usersByStatus
  }
}
