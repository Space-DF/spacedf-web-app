import {
  SpacePreviewImage,
  SpaceSettings,
} from '@/containers/space/space-settings'

export default function WorkspaceSettings() {
  return (
    <div className="relative flex min-h-dvh bg-brand-background-fill-surface">
      <SpacePreviewImage />
      <SpaceSettings />
    </div>
  )
}
