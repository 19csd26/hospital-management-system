import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, User, X, Phone, Mail } from 'lucide-react';
import { patients as patientsApi } from '../../api';

export default function PatientSearchInput({ value, onChange, required }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch matching patients — only fires when query has ≥1 char
  const { data, isFetching } = useQuery({
    queryKey: ['patient-search', query],
    queryFn: () => patientsApi.list({ q: query, per_page: 8 }).then((r) => r.data),
    enabled: query.length > 0,
    staleTime: 10_000,
  });

  const results = data?.patients ?? [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (patient) => {
    setSelected(patient);
    setQuery('');
    setOpen(false);
    onChange(patient.id);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    onChange('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    if (selected) {
      setSelected(null);
      onChange('');
    }
  };

  // Highlight the matched portion of text
  const highlight = (text, q) => {
    if (!q || !text) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden native input keeps form validation working */}
      <input type="hidden" value={value || ''} required={required} />

      {selected ? (
        // ── Selected patient card ──────────────────────────────────────────
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="w-9 h-9 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 text-blue-800 font-bold text-sm">
            {selected.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-blue-900 text-sm leading-tight">{selected.name}</p>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {selected.phone && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" />{selected.phone}
                </span>
              )}
              {selected.email && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Mail className="w-3 h-3" />{selected.email}
                </span>
              )}
              {selected.blood_group && (
                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                  {selected.blood_group}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-blue-200 rounded-full transition-colors flex-shrink-0"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4 text-blue-700" />
          </button>
        </div>
      ) : (
        // ── Search input ───────────────────────────────────────────────────
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            className="input pl-9 pr-4"
            placeholder="Search by name or mobile number..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length > 0 && setOpen(true)}
            autoComplete="off"
          />
          {isFetching && (
            <div className="absolute right-3 top-2.5">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* ── Dropdown results ─────────────────────────────────────────────── */}
      {open && !selected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {query.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">
              Start typing a name or mobile number
            </div>
          ) : isFetching ? (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-400 text-center">
              <User className="w-6 h-6 mx-auto mb-2 opacity-40" />
              No patients found for "{query}"
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-gray-600 font-semibold text-sm">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{highlight(p.name, query)}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {p.phone && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />{highlight(p.phone, query)}
                          </span>
                        )}
                        {p.email && (
                          <span className="text-xs text-gray-500 truncate max-w-[160px] flex items-center gap-1">
                            <Mail className="w-3 h-3" />{p.email}
                          </span>
                        )}
                      </div>
                    </div>
                    {p.blood_group && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                        {p.blood_group}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
