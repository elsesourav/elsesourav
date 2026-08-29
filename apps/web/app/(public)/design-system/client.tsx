'use client';

import * as React from 'react';
import {
  Button,
  Badge,
  Avatar,
  Separator,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  FormField,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  GlassSurface,
  Alert,
  AlertTitle,
  AlertDescription,
  EmptyState,
  ErrorState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  StatCard,
} from '@elsesourav/ui';
import { Sparkles, Terminal, Activity, Layers } from 'lucide-react';

export function DesignSystemClient() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [switchState, setSwitchState] = React.useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div>
        <Breadcrumb>
          <BreadcrumbItem>
            <span className="hover:text-white cursor-pointer">Home</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-white font-medium">Design System</span>
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="flex items-center gap-3 mt-4">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Design System & Component Library</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Production-grade, accessible, and responsive UI primitives built for ElseSourav.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 1. Metric Stats */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">1. Metric & Telemetry Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Applications" value="24" change="+3 this month" changeType="positive" icon={Terminal} />
          <StatCard label="Monthly Active Users" value="18.2K" change="+12.4%" changeType="positive" icon={Activity} />
          <StatCard label="Support Queue" value="3 Open" change="-2 resolved" changeType="positive" />
          <StatCard label="System Health" value="99.98%" change="Operational" changeType="neutral" />
        </div>
      </section>

      {/* 2. Glass Surfaces & Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">2. Glass Surfaces & Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassSurface className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Layers className="w-4 h-4" /> Glassmorphic Surface Container
            </div>
            <p className="text-sm text-zinc-300">
              Hardware-accelerated backdrop blur with variable light intensities for dark modern aesthetics.
            </p>
          </GlassSurface>

          <Card>
            <CardHeader>
              <CardTitle>Standard Card Layout</CardTitle>
              <CardDescription>Clean bordered container with semantic header, content, and footer.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400">Tokens adapted from V1 design specifications.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Buttons & Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">3. Buttons & Badges</h2>
        <Card className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline Action</Button>
            <Button variant="ghost">Ghost Action</Button>
            <Button variant="danger">Danger Action</Button>
            <Button variant="primary" loading>Processing</Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Active / Live</Badge>
            <Badge variant="warning">Pending Review</Badge>
            <Badge variant="info">New Release</Badge>
            <Badge variant="outline">v2.0.0</Badge>
          </div>
        </Card>
      </section>

      {/* 4. Form Primitives */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">4. Form Controls</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Full Name" required description="Your public developer identity">
              <Input placeholder="Sourav" defaultValue="Sourav" />
            </FormField>

            <FormField label="Role / Category" required>
              <Select
                options={[
                  { value: 'engineer', label: 'Systems Engineer' },
                  { value: 'designer', label: 'UI/UX Designer' },
                  { value: 'student', label: 'Student' },
                ]}
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Bio" description="Markdown supported short biography">
                <Textarea placeholder="Tell the community about what you build..." />
              </FormField>
            </div>

            <div className="space-y-4">
              <Checkbox label="Subscribe to Devlog newsletters" defaultChecked />
              <Checkbox label="Allow analytics telemetry for performance optimization" defaultChecked />
            </div>

            <div>
              <Switch
                label="High Contrast Glass Effects"
                description="Enable GPU accelerated backdrop filters"
                checked={switchState}
                onCheckedChange={setSwitchState}
              />
            </div>
          </div>
        </Card>
      </section>

      {/* 5. Feedback & Alerts */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">5. Feedback & State Boundaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert variant="info">
            <AlertTitle>System Notice</AlertTitle>
            <AlertDescription>The ElseSourav API gateway is running on Next.js 15 App Router.</AlertDescription>
          </Alert>
          <Alert variant="success">
            <AlertTitle>Database Connected</AlertTitle>
            <AlertDescription>PostgreSQL connection pool initialized with 0 latency spikes.</AlertDescription>
          </Alert>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <EmptyState
            title="No Bookmarks Found"
            description="You haven't saved any applications to your personal software library yet."
            action={<Button size="sm">Browse Applications</Button>}
          />
          <ErrorState
            title="Telemetry Stream Disconnected"
            description="Connection to the real-time websocket endpoint timed out."
            onRetry={() => alert('Retrying connection...')}
          />
        </div>
      </section>

      {/* 6. Data Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">6. Data Table Display</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-white">Terminal Pro</TableCell>
              <TableCell>Developer Tools</TableCell>
              <TableCell>v2.1.0</TableCell>
              <TableCell><Badge variant="success">Published</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-white">Focus Keeper</TableCell>
              <TableCell>Productivity</TableCell>
              <TableCell>v1.4.2</TableCell>
              <TableCell><Badge variant="info">Updated</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* 7. Navigation & Overlays */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">7. Navigation & Overlays</h2>
        <Card className="p-6 space-y-6">
          <Tabs defaultValue="catalog">
            <TabsList>
              <TabsTrigger value="catalog">Applications Catalog</TabsTrigger>
              <TabsTrigger value="devlogs">Engineering Devlogs</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>
            <TabsContent value="catalog" className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
              <p className="text-sm text-zinc-300">Catalog of standalone web and desktop productivity tools.</p>
            </TabsContent>
            <TabsContent value="devlogs" className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
              <p className="text-sm text-zinc-300">Deep-dive technical architectural articles and benchmarks.</p>
            </TabsContent>
            <TabsContent value="documentation" className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800/60">
              <p className="text-sm text-zinc-300">API references and deployment guides for developers.</p>
            </TabsContent>
          </Tabs>

          <div className="pt-4 flex items-center gap-4">
            <Button onClick={() => setDialogOpen(true)}>Open Modal Dialog</Button>
            <Avatar alt="Sourav" fallback="ES" size="lg" />
          </div>
        </Card>
      </section>

      {/* Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>System Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to promote this release build to production?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-zinc-300">
            All 11 workspace packages have passed static typechecking, linting, and automated tests.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setDialogOpen(false)}>Confirm Promotion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
