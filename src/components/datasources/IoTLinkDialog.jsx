import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import {
  Cpu, Router, ChevronRight, ChevronLeft, Upload, X, ImageIcon,
  Video, FileImage, Loader2, CheckCircle2, Link2, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const IOT_PROTOCOLS = [
  { value: 'mqtt',       label: 'MQTT',          desc: 'Lightweight pub/sub messaging' },
  { value: 'mqtt_s',     label: 'MQTT over TLS',  desc: 'Encrypted MQTT transport' },
  { value: 'coap',       label: 'CoAP',           desc: 'Constrained Application Protocol' },
  { value: 'amqp',       label: 'AMQP',           desc: 'Advanced Message Queuing Protocol' },
  { value: 'opc_ua',     label: 'OPC-UA',         desc: 'Industrial automation standard' },
  { value: 'modbus',     label: 'Modbus TCP/RTU',  desc: 'Serial/TCP industrial protocol' },
  { value: 'http',       label: 'HTTP/REST',       desc: 'RESTful API polling' },
  { value: 'websocket',  label: 'WebSocket',       desc: 'Bidirectional real-time stream' },
  { value: 'zigbee',     label: 'Zigbee',          desc: 'Low-power mesh network' },
  { value: 'zwave',      label: 'Z-Wave',          desc: 'Home/industrial mesh RF' },
  { value: 'ble',        label: 'Bluetooth LE',    desc: 'Short-range low-energy wireless' },
  { value: 'lorawan',    label: 'LoRaWAN',         desc: 'Long-range low-bandwidth wireless' },
];

const GATEWAY_VENDORS = ['AWS IoT Greengrass', 'Azure IoT Edge', 'Google Cloud IoT', 'Siemens IOT2050', 'Advantech', 'Custom Gateway', 'None'];

const STEPS = ['Device Info', 'Protocol & Gateway', 'Media Upload', 'Review'];

function FileDropZone({ label, accept, multiple, files, onChange, icon: Icon, hint }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleFiles = (incoming) => {
    const arr = Array.from(incoming);
    onChange(multiple ? [...files, ...arr] : arr);
  };

  const remove = (idx) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        )}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
      >
        <Icon className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{hint}</p>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-secondary rounded-md px-2 py-1 text-xs">
              <FileImage className="w-3 h-3 text-muted-foreground" />
              <span className="truncate max-w-[120px]">{f.name}</span>
              <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function IoTLinkDialog({ open, onOpenChange, onSubmit, loading }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    // step 1
    name: '',
    sensor_model: '',
    sensor_count: '',
    domain: 'manufacturing',
    sync_frequency: 'real_time',
    // step 2
    protocol: '',
    gateway_vendor: '',
    gateway_host: '',
    gateway_port: '',
    auth_token: '',
    // step 3
    product_images: [],   // File[]
    howto_media: [],      // File[]
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.sensor_model.trim();
    if (step === 1) return form.protocol;
    return true;
  };

  const handleSubmit = () => {
    onSubmit({
      name: form.name,
      type: 'iot',
      provider: form.sensor_model,
      domain: form.domain,
      sync_frequency: form.sync_frequency,
      status: 'disconnected',
      // metadata stored as notes in description-like field
    });
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };
  const [dir, setDir] = useState(1);

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };

  const reset = () => { setStep(0); setDir(1); setForm({ name:'', sensor_model:'', sensor_count:'', domain:'manufacturing', sync_frequency:'real_time', protocol:'', gateway_vendor:'', gateway_host:'', gateway_port:'', auth_token:'', product_images:[], howto_media:[] }); };

  const handleClose = (v) => { if (!v) reset(); onOpenChange(v); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> Link IoT System
          </DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={cn("flex items-center gap-1.5 text-[11px] font-medium transition-colors",
                i === step ? "text-primary" : i < step ? "text-emerald-400" : "text-muted-foreground"
              )}>
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
                  i === step ? "bg-primary text-primary-foreground border-primary"
                  : i < step ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : "border-border text-muted-foreground"
                )}>
                  {i < step ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", i < step ? "bg-emerald-500/40" : "bg-border")} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* STEP 0 — Device Info */}
            {step === 0 && (
              <>
                <p className="text-xs text-muted-foreground">Enter basic information about your IoT sensors.</p>
                <div>
                  <Label className="text-xs">System / Group Name <span className="text-destructive">*</span></Label>
                  <Input className="mt-1" placeholder="e.g., Factory Floor Sensors" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Sensor Model / Hardware <span className="text-destructive">*</span></Label>
                  <Input className="mt-1" placeholder="e.g., Siemens S7-1500, Bosch BME280" value={form.sensor_model} onChange={e => set('sensor_model', e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Number of Sensors</Label>
                  <Input className="mt-1" type="number" placeholder="e.g., 24" value={form.sensor_count} onChange={e => set('sensor_count', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Domain</Label>
                    <Select value={form.domain} onValueChange={v => set('domain', v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['manufacturing','logistics','retail','finance','hr','operations'].map(d => (
                          <SelectItem key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase()+d.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Sync Frequency</Label>
                    <Select value={form.sync_frequency} onValueChange={v => set('sync_frequency', v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="real_time">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* STEP 1 — Protocol & Gateway */}
            {step === 1 && (
              <>
                <p className="text-xs text-muted-foreground">Configure the communication protocol and IoT gateway.</p>
                <div>
                  <Label className="text-xs">IoT Protocol <span className="text-destructive">*</span></Label>
                  <Select value={form.protocol} onValueChange={v => set('protocol', v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select protocol…" /></SelectTrigger>
                    <SelectContent>
                      {IOT_PROTOCOLS.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className="font-medium">{p.label}</span>
                          <span className="text-muted-foreground ml-2 text-[11px]">{p.desc}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.protocol && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {IOT_PROTOCOLS.find(p => p.value === form.protocol)?.desc}
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-3 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Router className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">IoT Gateway (optional)</span>
                  </div>
                  <div>
                    <Label className="text-xs">Gateway Vendor / Type</Label>
                    <Select value={form.gateway_vendor} onValueChange={v => set('gateway_vendor', v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select gateway…" /></SelectTrigger>
                      <SelectContent>
                        {GATEWAY_VENDORS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Gateway Host / IP</Label>
                      <Input className="mt-1" placeholder="192.168.1.100 or hostname" value={form.gateway_host} onChange={e => set('gateway_host', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Port</Label>
                      <Input className="mt-1" placeholder="1883" value={form.gateway_port} onChange={e => set('gateway_port', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Auth Token / API Key</Label>
                    <Input className="mt-1" type="password" placeholder="••••••••••••" value={form.auth_token} onChange={e => set('auth_token', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* STEP 2 — Media Upload */}
            {step === 2 && (
              <>
                <p className="text-xs text-muted-foreground">Upload product photos and connection guide media for reference.</p>
                <FileDropZone
                  label="Product / Device Photos"
                  accept="image/*"
                  multiple
                  files={form.product_images}
                  onChange={v => set('product_images', v)}
                  icon={ImageIcon}
                  hint="Drag & drop or click — JPG, PNG, WEBP"
                />
                <FileDropZone
                  label="How-to Connect — Photos or Videos"
                  accept="image/*,video/*"
                  multiple
                  files={form.howto_media}
                  onChange={v => set('howto_media', v)}
                  icon={Video}
                  hint="Drag & drop or click — JPG, PNG, MP4, MOV"
                />
              </>
            )}

            {/* STEP 3 — Review */}
            {step === 3 && (
              <>
                <p className="text-xs text-muted-foreground">Review your IoT system configuration before registering.</p>
                <div className="bg-secondary/50 rounded-xl p-4 space-y-3 text-xs">
                  <ReviewRow label="System Name" value={form.name} />
                  <ReviewRow label="Sensor Model" value={form.sensor_model} />
                  {form.sensor_count && <ReviewRow label="Sensor Count" value={form.sensor_count} />}
                  <ReviewRow label="Domain" value={form.domain} />
                  <ReviewRow label="Sync" value={form.sync_frequency.replace('_',' ')} />
                  <div className="border-t border-border pt-3">
                    <ReviewRow label="Protocol" value={IOT_PROTOCOLS.find(p => p.value === form.protocol)?.label || '—'} />
                    {form.gateway_vendor && <ReviewRow label="Gateway" value={form.gateway_vendor} />}
                    {form.gateway_host && <ReviewRow label="Host" value={`${form.gateway_host}${form.gateway_port ? ':'+form.gateway_port : ''}`} />}
                  </div>
                  <div className="border-t border-border pt-3">
                    <ReviewRow label="Product Photos" value={form.product_images.length ? `${form.product_images.length} file(s)` : 'None'} />
                    <ReviewRow label="How-to Media" value={form.howto_media.length ? `${form.howto_media.length} file(s)` : 'None'} />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
          <Button variant="ghost" size="sm" onClick={goBack} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={goNext} disabled={!canNext()}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSubmit} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              Register IoT System
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}