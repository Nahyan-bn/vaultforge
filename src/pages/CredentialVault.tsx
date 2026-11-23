import React, { useState } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { cryptoBridge } from '../crypto/bridge';
import type { DecryptedRecord, RecordType, LoginCredential, PaymentCard, SecureNote, ApiKeyRecord } from '../types/vault';
import {
  Search,
  Plus,
  LayoutList,
  LayoutGrid,
  Filter,
  Star,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Edit,
  History,
  KeyRound,
  FileText,
  CreditCard,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CredentialVaultProps {
  onNavigate: (tab: string) => void;
  filterFavorites?: boolean;
}

export const CredentialVault: React.FC<CredentialVaultProps> = ({ onNavigate, filterFavorites = false }) => {
  const { records, addRecord, updateRecord, deleteRecord, restoreRecord, preferences } = useVaultStore();

  const [viewMode, setViewMode] = useState<'master-detail' | 'grid'>('master-detail');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const [onlyFavorites, setOnlyFavorites] = useState(filterFavorites);
  const [showTrash, setShowTrash] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form State for Create/Edit
  const [formType, setFormType] = useState<RecordType>('login');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formCardholder, setFormCardholder] = useState('');
  const [formCardNumber, setFormCardNumber] = useState('');
  const [formCardExpiryM, setFormCardExpiryM] = useState('12');
  const [formCardExpiryY, setFormCardExpiryY] = useState('2028');
  const [formCvv, setFormCvv] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formApiService, setFormApiService] = useState('');

  // Password reveal and copy timer
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [clipboardTimer, setClipboardTimer] = useState<number | null>(null);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (showTrash ? !r.isDeleted : r.isDeleted) return false;
    if (onlyFavorites && !r.isFavorite) return false;
    if (selectedType !== 'ALL' && r.type !== selectedType) return false;
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = r.title.toLowerCase().includes(q);
      const catMatch = r.category.toLowerCase().includes(q);
      const userMatch = r.type === 'login' && (r as LoginCredential).username.toLowerCase().includes(q);
      return titleMatch || catMatch || userMatch;
    }
    return true;
  });

  const selectedRecord = records.find((r) => r.id === selectedRecordId) || filteredRecords[0] || null;

  const categories = Array.from(new Set(records.map((r) => r.category || 'General')));

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setClipboardTimer(preferences.clipboardClearSeconds);

    // Countdown and best-effort clipboard clearance
    const interval = setInterval(() => {
      setClipboardTimer((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          try {
            navigator.clipboard.writeText('');
          } catch (e) {
            console.warn(e);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => setCopiedField(null), 2000);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('General');
    setFormUsername('');
    setFormPassword('');
    setFormWebsite('');
    setFormNotes('');
    setFormCardholder('');
    setFormCardNumber('');
    setFormCvv('');
    setFormContent('');
    setFormApiKey('');
    setFormApiService('');
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (isEditing && selectedRecord) {
      const updated: DecryptedRecord = {
        ...selectedRecord,
        title: formTitle,
        category: formCategory,
        notes: formNotes,
        ...(formType === 'login' && {
          username: formUsername,
          password: formPassword,
          website: formWebsite
        }),
        ...(formType === 'card' && {
          cardholderName: formCardholder,
          cardNumber: formCardNumber,
          expiryMonth: formCardExpiryM,
          expiryYear: formCardExpiryY,
          cvv: formCvv
        }),
        ...(formType === 'note' && {
          content: formContent
        }),
        ...(formType === 'api_key' && {
          service: formApiService,
          apiKey: formApiKey
        })
      } as DecryptedRecord;
      await updateRecord(updated);
    } else {
      await addRecord({
        type: formType,
        title: formTitle,
        category: formCategory,
        notes: formNotes,
        tags: [formCategory],
        isFavorite: false,
        isDeleted: false,
        ...(formType === 'login' && {
          username: formUsername,
          password: formPassword,
          website: formWebsite
        }),
        ...(formType === 'card' && {
          cardholderName: formCardholder,
          cardNumber: formCardNumber,
          expiryMonth: formCardExpiryM,
          expiryYear: formCardExpiryY,
          cvv: formCvv
        }),
        ...(formType === 'note' && {
          content: formContent
        }),
        ...(formType === 'api_key' && {
          service: formApiService,
          apiKey: formApiKey
        })
      } as any);
    }

    resetForm();
  };

  const handleEditClick = (record: DecryptedRecord) => {
    setFormType(record.type);
    setFormTitle(record.title);
    setFormCategory(record.category || 'General');
    setFormNotes(record.notes || '');

    if (record.type === 'login') {
      const l = record as LoginCredential;
      setFormUsername(l.username || '');
      setFormPassword(l.password || '');
      setFormWebsite(l.website || '');
    } else if (record.type === 'card') {
      const c = record as PaymentCard;
      setFormCardholder(c.cardholderName || '');
      setFormCardNumber(c.cardNumber || '');
      setFormCardExpiryM(c.expiryMonth || '12');
      setFormCardExpiryY(c.expiryYear || '2028');
      setFormCvv(c.cvv || '');
    } else if (record.type === 'note') {
      const n = record as SecureNote;
      setFormContent(n.content || '');
    } else if (record.type === 'api_key') {
      const a = record as ApiKeyRecord;
      setFormApiService(a.service || '');
      setFormApiKey(a.apiKey || '');
    }

    setIsEditing(true);
    setIsCreating(false);
  };

  const getTypeIcon = (type: RecordType) => {
    switch (type) {
      case 'login': return KeyRound;
      case 'card': return CreditCard;
      case 'note': return FileText;
      case 'api_key': return Terminal;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <span>Credential Vault</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyber-primary/20 text-cyber-cyan border border-cyber-primary/30">
              {filteredRecords.length} items
            </span>
          </h1>
          <p className="text-xs text-cyber-muted font-mono mt-0.5">
            Encrypted with XChaCha20-Poly1305 with individual 24-byte nonces
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Clipboard clear timer badge */}
          {clipboardTimer !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-warning/15 border border-cyber-warning/40 text-cyber-warning text-xs font-mono animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Clearing clipboard in {clipboardTimer}s</span>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-cyber-card border border-cyber-border p-0.5">
            <button
              onClick={() => setViewMode('master-detail')}
              className={`p-1.5 rounded ${viewMode === 'master-detail' ? 'bg-cyber-primary text-white' : 'text-cyber-muted hover:text-white'}`}
              title="Master-Detail View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-cyber-primary text-white' : 'text-cyber-muted hover:text-white'}`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Favorites Filter Toggle */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              onlyFavorites
                ? 'bg-cyber-warning/20 border-cyber-warning text-cyber-warning font-bold'
                : 'bg-cyber-card border-cyber-border text-cyber-muted hover:text-white'
            }`}
            title="Filter Starred Favorites"
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-cyber-warning text-cyber-warning' : ''}`} />
            <span>Favorites</span>
          </button>

          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              showTrash
                ? 'bg-cyber-danger/20 border-cyber-danger text-cyber-danger'
                : 'bg-cyber-card border-cyber-border text-cyber-muted hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
            className="px-4 py-2 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-cyber-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credential</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 font-mono text-xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, username, category..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-cyber-card border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-cyber-card border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs"
          >
            <option value="ALL">All Types</option>
            <option value="login">Logins</option>
            <option value="card">Payment Cards</option>
            <option value="note">Secure Notes</option>
            <option value="api_key">API Keys</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-cyber-card border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {isCreating || isEditing ? (
        /* Create / Edit Form Modal / Panel */
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-cyan/30 shadow-cyber">
          <div className="flex items-center justify-between pb-4 border-b border-cyber-border mb-6">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyber-cyan" />
              <span>{isEditing ? 'Edit Credential' : 'Create New Encrypted Credential'}</span>
            </h2>
            <button
              onClick={resetForm}
              className="text-xs font-mono text-cyber-muted hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-4">
            {/* Record Type Selector */}
            {!isEditing && (
              <div>
                <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                  Credential Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  {[
                    { id: 'login', label: 'Login', icon: KeyRound },
                    { id: 'card', label: 'Payment Card', icon: CreditCard },
                    { id: 'note', label: 'Secure Note', icon: FileText },
                    { id: 'api_key', label: 'API Key', icon: Terminal },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormType(t.id as RecordType)}
                        className={`p-3 rounded-xl border flex items-center gap-2 transition-colors ${
                          formType === t.id
                            ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-cyan font-bold'
                            : 'bg-cyber-bg border-cyber-border text-cyber-muted hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. AWS Production, ProtonMail"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Infrastructure, Finance, Personal"
                  className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Login Specific Fields */}
            {formType === 'login' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                      Username / Email
                    </label>
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="user@domain.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono text-cyber-muted uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await cryptoBridge.generatePassword(24);
                          setFormPassword(res.password);
                        }}
                        className="text-[11px] font-mono text-cyber-cyan hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>C-Generate</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Credential password"
                      className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Card Specific Fields */}
            {formType === 'card' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={formCardholder}
                      onChange={(e) => setFormCardholder(e.target.value)}
                      placeholder="Full Name as on card"
                      className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={formCardNumber}
                      onChange={(e) => setFormCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                      Month
                    </label>
                    <input
                      type="text"
                      value={formCardExpiryM}
                      onChange={(e) => setFormCardExpiryM(e.target.value)}
                      placeholder="12"
                      className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      value={formCardExpiryY}
                      onChange={(e) => setFormCardExpiryY(e.target.value)}
                      placeholder="2028"
                      className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={formCvv}
                      onChange={(e) => setFormCvv(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Note Specific Fields */}
            {formType === 'note' && (
              <div>
                <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                  Encrypted Note Content
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Enter private notes, recovery seed phrases, private SSH keys..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs font-mono"
                />
              </div>
            )}

            {/* API Key Specific Fields */}
            {formType === 'api_key' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                    Service / Provider
                  </label>
                  <input
                    type="text"
                    value={formApiService}
                    onChange={(e) => setFormApiService(e.target.value)}
                    placeholder="e.g. OpenAI, Stripe, Cloudflare"
                    className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                    API Secret Token
                  </label>
                  <input
                    type="text"
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder="sk_live_..."
                    className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border focus:border-cyber-cyan focus:outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-cyber-muted uppercase tracking-wider mb-2">
                Additional Notes
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Optional notes (encrypted along with record payload)"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-cyber-bg border border-cyber-border text-white text-xs font-mono"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl border border-cyber-border text-cyber-muted hover:text-white font-mono text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cyber-primary hover:bg-cyber-primaryHover text-white font-mono text-xs font-bold transition-all shadow-cyber-sm"
              >
                {isEditing ? 'Save Changes' : 'Seal & Encrypt Record'}
              </button>
            </div>
          </form>
        </div>
      ) : viewMode === 'master-detail' ? (
        /* MASTER-DETAIL VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* Master List (Left) */}
          <div className="lg:col-span-5 p-3 rounded-2xl bg-cyber-card border border-cyber-border flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[620px]">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-16 text-cyber-muted font-mono text-xs">
                  No records match query.
                </div>
              ) : (
                filteredRecords.map((r) => {
                  const Icon = getTypeIcon(r.type);
                  const isSelected = selectedRecord?.id === r.id;

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRecordId(r.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-cyber-elevated border-cyber-cyan/50 shadow-cyber-sm'
                          : 'bg-cyber-bg/60 border-cyber-border/60 hover:bg-cyber-elevated/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'bg-cyber-card text-cyber-muted'}`}>
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display font-bold text-sm text-cyber-text truncate">
                            {r.title}
                          </div>
                          <div className="font-mono text-[11px] text-cyber-muted truncate">
                            {r.type === 'login' ? (r as LoginCredential).username : r.category}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {r.isFavorite && <Star className="w-3.5 h-3.5 text-cyber-warning fill-cyber-warning" />}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyber-card border border-cyber-border text-cyber-muted uppercase">
                          {r.type}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Record Detail Panel (Right) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-cyber-card border border-cyber-border flex flex-col justify-between">
            {selectedRecord ? (
              <div className="space-y-6">
                {/* Detail Header */}
                <div className="flex items-start justify-between pb-4 border-b border-cyber-border">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-cyber-primary/20 text-cyber-cyan border border-cyber-primary/30">
                      {React.createElement(getTypeIcon(selectedRecord.type), { className: 'w-6 h-6' })}
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-white">
                        {selectedRecord.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-cyber-muted">
                        <span>Category: {selectedRecord.category}</span>
                        <span>•</span>
                        <span>Updated: {new Date(selectedRecord.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateRecord({ ...selectedRecord, isFavorite: !selectedRecord.isFavorite })}
                      className="p-2 rounded-lg border border-cyber-border hover:bg-cyber-elevated text-cyber-muted hover:text-cyber-warning transition-colors"
                      title="Toggle Favorite"
                    >
                      <Star className={`w-4 h-4 ${selectedRecord.isFavorite ? 'text-cyber-warning fill-cyber-warning' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleEditClick(selectedRecord)}
                      className="p-2 rounded-lg border border-cyber-border hover:bg-cyber-elevated text-cyber-muted hover:text-white transition-colors"
                      title="Edit Record"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRecord(selectedRecord.id, showTrash)}
                      className="p-2 rounded-lg border border-cyber-border hover:bg-cyber-danger/20 text-cyber-muted hover:text-cyber-danger transition-colors"
                      title={showTrash ? 'Permanently Delete' : 'Move to Trash'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Detail Fields */}
                <div className="space-y-4 font-mono text-xs">
                  {selectedRecord.type === 'login' && (() => {
                    const l = selectedRecord as LoginCredential;
                    return (
                      <>
                        <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-cyber-muted uppercase block">Username / Account</span>
                            <span className="text-white font-bold select-all">{l.username || '—'}</span>
                          </div>
                          {l.username && (
                            <button
                              onClick={() => handleCopy(l.username, 'username')}
                              className="p-1.5 rounded bg-cyber-card border border-cyber-border text-cyber-muted hover:text-cyber-cyan transition-colors"
                            >
                              {copiedField === 'username' ? <Check className="w-3.5 h-3.5 text-cyber-success" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>

                        <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-cyber-muted uppercase block">Password</span>
                            <span className="text-cyber-cyan font-bold select-all tracking-wider">
                              {revealedIds[l.id] ? l.password : '••••••••••••••••'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setRevealedIds({ ...revealedIds, [l.id]: !revealedIds[l.id] })}
                              className="p-1.5 rounded bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white transition-colors"
                            >
                              {revealedIds[l.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(l.password, 'password')}
                              className="p-1.5 rounded bg-cyber-card border border-cyber-border text-cyber-muted hover:text-cyber-cyan transition-colors"
                            >
                              {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-cyber-success" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {l.website && (
                          <div className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-cyber-muted uppercase block">Website</span>
                              <span className="text-white truncate max-w-sm block">{l.website}</span>
                            </div>
                            <a
                              href={l.website}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded bg-cyber-card border border-cyber-border text-cyber-muted hover:text-cyber-cyan transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {selectedRecord.type === 'note' && (() => {
                    const n = selectedRecord as SecureNote;
                    return (
                      <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border">
                        <span className="text-[10px] text-cyber-muted uppercase block mb-2">Decrypted Note</span>
                        <pre className="whitespace-pre-wrap font-mono text-white text-xs leading-relaxed select-all">
                          {n.content}
                        </pre>
                      </div>
                    );
                  })()}

                  {selectedRecord.type === 'card' && (() => {
                    const c = selectedRecord as PaymentCard;
                    return (
                      <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-3">
                        <div className="flex justify-between">
                          <span className="text-cyber-muted">Cardholder:</span>
                          <span className="text-white font-bold">{c.cardholderName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyber-muted">Card Number:</span>
                          <span className="text-cyber-cyan font-bold tracking-widest">{c.cardNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyber-muted">Expires:</span>
                          <span className="text-white">{c.expiryMonth}/{c.expiryYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-cyber-muted">CVV:</span>
                          <span className="text-cyber-warning font-bold">•••</span>
                        </div>
                      </div>
                    );
                  })()}

                  {selectedRecord.type === 'api_key' && (() => {
                    const a = selectedRecord as ApiKeyRecord;
                    return (
                      <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-border space-y-3">
                        <div className="flex justify-between">
                          <span className="text-cyber-muted">Service:</span>
                          <span className="text-white font-bold">{a.service}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] text-cyber-muted uppercase block">API Key</span>
                            <span className="text-cyber-cyan font-bold select-all truncate block">
                              {revealedIds[a.id] ? a.apiKey : '••••••••••••••••••••••••••••'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setRevealedIds({ ...revealedIds, [a.id]: !revealedIds[a.id] })}
                              className="p-1.5 rounded bg-cyber-card border border-cyber-border text-cyber-muted hover:text-white"
                            >
                              {revealedIds[a.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(a.apiKey, 'apikey')}
                              className="p-1.5 rounded bg-cyber-card border border-cyber-border text-cyber-muted hover:text-cyber-cyan"
                            >
                              {copiedField === 'apikey' ? <Check className="w-3.5 h-3.5 text-cyber-success" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {selectedRecord.notes && (
                    <div className="p-3.5 rounded-xl bg-cyber-bg/60 border border-cyber-border">
                      <span className="text-[10px] text-cyber-muted uppercase block mb-1">Notes</span>
                      <p className="text-cyber-text/80 text-xs font-sans leading-relaxed">
                        {selectedRecord.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Cryptographic envelope proof footer */}
                <div className="p-3 rounded-xl bg-cyber-bgSecondary/60 border border-cyber-border/60 text-[11px] font-mono text-cyber-muted space-y-1">
                  <div className="flex items-center gap-1.5 text-cyber-cyan">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Envelope Verification</span>
                  </div>
                  <div className="text-[10px]">
                    Record ID: <span className="text-cyber-text">{selectedRecord.id}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-cyber-muted text-xs font-mono py-24">
                Select a credential on the left to inspect details.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((r) => {
            const Icon = getTypeIcon(r.type);
            return (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-cyan/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-cyber-primary/10 text-cyber-cyan border border-cyber-primary/20">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyber-bg border border-cyber-border text-cyber-muted">
                      {r.type}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-white truncate">
                    {r.title}
                  </h3>

                  <p className="font-mono text-xs text-cyber-muted truncate">
                    {r.type === 'login' ? (r as LoginCredential).username : r.category}
                  </p>
                </div>

                <div className="pt-3 border-t border-cyber-border/40 flex items-center justify-between font-mono text-xs">
                  <button
                    onClick={() => {
                      setSelectedRecordId(r.id);
                      setViewMode('master-detail');
                    }}
                    className="text-cyber-cyan hover:underline flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(r)}
                      className="text-cyber-muted hover:text-white"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteRecord(r.id, showTrash)}
                      className="text-cyber-muted hover:text-cyber-danger"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
