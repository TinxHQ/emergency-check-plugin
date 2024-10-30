export type AlertUser = {
  uuid: string;
  firstname: string  | null;
  lastname: string | null;
}

export type Alert = {
  uuid: string;
  date: string;
  total: number;
  missing: AlertUser[];
  safe: AlertUser[];
  not_safe: AlertUser[];
}
