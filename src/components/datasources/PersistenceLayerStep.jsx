import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Monitor, Cloud, Lock, Key, Globe, ShieldCheck } from 'lucide-react';

const PUBLIC_CLOUD_PROVIDERS = [
  { value: 'aws', label: 'Amazon Web Services (AWS)' },
  { value: 'gcp', label: 'Google Cloud Platform (GCP)' },
  { value: 'azure', label: 'Microsoft Azure' },
  { value: 'oracle', label: 'Oracle Cloud Infrastructure' },
  { value: 'ibm', label: 'IBM Cloud' },
];

const PRIVATE_CLOUD_PROVIDERS = [
  { value: 'vmware', label: 'VMware vSphere / Tanzu' },
  { value: 'openstack', label: 'OpenStack' },
  { value: 'nutanix', label: 'Nutanix' },
  { value: 'redhat', label: 'Red Hat OpenShift' },
  { value: 'custom', label: 'Custom / On-Premise Cloud' },
];

const AWS_REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1'];
const GCP_REGIONS = ['us-central1', 'us-east1', 'europe-west1', 'europe-west4', 'asia-east1', 'asia-southeast1'];
const AZURE_REGIONS = ['East US', 'West US 2', 'West Europe', 'North Europe', 'Southeast Asia', 'Japan East'];

function getRegions(provider) {
  if (provider === 'aws') return AWS_REGIONS;
  if (provider === 'gcp') return GCP_REGIONS;
  if (provider === 'azure') return AZURE_REGIONS;
  return [];
}

