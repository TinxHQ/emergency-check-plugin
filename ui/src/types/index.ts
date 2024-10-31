export type AlertUser = { [userId: string]: string }

export type Alert = {
  status: string;
  timestamp: number;
  originator: string;
  targeted_users: AlertUser;
  emergency_type: string;
  uuid: string;
  tenant_uuid: string;
}

export type EnhanceAlert = Alert & {
  pending_users: AlertUser[];
  safe_users: AlertUser[];
  not_safe_users: AlertUser[];
}
