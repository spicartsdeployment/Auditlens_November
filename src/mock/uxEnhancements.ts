/** Frontend-only mock records for Remarks.xlsx UX enhancements. */

export const MOCK_LOGIN_LOGS = [
  { id: 1, user_name: 'Priya Sharma', role: 'Admin (CA)', date: '2026-10-30', time: '09:12 AM', status: 'Successful', device: 'Chrome · Windows' },
  { id: 2, user_name: 'Rohan Verma', role: 'Article', date: '2026-10-30', time: '09:18 AM', status: 'Successful', device: 'Chrome · Windows' },
  { id: 3, user_name: 'Sneha Iyer', role: 'Article', date: '2026-10-30', time: '09:21 AM', status: 'Successful', device: 'Edge · Windows' },
  { id: 4, user_name: 'Arjun Mehta', role: 'Super Admin', date: '2026-10-29', time: '06:55 PM', status: 'Successful', device: 'Safari · macOS' },
  { id: 5, user_name: 'Rohan Verma', role: 'Article', date: '2026-10-29', time: '08:41 AM', status: 'Failed', device: 'Chrome · Windows' },
  { id: 6, user_name: 'Rohan Verma', role: 'Article', date: '2026-10-29', time: '08:42 AM', status: 'Successful', device: 'Chrome · Windows' },
  { id: 7, user_name: 'Priya Sharma', role: 'Admin (CA)', date: '2026-10-28', time: '10:04 AM', status: 'Successful', device: 'Chrome · Android' },
  { id: 8, user_name: 'Sneha Iyer', role: 'Article', date: '2026-10-28', time: '09:33 AM', status: 'Successful', device: 'Chrome · Windows' },
]

export const MOCK_RECEIVED_DOCS = [
  { id: 1, name: 'Bank Statement Apr 2026.pdf', client: 'Sunrise Textiles', category: 'Financials', uploaded_at: '2026-06-05', fy: 'FY 2025-26', related: 'Statutory Audit FY 2025-26', verification: 'Verified', task_id: 'w6' },
  { id: 2, name: 'Form 16 FY 2025-26.pdf', client: 'Sunrise Textiles', category: 'TDS', uploaded_at: '2026-06-08', fy: 'FY 2025-26', related: 'TDS 138-TDS — Q4', verification: 'Pending review', task_id: 'w9' },
  { id: 3, name: 'GSTR-3B May Ack.pdf', client: 'Redwood Constructions', category: 'GST', uploaded_at: '2026-06-19', fy: 'FY 2025-26', related: 'GSTR-3B — April 2026', verification: 'Verified', task_id: 'w7' },
  { id: 4, name: 'Purchase Register May.xlsx', client: 'BlueSky Software', category: 'GST', uploaded_at: '2026-06-21', fy: 'FY 2025-26', related: 'GSTR-1 — April 2026', verification: 'Pending review', task_id: 'w2' },
  { id: 5, name: 'Stock Statement Mar 2026.xlsx', client: 'Green Pharma', category: 'Audit', uploaded_at: '2026-06-15', fy: 'FY 2025-26', related: 'Tax Audit — FY 2025-26', verification: 'Missing items', task_id: 'w8' },
]

export const MOCK_SENT_DOCS = [
  { id: 101, name: 'Document Request List.pdf', client: 'Apex Auto Parts', category: 'Legal', sent_at: '2026-06-22', related: 'Bank Statements — FY 2025-26', delivery: 'Demo — queued', task_id: 'w11' },
  { id: 102, name: 'GST Notice Draft Reply.docx', client: 'Sunrise Textiles', category: 'Notices', sent_at: '2026-06-24', related: 'GST SCN — Excess ITC', delivery: 'Demo — marked sent', task_id: 'w1' },
  { id: 103, name: 'TDS Computation Q4.xlsx', client: 'BlueSky Software', category: 'TDS', sent_at: '2026-06-20', related: 'TDS 140-TDS — Q4', delivery: 'Demo — marked sent', task_id: 'w3' },
]

export const MOCK_DOC_TEMPLATES = [
  { id: 't1', name: 'Client Document Request', category: 'Correspondence', description: 'Standard list of documents requested from a client for GST / TDS / audit.' },
  { id: 't2', name: 'Engagement Letter (Draft)', category: 'Audit', description: 'Draft engagement letter for statutory or tax audit. Not a legally approved form.' },
  { id: 't3', name: 'GST Notice Cover Note', category: 'Notices', description: 'Internal cover note summarising a GST notice for client review.' },
  { id: 't4', name: 'TDS Deductee Follow-up', category: 'TDS', description: 'Follow-up letter requesting missing PAN / challan details.' },
]

export const MOCK_CHECKLISTS = [
  {
    id: 'cl1',
    name: 'GST Monthly Filing Pack',
    client: 'Sunrise Textiles',
    related: 'GSTR-1 — April 2026',
    items: [
      { name: 'Sales register', required: true, received: true, ref: 'Purchase Register May.xlsx' },
      { name: 'B2B invoice summary', required: true, received: true, ref: 'GSTR-3B May Ack.pdf' },
      { name: 'B2C invoice summary', required: true, received: false },
      { name: 'E-invoice JSON', required: false, received: false },
      { name: 'HSN summary', required: true, received: false },
    ],
  },
  {
    id: 'cl2',
    name: 'Statutory Audit Kick-off',
    client: 'Green Pharma',
    related: 'Statutory Audit FY 2025-26',
    items: [
      { name: 'Trial balance', required: true, received: true, ref: 'Stock Statement Mar 2026.xlsx' },
      { name: 'Balance sheet', required: true, received: false },
      { name: 'P&L statement', required: true, received: false },
      { name: 'Bank statements (12 months)', required: true, received: true, ref: 'Bank Statement Apr 2026.pdf' },
      { name: 'Fixed asset register', required: true, received: false },
      { name: 'Related party list', required: false, received: false },
    ],
  },
]
