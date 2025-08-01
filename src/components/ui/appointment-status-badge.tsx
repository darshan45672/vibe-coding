import { Badge } from '@/components/ui/badge'
import { AppointmentStatus } from '@prisma/client'

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
}

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}

const statusColors: Record<AppointmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ACCEPTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  return (
    <Badge className={statusColors[status]}>
      {statusLabels[status]}
    </Badge>
  )
}
