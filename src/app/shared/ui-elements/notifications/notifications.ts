export interface Notifications {
  id?: string;
  class: 'success' | 'danger' | 'warning' | 'info';
  msg: string;
  time?: any;
}
