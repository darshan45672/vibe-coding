"use client"

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, DollarSign, CreditCard, Clock, Eye, Brain, Activity } from 'lucide-react'

export function FraudDetection() {
    const { fraudAlerts, claims, detectFraud } = useAppStore()
    const [selectedAlert, setSelectedAlert] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [investigatorNotes, setInvestigatorNotes] = useState('')

    const severityColors = {
        low: 'bg-yellow-100 text-yellow-800',
        medium: 'bg-orange-100 text-orange-800',
        high: 'bg-red-100 text-red-800',
        critical: 'bg-red-200 text-red-900'
    }

    const severityIcons = {
        low: '⚠️',
        medium: '🔶',
        high: '🔴',
        critical: '🚨'
    }

    const runFraudCheck = async (claimId: string) => {
        setIsAnalyzing(true)
        try {
            await detectFraud(claimId)
        } catch (error) {
            console.error('Fraud detection failed:', error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const fraudStats = {
        total: fraudAlerts.length,
        active: fraudAlerts.filter(a => a.status === 'active').length,
        resolved: fraudAlerts.filter(a => a.status === 'resolved').length,
        falsePositive: fraudAlerts.filter(a => a.status === 'false_positive').length,
        avgConfidence: fraudAlerts.reduce((sum, a) => sum + a.confidence, 0) / fraudAlerts.length || 0
    }

    return (
        <div className="space-y-6">
            {/* Fraud Detection Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI Fraud Detection System
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{fraudStats.total}</div>
                            <div className="text-sm text-gray-600">Total Alerts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{fraudStats.active}</div>
                            <div className="text-sm text-gray-600">Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{fraudStats.resolved}</div>
                            <div className="text-sm text-gray-600">Resolved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{fraudStats.falsePositive}</div>
                            <div className="text-sm text-gray-600">False Positive</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {Math.round(fraudStats.avgConfidence * 100)}%
                            </div>
                            <div className="text-sm text-gray-600">Avg Confidence</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Fraud Check</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-center">
                        <Select>
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select claim to analyze" />
                            </SelectTrigger>
                            <SelectContent>
                                {claims.map(claim => (
                                    <SelectItem key={claim.id} value={claim.id}>
                                        Claim #{claim.id} - {claim.patientName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button 
                            onClick={() => runFraudCheck('1')} 
                            disabled={isAnalyzing}
                            className="flex items-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4" />
                                    Run AI Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Fraud Alerts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Fraud Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Alert ID</TableHead>
                                <TableHead>Claim ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Confidence</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fraudAlerts.map(alert => (
                                <TableRow key={alert.id}>
                                    <TableCell className="font-medium">{alert.id}</TableCell>
                                    <TableCell>{alert.claimId}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {alert.type.replace(/_/g, ' ').toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={severityColors[alert.severity]}>
                                            {severityIcons[alert.severity]} {alert.severity.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full" 
                                                    style={{ width: `${alert.confidence * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm">
                                                {Math.round(alert.confidence * 100)}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={alert.status === 'active' ? 'destructive' : 'default'}
                                        >
                                            {alert.status === 'active' && <Clock className="w-3 h-3 mr-1" />}
                                            {alert.status === 'resolved' && '✅'}
                                            {alert.status === 'false_positive' && '❌'}
                                            {alert.status.replace(/_/g, ' ').toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{alert.detectedDate}</TableCell>
                                    <TableCell>
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => setSelectedAlert(alert.id)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Alert Details Modal */}
            {selectedAlert && (
                <Card>
                    <CardHeader>
                        <CardTitle>Alert Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const alert = fraudAlerts.find(a => a.id === selectedAlert)
                            if (!alert) return null

                            return (
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Alert Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Type:</strong> {alert.type.replace(/_/g, ' ')}</div>
                                                <div><strong>Severity:</strong> {alert.severity}</div>
                                                <div><strong>Confidence:</strong> {Math.round(alert.confidence * 100)}%</div>
                                                <div><strong>Detected:</strong> {alert.detectedDate}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">Description</h4>
                                            <p className="text-sm text-gray-600">{alert.description}</p>
                                        </div>
                                    </div>

                                    {alert.status === 'active' && (
                                        <div>
                                            <h4 className="font-medium mb-2">Investigation Notes</h4>
                                            <Textarea
                                                placeholder="Add investigation notes..."
                                                value={investigatorNotes}
                                                onChange={(e) => setInvestigatorNotes(e.target.value)}
                                            />
                                            <div className="flex gap-2 mt-3">
                                                <Button size="sm" variant="default">
                                                    Mark as Resolved
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    Mark as False Positive
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    Escalate
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <Button 
                                        variant="outline" 
                                        onClick={() => setSelectedAlert(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            )
                        })()}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
