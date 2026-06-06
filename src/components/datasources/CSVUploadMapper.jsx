import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, X, ChevronRight, CheckCircle2,
  AlertCircle, Loader2, Table2, ArrowRight, Plus
} from 'lucide-react';

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const rows = lines.slice(1, 6).map(line => {
    const vals = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
  return { headers, rows };
}

function inferType(values) {
  const sample = values.filter(Boolean).slice(0, 10);
  if (sample.every(v => !isNaN(Number(v)) && v !== '')) return 'number';
  if (sample.every(v => /^\d{4}-\d{2}-\d{2}/.test(v))) return 'date';
  if (sample.every(v => v === 'true' || v === 'false')) return 'boolean';
  if (sample.some(v => /_id$/i.test(v) || v.length > 20)) return 'string';
  return 'string';
}

// Single uploaded file state
function FileCard({ file, parsed, namedEntities, onMappingChange, onRemove }) {
  const [mappings, setMappings] = useState(() => {
    // Auto-map: for each header try to match an entity field
    const m = {};
    parsed.headers.forEach(h => { m[h] = { entity: '', field: h }; });
    return m;
  });

  const updateMapping = (header, key, value) => {
    const next = { ...mappings, [header]: { ...mappings[header], [key]: value } };
    setMappings(next);
    onMappingChange(file.name, next, parsed.headers);
  };

  const mappedCount = Object.values(mappings).filter(m => m.entity).length;

  return (
    <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
      {/* File header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-secondary/30 border-b border-border/40">
        <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{file.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {parsed.headers.length} columns · {mappedCount}/{parsed.headers.length} mapped
          </p>
        </div>
        <Badge variant="outline" className={cn("text-[10px]", mappedCount > 0 ? "text-emerald-400 border-emerald-500/30" : "")}>
          {mappedCount > 0 ? `${mappedCount} mapped` : 'Unmapped'}
        </Badge>
        <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preview rows */}
      <div className="px-4 py-2 overflow-x-auto">
        <table className="text-[10px] w-full">
          <thead>
            <tr className="border-b border-border/30">
              {parsed.headers.map(h => (
                <th key={h} className="text-left py-1 pr-3 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.rows.slice(0, 3).map((row, i) => (
              <tr key={i} className="border-b border-border/20 last:border-0">
                {parsed.headers.map(h => (
                  <td key={h} className="py-1 pr-3 text-muted-foreground/70 truncate max-w-[80px] whitespace-nowrap">{row[h]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Column-to-entity mapping */}
      <div className="px-4 pb-4 pt-2 space-y-2 border-t border-border/30">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Map columns → entities</p>
        <div className="space-y-1.5">
          {parsed.headers.map(header => (
            <div key={header} className="flex items-center gap-2">
              {/* Source column */}
              <div className="flex items-center gap-1.5 w-32 flex-shrink-0">
                <Table2 className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] font-mono truncate">{header}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
              {/* Target entity */}
              <Select value={mappings[header]?.entity || ''} onValueChange={v => updateMapping(header, 'entity', v)}>
                <SelectTrigger className="h-7 text-[11px] flex-1">
                  <SelectValue placeholder="Select entity…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>— Skip —</SelectItem>
                  {namedEntities.map(e => (
                    <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Target field name */}
              <input
                className="h-7 px-2 rounded-md border border-input bg-transparent text-[11px] w-28 flex-shrink-0"
                placeholder="field name"
                value={mappings[header]?.field || header}
                onChange={e => updateMapping(header, 'field', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CSVUploadMapper({ namedEntities, onMappingsApplied }) {
  const [files, setFiles] = useState([]); // [{ file, parsed }]
  const [fileMappings, setFileMappings] = useState({}); // keyed by filename
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef(null);

  const processFiles = async (rawFiles) => {
    setParsing(true);
    const newEntries = [];
    for (const file of rawFiles) {
      if (!file.name.endsWith('.csv')) continue;
      const text = await file.text();
      const parsed = parseCSV(text);
      newEntries.push({ file, parsed });
    }
    setFiles(prev => [...prev, ...newEntries]);
    setParsing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles([...e.dataTransfer.files]);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) processFiles([...e.target.files]);
    e.target.value = '';
  };

  const handleMappingChange = (filename, mappings, headers) => {
    setFileMappings(prev => ({ ...prev, [filename]: { mappings, headers } }));
  };

  const removeFile = (filename) => {
    setFiles(prev => prev.filter(f => f.file.name !== filename));
    setFileMappings(prev => { const n = { ...prev }; delete n[filename]; return n; });
  };

  const applyMappings = () => {
    // Merge all file mappings into fieldMappings keyed by entity
    const merged = {};
    files.forEach(({ file, parsed }) => {
      const fm = fileMappings[file.name];
      if (!fm) return;
      fm.headers.forEach(header => {
        const m = fm.mappings[header];
        if (!m?.entity) return;
        if (!merged[m.entity]) merged[m.entity] = [];
        // Avoid duplicates
        const exists = merged[m.entity].some(x => x.field === m.field && x.sourceName === file.name);
        if (!exists) {
          merged[m.entity].push({
            field: m.field || header,
            sourceField: header,
            sourceName: file.name.replace('.csv', ''),
            type: 'string',
          });
        }
      });
    });
    onMappingsApplied(merged);
  };

  const totalMapped = Object.values(fileMappings).reduce((sum, fm) => {
    return sum + Object.values(fm.mappings).filter(m => m.entity).length;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/20"
        )}
      >
        <input ref={inputRef} type="file" accept=".csv" multiple className="hidden" onChange={handleFileInput} />
        {parsing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Parsing files…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", isDragging ? "bg-primary/15" : "bg-secondary")}>
              <Upload className={cn("w-6 h-6", isDragging ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="text-sm font-medium">{isDragging ? 'Drop CSV files here' : 'Upload CSV files'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Drag & drop or click — multiple files supported</p>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
              {['Headers auto-detected', 'Column mapping UI', 'Merge with AI mappings'].map(t => (
                <span key={t} className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" />{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File cards */}
      <AnimatePresence>
        {files.map(({ file, parsed }, i) => (
          <motion.div key={file.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.05 }}>
            <FileCard
              file={file}
              parsed={parsed}
              namedEntities={namedEntities}
              onMappingChange={handleMappingChange}
              onRemove={() => removeFile(file.name)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Apply button */}
      {files.length > 0 && (
        <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
          <div className="text-xs">
            <span className="font-semibold text-emerald-400">{totalMapped} column{totalMapped !== 1 ? 's' : ''}</span>
            <span className="text-muted-foreground"> mapped across {files.length} file{files.length !== 1 ? 's' : ''}</span>
          </div>
          <Button size="sm" disabled={totalMapped === 0} onClick={applyMappings}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs">
            <Plus className="w-3.5 h-3.5" /> Apply Mappings
          </Button>
        </div>
      )}

      {namedEntities.length === 0 && (
        <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3 text-xs text-amber-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Define at least one entity in the previous step before mapping CSV columns.
        </div>
      )}
    </div>
  );
}