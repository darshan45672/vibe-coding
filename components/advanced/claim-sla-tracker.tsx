"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarDays, DollarSign, Clock, Eye, Brain, Activity } from 'lucide-react'

export function ClaimSLATracker() {
    const { claimSLAs, claims, updateClaimSLA, escalateClaim } = useAppStore()
    const [selectedSLA, setSelectedSLA] = useState<string | null>(null)

    const getStageProgress = (stage: string) => {
        const stages = ['submitted', 'under_review', 'additional_docs_required', 'approved', 'rejected']
        const currentIndex = stages.indexOf(stage)
        return ((currentIndex + 1) / stages.length) * 100
    }

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'submitted': return 'bg-blue-100 text-blue-800'
            case 'under_review': return 'bg-yellow-100 text-yellow-800'
            case 'additional_docs_required': return 'bg-orange-100 text-orange-800'
            case 'approved': return 'bg-green-100 text-green-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'high': return 'bg-orange-100 text-orange-800'
            case 'urgent': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const calculateDaysRemaining = (expectedDate: string) => {
        const today = new Date()
        const expected = new Date(expectedDate)
        const diffTime = expected.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const isOverdue = (expectedDate: string, actualDate?: string) => {
        if (actualDate) return false
        const today = new Date()
        const expected = new Date(expectedDate)
        return today > expected
    }

    const slaStats = {
        total: claimSLAs.length,
        onTime: claimSLAs.filter(sla => !isOverdue(sla.expectedCompletionDate, sla.actualCompletionDate)).length,
        overdue: claimSLAs.filter(sla => isOverdue(sla.expectedCompletionDate, sla.actualCompletionDate)).length,
        escalated: claimSLAs.filter(sla => sla.isEscalated).length,
        avgProcessingTime: claimSLAs.filter(sla => sla.actualCompletionDate).length > 0 
            ? Math.round(claimSLAs.filter(sla => sla.actualCompletionDate).reduce((sum, sla) => {
                const submitted = new Date('2025-07-25') // Mock submitted date
                const completed = new Date(sla.actualCompletionDate!)
                return sum + ((completed.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24))
            }, 0) / claimSLAs.filter(sla => sla.actualCompletionDate).length)
            : 0
    }

    return (
        <div className="space-y-6">
            {/* SLA Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Claim SLA Tracker
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{slaStats.total}</div>
                            <div className="text-sm text-gray-600">Total Claims</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{slaStats.onTime}</div>
                            <div className="text-sm text-gray-600">On Time</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{slaStats.overdue}</div>
                            <div className="text-sm text-gray-600">Overdue</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{slaStats.escalated}</div>
                            <div className="text-sm text-gray-600">Escalated</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{slaStats.avgProcessingTime}</div>
                            <div className="text-sm text-gray-600">Avg Days</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SLA Tracking Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Claim Processing Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Claim ID</TableHead>
                                <TableHead>Current Stage</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Expected Date</TableHead>
                                <TableHead>Days Remaining</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {claimSLAs.map(sla => {
                                const daysRemaining = calculateDaysRemaining(sla.expectedCompletionDate)
                                const overdue = isOverdue(sla.expectedCompletionDate, sla.actualCompletionDate)
                                
                                return (
                                    <TableRow key={sla.id}>
                                        <TableCell className="font-medium">#{sla.claimId}</TableCell>
                                        <TableCell>
                                            <Badge className={getStageColor(sla.stage)}>
                                                {sla.stage.replace(/_/g, ' ').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-24">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full" 
                                                        style={{ width: `${getStageProgress(sla.stage)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {Math.round(getStageProgress(sla.stage))}%
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPriorityColor(sla.priority)}>
                                                {sla.priority.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{sla.expectedCompletionDate}</TableCell>
                                        <TableCell>
                                            <span className={overdue ? 'text-red-600 font-medium' : 
                                                daysRemaining <= 1 ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                                                {overdue ? `${Math.abs(daysRemaining)} days overdue` : 
                                                 daysRemaining <= 0 ? 'Due today' : `${daysRemaining} days`}
                                            </span>
                                        </TableCell>
                                        <TableCell>{sla.assignedTo}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {sla.isEscalated && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        🚨 L{sla.escalationLevel}
                                                    </Badge>
                                                )}
                                                {sla.remindersSent > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        📧 {sla.remindersSent}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => setSelectedSLA(sla.id)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {!sla.isEscalated && overdue && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive"
                                                        onClick={() => escalateClaim(sla.claimId)}
                                                    >
                                                        🚨
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* SLA Details Modal */}
            {selectedSLA && (
                <Card>
                    <CardHeader>
                        <CardTitle>SLA Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const sla = claimSLAs.find(s => s.id === selectedSLA)
                            if (!sla) return null

                            const claim = claims.find(c => c.id === sla.claimId)
                            const overdue = isOverdue(sla.expectedCompletionDate, sla.actualCompletionDate)
                            const daysRemaining = calculateDaysRemaining(sla.expectedCompletionDate)

                            return (
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium mb-3">Claim Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Claim ID:</strong> #{sla.claimId}</div>
                                                <div><strong>Patient:</strong> {claim?.patientName}</div>
                                                <div><strong>Amount:</strong> ₹{claim?.cost.toLocaleString()}</div>
                                                <div><strong>Current Stage:</strong> 
                                                    <Badge className={`ml-2 ${getStageColor(sla.stage)}`}>
                                                        {sla.stage.replace(/_/g, ' ').toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-3">SLA Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Priority:</strong> 
                                                    <Badge className={`ml-2 ${getPriorityColor(sla.priority)}`}>
                                                        {sla.priority.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div><strong>Expected Completion:</strong> {sla.expectedCompletionDate}</div>
                                                <div><strong>Assigned To:</strong> {sla.assignedTo}</div>
                                                <div><strong>Status:</strong> 
                                                    <span className={overdue ? 'text-red-600 font-medium ml-2' : 'text-green-600 font-medium ml-2'}>
                                                        {overdue ? `${Math.abs(daysRemaining)} days overdue` : 'On track'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3">Processing Timeline</h4>
                                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                            <div 
                                                className="bg-blue-600 h-3 rounded-full" 
                                                style={{ width: `${getStageProgress(sla.stage)}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Progress: {Math.round(getStageProgress(sla.stage))}% complete
                                        </div>
                                    </div>

                                    {sla.isEscalated && (
                                        <div>
                                            <h4 className="font-medium mb-3">Escalation Details</h4>
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <div className="text-sm space-y-1">
                                                    <div><strong>Escalation Level:</strong> Level {sla.escalationLevel}</div>
                                                    <div><strong>Escalated On:</strong> {sla.escalationDate}</div>
                                                    <div><strong>Reminders Sent:</strong> {sla.remindersSent}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4">
                                        <Button size="sm">
                                            Update Stage
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Send Reminder
                                        </Button>
                                        {!sla.isEscalated && (
                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                onClick={() => escalateClaim(sla.claimId)}
                                            >
                                                Escalate
                                            </Button>
                                        )}
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => setSelectedSLA(null)}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )
                        })()}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
