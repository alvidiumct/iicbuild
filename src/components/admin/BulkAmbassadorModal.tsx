import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  Trash2,
  Key,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  RefreshCw,
  Info,
} from 'lucide-react';

interface BulkRow {
  id: string;
  fullName: string;
  email: string;
  password: string;
  studentId: string;
  department: string;
  batch: string;
  phone: string;
  showPassword?: boolean;
}

interface BulkAmbassadorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEPARTMENTS = [
  'Software Engineering (SWE)',
  'Computer Science & Engineering (CSE)',
  'Multimedia & Creative Technology (MCT)',
  'Electrical & Electronic Engineering (EEE)',
  'Information Technology & Management (ITM)',
  'Textile Engineering (TE)',
  'Business Administration (BBA)',
  'Civil Engineering (CE)',
];

export const BulkAmbassadorModal: React.FC<BulkAmbassadorModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, bulkCreateAmbassadors, setSelectedAmbassadorId, setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'grid' | 'paste'>('grid');

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createBlankRow = (index = 1): BulkRow => ({
    id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    fullName: '',
    email: '',
    password: generateSecurePassword(),
    studentId: '',
    department: 'Software Engineering (SWE)',
    batch: '61st Batch',
    phone: '',
    showPassword: false,
  });

  const [rows, setRows] = useState<BulkRow[]>([
    {
      id: 'row-1',
      fullName: '',
      email: '',
      password: generateSecurePassword(),
      studentId: '',
      department: 'Software Engineering (SWE)',
      batch: '61st Batch',
      phone: '',
      showPassword: false,
    },
    {
      id: 'row-2',
      fullName: '',
      email: '',
      password: generateSecurePassword(),
      studentId: '',
      department: 'Computer Science & Engineering (CSE)',
      batch: '61st Batch',
      phone: '',
      showPassword: false,
    },
    {
      id: 'row-3',
      fullName: '',
      email: '',
      password: generateSecurePassword(),
      studentId: '',
      department: 'Multimedia & Creative Technology (MCT)',
      batch: '61st Batch',
      phone: '',
      showPassword: false,
    },
  ]);

  // Paste / Raw text state
  const [pastedText, setPastedText] = useState('');
  const [pasteError, setPasteError] = useState('');

  // Post-Creation Success State
  const [createdSummary, setCreatedSummary] = useState<Array<{
    userId: string;
    ambassadorId: string;
    fullName: string;
    email: string;
    password: string;
    department: string;
    studentId: string;
    phone: string;
  }> | null>(null);

  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Row update helper
  const handleUpdateRow = (id: string, field: keyof BulkRow, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Add single row
  const handleAddRow = () => {
    setRows((prev) => [...prev, createBlankRow(prev.length + 1)]);
  };

  // Add 5 rows
  const handleAdd5Rows = () => {
    const newRows: BulkRow[] = [];
    for (let i = 0; i < 5; i++) {
      newRows.push(createBlankRow(rows.length + i + 1));
    }
    setRows((prev) => [...prev, ...newRows]);
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    if (rows.length === 1) {
      setRows([createBlankRow()]);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Regenerate all passwords
  const handleRegenerateAllPasswords = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        password: generateSecurePassword(),
      }))
    );
  };

  // Set default department for all rows
  const handleApplyDepartmentToAll = (dept: string) => {
    if (!dept) return;
    setRows((prev) => prev.map((r) => ({ ...r, department: dept })));
  };

  // Clear blank rows
  const handleClearEmptyRows = () => {
    const nonEmpty = rows.filter((r) => r.fullName.trim() || r.email.trim());
    if (nonEmpty.length === 0) {
      setRows([createBlankRow()]);
    } else {
      setRows(nonEmpty);
    }
  };

  // Validation
  const existingEmails = new Set(allUsers.map((u) => u.email.toLowerCase()));
  const tableEmailCounts: Record<string, number> = {};
  rows.forEach((r) => {
    const e = r.email.trim().toLowerCase();
    if (e) {
      tableEmailCounts[e] = (tableEmailCounts[e] || 0) + 1;
    }
  });

  const getRowValidation = (r: BulkRow) => {
    const nameValid = r.fullName.trim().length > 0;
    const emailTrimmed = r.email.trim().toLowerCase();
    const emailValid = emailTrimmed.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
    const isDuplicateInTable = emailTrimmed ? tableEmailCounts[emailTrimmed] > 1 : false;
    const isAlreadyRegistered = emailTrimmed ? existingEmails.has(emailTrimmed) : false;
    const passwordValid = (r.password || '').trim().length >= 6;

    const isValid = nameValid && emailValid && !isDuplicateInTable && !isAlreadyRegistered && passwordValid;
    const isBlank = !r.fullName.trim() && !r.email.trim();

    return {
      isValid,
      isBlank,
      nameValid,
      emailValid,
      isDuplicateInTable,
      isAlreadyRegistered,
      passwordValid,
    };
  };

  const validRows = rows.filter((r) => getRowValidation(r).isValid);
  const invalidRowsCount = rows.filter((r) => !getRowValidation(r).isBlank && !getRowValidation(r).isValid).length;

  // Handle Parse from Raw Text / Excel
  const handleParsePastedText = () => {
    setPasteError('');
    if (!pastedText.trim()) {
      setPasteError('Please paste some data from Excel, Google Sheets, or CSV.');
      return;
    }

    const lines = pastedText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setPasteError('No valid lines found.');
      return;
    }

    const parsed: BulkRow[] = [];

    // Check if line 1 is a header
    const firstLineLower = lines[0].toLowerCase();
    const hasHeader =
      firstLineLower.includes('name') ||
      firstLineLower.includes('email') ||
      firstLineLower.includes('student') ||
      firstLineLower.includes('department');

    const dataLines = hasHeader ? lines.slice(1) : lines;

    dataLines.forEach((line, idx) => {
      // detect delimiter: tab, comma, or semicolon
      let delimiter = '\t';
      if (line.includes('\t')) delimiter = '\t';
      else if (line.includes(',')) delimiter = ',';
      else if (line.includes(';')) delimiter = ';';

      const parts = line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 2) {
        const name = parts[0] || '';
        const email = parts[1] || '';
        const pass = parts[2] && parts[2].length >= 6 ? parts[2] : generateSecurePassword();
        const studentId = parts[3] || '';
        const dept = parts[4] || 'Software Engineering (SWE)';
        const phone = parts[5] || '';
        const batch = parts[6] || '61st Batch';

        parsed.push({
          id: `pasted-${Date.now()}-${idx}`,
          fullName: name,
          email,
          password: pass,
          studentId,
          department: dept,
          phone,
          batch,
          showPassword: false,
        });
      }
    });

    if (parsed.length === 0) {
      setPasteError('Could not parse any rows. Expected at least Name and Email columns separated by Tab or Comma.');
      return;
    }

    setRows(parsed);
    setActiveTab('grid');
    setPastedText('');
  };

  // Submit bulk creation
  const handleSubmitBulk = () => {
    if (validRows.length === 0) {
      alert('No valid rows found. Please fill in full name and valid university email for at least one ambassador.');
      return;
    }

    const result = bulkCreateAmbassadors(
      validRows.map((r) => ({
        fullName: r.fullName.trim(),
        email: r.email.trim(),
        password: r.password.trim(),
        studentId: r.studentId.trim() || undefined,
        department: r.department,
        phone: r.phone.trim() || undefined,
        batch: r.batch.trim() || undefined,
      }))
    );

    setCreatedSummary(result.created);
  };

  // Export CSV
  const handleDownloadCSV = () => {
    if (!createdSummary) return;

    const headers = ['Ambassador ID', 'Full Name', 'Email', 'Password', 'Department', 'Student ID', 'Phone'];
    const csvRows = [headers.join(',')];

    createdSummary.forEach((c) => {
      csvRows.push(
        [
          `"${c.ambassadorId}"`,
          `"${c.fullName.replace(/"/g, '""')}"`,
          `"${c.email}"`,
          `"${c.password}"`,
          `"${c.department}"`,
          `"${c.studentId}"`,
          `"${c.phone}"`,
        ].join(',')
      );
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `iic_ambassadors_credentials_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy All Credentials to Clipboard
  const handleCopyAllCredentials = () => {
    if (!createdSummary) return;

    const text = createdSummary
      .map(
        (c, idx) =>
          `${idx + 1}. ${c.fullName}\n   ID: ${c.ambassadorId}\n   Email: ${c.email}\n   Password: ${c.password}\n   Department: ${c.department} | Student ID: ${c.studentId}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Copy single password
  const handleCopySingle = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRowId(id);
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#214FA2]/10 text-[#214FA2] flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Bulk Ambassador Onboarding
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#214FA2] text-white rounded-full">
                  Table & Spreadsheet Format
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Provision multiple student ambassadors at once with email, secure password, and cohort credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* POST-CREATION SUMMARY SCREEN */}
        {createdSummary ? (
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-emerald-900">
                  Successfully Enrolled {createdSummary.length} Student Ambassador{createdSummary.length > 1 ? 's' : ''}!
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  All accounts and ambassador profiles have been created. Each ambassador can now sign in using their university email and assigned password.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAllCredentials}
                  className="px-3 py-1.5 text-xs font-semibold bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100/60 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Copied All!' : 'Copy All Credentials'}</span>
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Credential Records Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Provisioned Credentials Summary ({createdSummary.length})</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Copy passwords now or download CSV for your records
                </span>
              </div>
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 text-xs">
                {createdSummary.map((item, idx) => (
                  <div key={item.userId} className="p-3 hover:bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{item.fullName}</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-[#214FA2] border border-blue-200">
                            {item.ambassadorId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{item.email}</span>
                          <span>·</span>
                          <span>{item.department}</span>
                          <span>·</span>
                          <span className="font-mono">ID: {item.studentId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800 flex items-center gap-2">
                        <Key className="w-3 h-3 text-slate-400" />
                        <span>{item.password}</span>
                      </div>
                      <button
                        onClick={() => handleCopySingle(item.userId, item.password)}
                        className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded transition-colors"
                        title="Copy password"
                      >
                        {copiedRowId === item.userId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setCreatedSummary(null);
                  setRows([createBlankRow()]);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard More Ambassadors</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveView('admin-ambassadors');
                  }}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors shadow-2xs"
                >
                  Go to Ambassador Cohort Directory
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN BULK TABLE EDITOR */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Mode Tabs & Global Toolbar */}
            <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-lg text-xs">
                <button
                  onClick={() => setActiveTab('grid')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'grid'
                      ? 'bg-white text-[#214FA2] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Table Grid ({rows.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === 'paste'
                      ? 'bg-white text-[#214FA2] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Paste from Excel / CSV</span>
                </button>
              </div>

              {/* Grid Tools */}
              {activeTab === 'grid' && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#214FA2]" />
                    <span>Add Row</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAdd5Rows}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#214FA2]" />
                    <span>+5 Rows</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRegenerateAllPasswords}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                    title="Generate fresh random passwords for all rows"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>Randomize Passwords</span>
                  </button>

                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium">Batch Dept:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleApplyDepartmentToAll(e.target.value);
                      }}
                      defaultValue=""
                      className="text-[11px] py-1 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
                    >
                      <option value="" disabled>
                        Apply to all...
                      </option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearEmptyRows}
                    className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
                  >
                    Clear Blanks
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: INTERACTIVE TABLE GRID */}
            {activeTab === 'grid' && (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-x-auto overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-semibold text-[10px] sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-10 text-center">#</th>
                        <th className="p-2.5 min-w-[170px]">Full Name *</th>
                        <th className="p-2.5 min-w-[210px]">University Email *</th>
                        <th className="p-2.5 min-w-[180px]">Password *</th>
                        <th className="p-2.5 min-w-[120px]">Student ID</th>
                        <th className="p-2.5 min-w-[190px]">Department</th>
                        <th className="p-2.5 min-w-[110px]">Batch</th>
                        <th className="p-2.5 min-w-[130px]">Phone</th>
                        <th className="p-2.5 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 bg-white">
                      {rows.map((row, idx) => {
                        const val = getRowValidation(row);
                        const hasError = !val.isBlank && !val.isValid;

                        return (
                          <tr
                            key={row.id}
                            className={`transition-colors ${
                              hasError ? 'bg-amber-50/40' : val.isValid ? 'hover:bg-slate-50/60' : 'bg-slate-50/20'
                            }`}
                          >
                            {/* Row indicator & status */}
                            <td className="p-2 text-center font-mono text-slate-400">
                              <div className="flex items-center justify-center gap-1">
                                <span>{idx + 1}</span>
                                {val.isValid ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Valid entry" />
                                ) : hasError ? (
                                  <span title="Missing required fields or duplicate email">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                  </span>
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" title="Incomplete" />
                                )}
                              </div>
                            </td>

                            {/* Full Name */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.fullName}
                                onChange={(e) => handleUpdateRow(row.id, 'fullName', e.target.value)}
                                placeholder="e.g. Nusrat Jahan"
                                className={`w-full text-xs p-1.5 rounded border focus:outline-hidden focus:ring-1 focus:ring-[#214FA2] ${
                                  !val.nameValid && !val.isBlank
                                    ? 'border-amber-400 bg-amber-50/30'
                                    : 'border-slate-300'
                                }`}
                              />
                            </td>

                            {/* University Email */}
                            <td className="p-2">
                              <div>
                                <input
                                  type="email"
                                  value={row.email}
                                  onChange={(e) => handleUpdateRow(row.id, 'email', e.target.value)}
                                  placeholder="nusrat.swe@diu.edu.bd"
                                  className={`w-full text-xs p-1.5 rounded border focus:outline-hidden focus:ring-1 focus:ring-[#214FA2] ${
                                    (!val.emailValid || val.isDuplicateInTable || val.isAlreadyRegistered) && !val.isBlank
                                      ? 'border-red-400 bg-red-50/30'
                                      : 'border-slate-300'
                                  }`}
                                />
                                {val.isDuplicateInTable && (
                                  <span className="text-[10px] text-red-600 font-medium block mt-0.5">
                                    Duplicate email in table
                                  </span>
                                )}
                                {val.isAlreadyRegistered && (
                                  <span className="text-[10px] text-amber-600 font-medium block mt-0.5">
                                    Already registered user
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Password */}
                            <td className="p-2">
                              <div className="relative flex items-center">
                                <input
                                  type={row.showPassword ? 'text' : 'password'}
                                  value={row.password}
                                  onChange={(e) => handleUpdateRow(row.id, 'password', e.target.value)}
                                  placeholder="Password (min 6)"
                                  className="w-full text-xs p-1.5 pr-14 font-mono rounded border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#214FA2]"
                                />
                                <div className="absolute right-1 flex items-center gap-0.5 text-slate-400">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateRow(row.id, 'showPassword', !row.showPassword)}
                                    className="p-1 hover:text-slate-700 rounded"
                                    title={row.showPassword ? 'Hide password' : 'Show password'}
                                  >
                                    {row.showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateRow(row.id, 'password', generateSecurePassword())}
                                    className="p-1 hover:text-slate-700 rounded"
                                    title="Generate new password"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Student ID */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.studentId}
                                onChange={(e) => handleUpdateRow(row.id, 'studentId', e.target.value)}
                                placeholder="221-35-001"
                                className="w-full text-xs p-1.5 rounded border border-slate-300 font-mono focus:outline-hidden focus:ring-1 focus:ring-[#214FA2]"
                              />
                            </td>

                            {/* Department */}
                            <td className="p-2">
                              <select
                                value={row.department}
                                onChange={(e) => handleUpdateRow(row.id, 'department', e.target.value)}
                                className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-[#214FA2]"
                              >
                                {DEPARTMENTS.map((dept) => (
                                  <option key={dept} value={dept}>
                                    {dept}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Batch */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.batch}
                                onChange={(e) => handleUpdateRow(row.id, 'batch', e.target.value)}
                                placeholder="61st Batch"
                                className="w-full text-xs p-1.5 rounded border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#214FA2]"
                              />
                            </td>

                            {/* Phone */}
                            <td className="p-2">
                              <input
                                type="text"
                                value={row.phone}
                                onChange={(e) => handleUpdateRow(row.id, 'phone', e.target.value)}
                                placeholder="+880 1711 000000"
                                className="w-full text-xs p-1.5 rounded border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#214FA2]"
                              />
                            </td>

                            {/* Delete Row */}
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(row.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Remove row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Status bar */}
                <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-4 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <strong>{validRows.length}</strong> valid ambassadors ready
                    </span>
                    {invalidRowsCount > 0 && (
                      <span className="flex items-center gap-1.5 text-amber-700">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <strong>{invalidRowsCount}</strong> incomplete/invalid row{invalidRowsCount > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-slate-400 hidden sm:inline">· Total rows: {rows.length}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ambassadors will receive role AMBASSADOR & cohort entry.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PASTE RAW TSV / CSV */}
            {activeTab === 'paste' && (
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#214FA2] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-blue-950">Quick Spreadsheet Import:</strong>
                    <p className="mt-0.5 text-blue-800 text-[11px]">
                      Copy rows directly from Excel or Google Sheets and paste below. The parser automatically detects Tab, Comma, or Semicolon delimiters.
                    </p>
                    <div className="mt-2 font-mono text-[10px] bg-white/80 p-2 rounded border border-blue-200 text-slate-700">
                      Format: Full Name [tab] Email [tab] Password (optional) [tab] Student ID [tab] Department [tab] Phone
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Paste Spreadsheet Content:
                  </label>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`Tanvir Ahmed\ttanvir.swe@diu.edu.bd\tP@ssw0rd123\t221-35-101\tSoftware Engineering (SWE)\t+8801711000000\nNusrat Jahan\tnusrat.cse@diu.edu.bd\tSecret#2026\t221-15-202\tComputer Science & Engineering (CSE)\t+8801722000000`}
                    className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#214FA2]/20 focus:border-[#214FA2]"
                  />
                  {pasteError && (
                    <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{pasteError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sample = `Tanvir Ahmed\ttanvir.swe@diu.edu.bd\tP@ssw0rd123\t221-35-101\tSoftware Engineering (SWE)\t+880 1711-000001\nNusrat Jahan\tnusrat.cse@diu.edu.bd\tSecure#2026\t221-15-202\tComputer Science & Engineering (CSE)\t+880 1722-000002\nMehedi Hasan\tmehedi.mct@diu.edu.bd\t\t221-25-303\tMultimedia & Creative Technology (MCT)\t+880 1733-000003`;
                      setPastedText(sample);
                    }}
                    className="text-xs text-[#214FA2] hover:underline font-semibold"
                  >
                    Load Sample Data Template
                  </button>

                  <button
                    type="button"
                    onClick={handleParsePastedText}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#214FA2] hover:bg-[#1a3f85] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Parse and Load into Table Grid</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {validRows.length > 0 ? (
                    <span>Ready to create <strong>{validRows.length}</strong> ambassador{validRows.length > 1 ? 's' : ''}</span>
                  ) : (
                    <span>Fill at least 1 valid row</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleSubmitBulk}
                  disabled={validRows.length === 0}
                  className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm ${
                    validRows.length > 0
                      ? 'bg-[#214FA2] hover:bg-[#1a3f85] text-white cursor-pointer active:scale-98'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enroll {validRows.length} Ambassador{validRows.length > 1 ? 's' : ''} in Bulk</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