export default function PersistenceLayerStep({ persistence, onChange }) {
  const { location, cloudType, provider, region, iamConfig } = persistence;

  const update = (field, value) => onChange({ ...persistence, [field]: value });
  const updateIam = (field, value) => onChange({ ...persistence, iamConfig: { ...iamConfig, [field]: value } });

  const providers = cloudType === 'private' ? PRIVATE_CLOUD_PROVIDERS : PUBLIC_CLOUD_PROVIDERS;
  const regions = getRegions(provider);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium">Choose Persistence Layer</p>
        <p className="text-xs text-muted-foreground mt-0.5">Where should Cube store the semantic data fabric pre-aggregations and cache?</p>
      </div>

      {/* Location Toggle */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'local', label: 'On My Computer', icon: Monitor, desc: 'Local file system — great for development and testing' },
          { value: 'cloud', label: 'In the Cloud', icon: Cloud, desc: 'Scalable cloud storage for production workloads' },
        ].map(opt => {
          const Icon = opt.icon;
          const selected = location === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => update('location', opt.value)}
              className={cn(
                "flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all",
                selected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-border/80"
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", selected ? "bg-primary/20" : "bg-secondary")}>
                <Icon className={cn("w-5 h-5", selected ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", selected ? "text-primary" : "text-foreground")}>{opt.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Local details */}
      {location === 'local' && (
        <div className="bg-secondary/40 rounded-xl p-4 space-y-3 border border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Monitor className="w-4 h-4" />
            Cube will store pre-aggregations in <code className="bg-secondary px-1.5 py-0.5 rounded font-mono text-[10px]">~/.cube/store</code> on your local machine.
          </div>
          <div>
            <Label className="text-xs">Custom Path (optional)</Label>
            <Input
              value={iamConfig?.localPath || ''}
              onChange={e => updateIam('localPath', e.target.value)}
              placeholder="e.g., /data/cube-store"
              className="mt-1 h-8 text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* Cloud details */}
      {location === 'cloud' && (
        <div className="space-y-4">
          {/* Public / Private toggle */}
          <div>
            <Label className="text-xs mb-2 block">Cloud Type</Label>
            <div className="flex gap-2">
              {[
                { value: 'public', label: 'Public Cloud', icon: Globe },
                { value: 'private', label: 'Private Cloud', icon: Lock },
              ].map(opt => {
                const Icon = opt.icon;
                const sel = cloudType === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => { update('cloudType', opt.value); update('provider', ''); update('region', ''); }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                      sel ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-border/80"
                    )}
                  >
                    <Icon className="w-4 h-4" /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider */}
          <div>
            <Label className="text-xs">Provider *</Label>
            <Select value={provider} onValueChange={v => { update('provider', v); update('region', ''); }}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue placeholder="Select a provider…" />
              </SelectTrigger>
              <SelectContent>
                {providers.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region (public cloud only with known regions) */}
          {regions.length > 0 && (
            <div>
              <Label className="text-xs">Region *</Label>
              <Select value={region} onValueChange={v => update('region', v)}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue placeholder="Select region…" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {regions.length === 0 && provider && (
            <div>
              <Label className="text-xs">Region / Endpoint</Label>
              <Input
                value={region}
                onChange={e => update('region', e.target.value)}
                placeholder="e.g., datacenter-eu-1 or https://my-cloud.internal"
                className="mt-1 h-8 text-xs"
              />
            </div>
          )}

          {/* IAM Section */}
          {provider && (
            <div className="bg-secondary/40 rounded-xl p-4 space-y-3 border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold">IAM / Access Configuration</p>
              </div>

              {/* AWS IAM */}
              {provider === 'aws' && (
                <>
                  <IamField label="IAM Role ARN" placeholder="arn:aws:iam::123456789012:role/CubeRole" value={iamConfig?.roleArn || ''} onChange={v => updateIam('roleArn', v)} />
                  <IamField label="Access Key ID" placeholder="AKIAIOSFODNN7EXAMPLE" value={iamConfig?.accessKeyId || ''} onChange={v => updateIam('accessKeyId', v)} />
                  <IamField label="Secret Access Key" placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" value={iamConfig?.secretAccessKey || ''} onChange={v => updateIam('secretAccessKey', v)} secret />
                  <IamField label="S3 Bucket (for pre-aggregations)" placeholder="my-cube-store-bucket" value={iamConfig?.storageBucket || ''} onChange={v => updateIam('storageBucket', v)} />
                </>
              )}

              {/* GCP IAM */}
              {provider === 'gcp' && (
                <>
                  <IamField label="Service Account Email" placeholder="cube-sa@my-project.iam.gserviceaccount.com" value={iamConfig?.serviceAccountEmail || ''} onChange={v => updateIam('serviceAccountEmail', v)} />
                  <IamField label="Service Account Key (JSON)" placeholder='{"type":"service_account",...}' value={iamConfig?.serviceAccountKey || ''} onChange={v => updateIam('serviceAccountKey', v)} secret multiline />
                  <IamField label="GCS Bucket" placeholder="my-cube-store-bucket" value={iamConfig?.storageBucket || ''} onChange={v => updateIam('storageBucket', v)} />
                </>
              )}

              {/* Azure IAM */}
              {provider === 'azure' && (
                <>
                  <IamField label="Tenant ID" placeholder="00000000-0000-0000-0000-000000000000" value={iamConfig?.tenantId || ''} onChange={v => updateIam('tenantId', v)} />
                  <IamField label="Client ID (App Registration)" placeholder="00000000-0000-0000-0000-000000000000" value={iamConfig?.clientId || ''} onChange={v => updateIam('clientId', v)} />
                  <IamField label="Client Secret" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={iamConfig?.clientSecret || ''} onChange={v => updateIam('clientSecret', v)} secret />
                  <IamField label="Storage Account / Container" placeholder="mycubestore/cube-aggregations" value={iamConfig?.storageBucket || ''} onChange={v => updateIam('storageBucket', v)} />
                </>
              )}

              {/* Generic for other providers */}
              {!['aws', 'gcp', 'azure'].includes(provider) && (
                <>
                  <IamField label="API Endpoint" placeholder="https://storage.example.com" value={iamConfig?.endpoint || ''} onChange={v => updateIam('endpoint', v)} />
                  <IamField label="Access Key / Username" placeholder="cube-service-account" value={iamConfig?.accessKeyId || ''} onChange={v => updateIam('accessKeyId', v)} />
                  <IamField label="Secret / Password" placeholder="••••••••••••••••" value={iamConfig?.secretAccessKey || ''} onChange={v => updateIam('secretAccessKey', v)} secret />
                  <IamField label="Storage Path / Bucket" placeholder="/cube-store or my-bucket" value={iamConfig?.storageBucket || ''} onChange={v => updateIam('storageBucket', v)} />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IamField({ label, placeholder, value, onChange, secret, multiline }) {
  return (
    <div>
      <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
        {secret && <Key className="w-3 h-3" />} {label}
      </Label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      ) : (
        <Input
          type={secret ? 'password' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 h-8 text-xs font-mono"
        />
      )}
    </div>
  );
}