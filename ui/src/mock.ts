import type { Alert } from './types'

export const ALERTS: Alert[] = [
  {
    uuid: '1111-1111-1111-1111',
    date: '2024-01-01:23:59:59',
    total: 3000,
    missing: [
      {uuid: '2222-2222-2222-2221', firstname: 'Francis', lastname: 'Chartrand'},
      {uuid: '2222-2222-2222-2222', firstname: 'Francis 1', lastname: 'Chartrand'},
      {uuid: '2222-2222-2222-2223', firstname: 'Francis 2', lastname: 'Chartrand'},
      {uuid: '2222-2222-2222-2224', firstname: 'Francis 3', lastname: 'Chartrand'},
      {uuid: '2222-2222-2222-2225', firstname: 'Francis 4', lastname: 'Chartrand'},
    ],
    safe: [
      {uuid: '3333-3333-3333-3331', firstname: 'Charles', lastname: 'Langlois'},
      {uuid: '3333-3333-3333-3332', firstname: 'Charles 1', lastname: 'Langlois'},
      {uuid: '3333-3333-3333-3333', firstname: 'Charles 2', lastname: 'Langlois'},
      {uuid: '3333-3333-3333-3334', firstname: 'Charles 3', lastname: 'Langlois'},
      {uuid: '3333-3333-3333-3335', firstname: 'Charles 4', lastname: 'Langlois'},
    ],
    not_safe: [
      {uuid: '4444-4444-4444-4441', firstname: 'Pascal', lastname: 'Cadotte'},
      {uuid: '4444-4444-4444-4442', firstname: 'Pascal 1', lastname: 'Cadotte'},
      {uuid: '4444-4444-4444-4443', firstname: 'Pascal 2', lastname: 'Cadotte'},
      {uuid: '4444-4444-4444-4444', firstname: 'Pascal 3', lastname: 'Cadotte'},
      {uuid: '4444-4444-4444-4445', firstname: 'Pascal 4', lastname: 'Cadotte'},
    ],
  }
]
