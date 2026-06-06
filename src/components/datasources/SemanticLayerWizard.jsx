import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, CheckCircle2, ChevronRight, ChevronLeft, Database,
  Server, Globe, Cpu, FileSpreadsheet, Cloud, Warehouse, Loader2, Sparkles
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import PersistenceLayerStep from './PersistenceLayerStep';
import CubeFabricModal from './CubeFabricModal';
import SemanticLayerSummary from './SemanticLayerSummary';

const typeIcons = {
  erp: Server, crm: Globe, iot: Cpu,
  database: Database, api: Cloud, file_upload: FileSpreadsheet, warehouse: Warehouse,
};

const typeLabels = {
  erp: 'ERP System', crm: 'CRM', iot: 'IoT / SCADA',
  database: 'Database', api: 'REST API', file_upload: 'File Upload', warehouse: 'Data Warehouse',
};

const STEPS = ['Select Sources', 'Define Entities', 'Map Fields', 'Summary', 'Persistence'];

const DEFAULT_PERSISTENCE = {
  location: '',
  cloudType: 'public',
  provider: '',
  region: '',
  iamConfig: {},
};

export default function SemanticLayerWizard({ open, onOpenChange, sources }) {
  const [step, setStep] = useState(0);
  const [selectedSourceIds, setSelectedSourceIds] = useState(new Set());
  const [layerName, setLayerName] = useState('');
  const [layerDescription, setLayerDescription] = useState('');
  const [entities, setEntities] = useState([{ name: '', description: '' }]);
  const [fieldMappings, setFieldMappings] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [persistence, setPersistence] = useState(DEFAULT_PERSISTENCE);
  const [showFabric, setShowFabric] = useState(false);

  const selectedSources = sources.filter(s => selectedSourceIds.has(s.id));

  const toggleSource = (id) => {
    setSelectedSourceIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const sourceDescriptions = selectedSources.map(s => `${s.name} (${typeLabels[s.type] || s.type}, domain: ${s.domain})`).join(', ');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a data architect. Given these enterprise data sources: ${sourceDescriptions}, suggest a semantic layer design.
Return a JSON object with:
- suggestedEntities: array of { name, description, sourceIds } (3-5 business entities)
- suggestedMappings: object mapping entityName to array of { field, sourceField, sourceName, type }
Keep entity names as business concepts (e.g. "Customer", "Order", "Product", "Asset").`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestedEntities: {
              type: 'array',
              items: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, sourceIds: { type: 'array', items: { type: 'string' } } } }
            },
            suggestedMappings: { type: 'object' }
          }
        }
      });
      setAiSuggestions(result);
      if (result?.suggestedEntities) setEntities(result.suggestedEntities.map(e => ({ name: e.name, description: e.description })));
      if (result?.suggestedMappings) setFieldMappings(result.suggestedMappings);
    } catch (err) {
      toast.error('AI analysis failed — you can define entities manually');
    } finally {
      setIsGenerating(false);
      setStep(1);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    await new Promise(r => setTimeout(r, 600));
    setIsCreating(false);
    // Close wizard, open fabric build modal
    onOpenChange(false);
    setShowFabric(true);
  };

  const handleFabricClose = () => {
    setShowFabric(false);
    toast.success(`Semantic layer "${layerName}" is live`);
    resetState();
  };

  const resetState = () => {
    setStep(0);
    setSelectedSourceIds(new Set());
    setLayerName('');
    setLayerDescription('');
    setEntities([{ name: '', description: '' }]);
    setFieldMappings({});
    setAiSuggestions(null);
    setPersistence(DEFAULT_PERSISTENCE);
  };

  const handleClose = () => { resetState(); onOpenChange(false); };

  const canProceedStep0 = selectedSourceIds.size > 0 && layerName.trim().length > 0;
  const canProceedStep1 = entities.some(e => e.name.trim());
  const canProceedStep4 = persistence.location === 'local' ||
    (persistence.location === 'cloud' && persistence.provider && persistence.region);

  const namedEntities = entities.filter(e => e.name.trim());

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> Create Semantic Layer
            </DialogTitle>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex items-center gap-0 mb-4">
            {STEPS.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                    i < step ? "bg-primary text-primary-foreground" :
                    i === step ? "bg-primary/20 text-primary border border-primary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={cn("text-xs hidden sm:block", i === step ? "text-foreground font-medium" : "text-muted-foreground")}>{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={cn("flex-1 h-px mx-2", i < step ? "bg-primary/40" : "bg-border")} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto pr-1">
            <AnimatePresence mode="wait">

              {/* Step 0: Select Sources */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <Label className="text-xs">Semantic Layer Name *</Label>
                    <Input value={layerName} onChange={e => setLayerName(e.target.value)} placeholder="e.g., Unified Supply Chain View" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Description (optional)</Label>
                    <Textarea value={layerDescription} onChange={e => setLayerDescription(e.target.value)} placeholder="Describe the business purpose…" className="mt-1 h-16 resize-none" />
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block">Select Data Sources * ({selectedSourceIds.size} selected)</Label>
                    {sources.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                        <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No data sources found. Link a system first.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sources.map(source => {
                          const Icon = typeIcons[source.type] || Database;
                          const selected = selectedSourceIds.has(source.id);
                          return (
                            <button key={source.id} onClick={() => toggleSource(source.id)}
                              className={cn("flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                                selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-border/80")}>
                              <div className={cn("w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0", selected ? "bg-primary/20" : "bg-secondary")}>
                                <Icon className={cn("w-4 h-4", selected ? "text-primary" : "text-muted-foreground")} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{source.name}</p>
                                <p className="text-[10px] text-muted-foreground">{typeLabels[source.type]} · {source.domain}</p>
                              </div>
                              <div className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0", selected ? "border-primary bg-primary" : "border-muted-foreground")} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Define Entities */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Business Entities</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Define the logical entities in your semantic layer</p>
                    </div>
                    {aiSuggestions && (
                      <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">
                        <Sparkles className="w-3 h-3 mr-1" /> AI Suggested
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    {entities.map((entity, i) => (
                      <div key={i} className="bg-card border border-border/60 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input value={entity.name} onChange={e => setEntities(prev => prev.map((en, idx) => idx === i ? { ...en, name: e.target.value } : en))}
                            placeholder="Entity name (e.g., Customer)" className="h-8 text-xs flex-1" />
                          {entities.length > 1 && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setEntities(prev => prev.filter((_, idx) => idx !== i))}>×</Button>
                          )}
                        </div>
                        <Input value={entity.description} onChange={e => setEntities(prev => prev.map((en, idx) => idx === i ? { ...en, description: e.target.value } : en))}
                          placeholder="Description…" className="h-8 text-xs" />
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"
                    onClick={() => setEntities(prev => [...prev, { name: '', description: '' }])}>+ Add Entity</Button>
                </motion.div>
              )}

              {/* Step 2: Map Fields */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Field Mappings</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Review how fields map from your sources to semantic entities</p>
                  </div>
                  {namedEntities.map(entity => {
                    const mappings = fieldMappings[entity.name] || [];
                    return (
                      <div key={entity.name} className="bg-card border border-border/60 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded bg-primary/15 flex items-center justify-center">
                            <Database className="w-3 h-3 text-primary" />
                          </div>
                          <p className="text-sm font-semibold">{entity.name}</p>
                          {entity.description && <p className="text-xs text-muted-foreground">— {entity.description}</p>}
                        </div>
                        {mappings.length > 0 ? (
                          <div className="space-y-1.5">
                            {mappings.map((m, mi) => (
                              <div key={mi} className="flex items-center gap-2 text-xs bg-secondary/50 rounded px-3 py-1.5">
                                <span className="font-medium text-foreground w-24 truncate">{m.field}</span>
                                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground truncate">{m.sourceName || 'Source'}.{m.sourceField}</span>
                                {m.type && <Badge variant="outline" className="text-[9px] ml-auto">{m.type}</Badge>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-3">Mappings will be auto-inferred on first sync</p>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {/* Step 3: Summary */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <SemanticLayerSummary
                    layerName={layerName}
                    layerDescription={layerDescription}
                    namedEntities={namedEntities}
                    fieldMappings={fieldMappings}
                    selectedSources={selectedSources}
                  />
                </motion.div>
              )}

              {/* Step 4: Persistence */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <PersistenceLayerStep persistence={persistence} onChange={setPersistence} />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
            <Button variant="ghost" size="sm" onClick={() => step === 0 ? handleClose() : setStep(s => s - 1)} className="gap-1.5">
              <ChevronLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            <div className="flex items-center gap-2">
              {step === 0 && (
                <Button size="sm" disabled={!canProceedStep0 || isGenerating} onClick={handleGenerateSuggestions} className="gap-2">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? 'Analysing…' : 'Analyse & Continue'}
                </Button>
              )}
              {step === 1 && (
                <Button size="sm" disabled={!canProceedStep1} onClick={() => setStep(2)} className="gap-1.5">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              {step === 2 && (
                <Button size="sm" onClick={() => setStep(3)} className="gap-1.5">
                  Review <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              {step === 3 && (
                <Button size="sm" onClick={() => setStep(4)} className="gap-1.5">
                  Set Persistence <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              {step === 4 && (
                <Button size="sm" disabled={!canProceedStep4 || isCreating} onClick={handleCreate}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                  {isCreating ? 'Initialising…' : 'Build Data Fabric'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cube Fabric Build Progress Modal */}
      <CubeFabricModal
        open={showFabric}
        onClose={handleFabricClose}
        layerName={layerName}
        persistence={persistence}
        entities={namedEntities}
        sources={selectedSources}
      />
    </>
  );
}