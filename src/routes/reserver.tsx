import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reserver')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/reserver"!</div>
}
