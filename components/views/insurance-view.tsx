"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarDays, DollarSign, FileText, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

export function InsuranceView() {
    const { claims, reviewClaim } = useAppStore()
    const [selectedClaim, setSelectedClaim] = useState<string | null>(null)
    const [reviewNotes, setReviewNotes] = useState('')

    const pendingClaims = claims.filter(c => c.status === 'pending')
    const reviewedClaims = claims.filter(c => c.status !== 'pending')

    const handleReview = (claimId: string, status: 'approved' | 'rejected') => {
        reviewClaim(claimId, status, reviewNotes)
        setSelectedClaim(null)
        setReviewNotes('')
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
            default: return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning'
            case 'approved': return 'default'
            case 'rejected': return 'destructive'
            default: return 'secondary'
        }
    }

    const selectedClaimData = claims.find(c => c.id === selectedClaim)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Insurance Review Dashboard</h2>
                    <p className="text-gray-600">Review and process insurance claims</p>
                </div>
                <div className="flex gap-4">
                    <Card className="p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{pendingClaims.length}</p>
                            <p className="text-sm text-gray-600">Pending Reviews</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {reviewedClaims.filter(c => c.status === 'approved').length}
                            </p>
                            <p className="text-sm text-gray-600">Approved</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                                {reviewedClaims.filter(c => c.status === 'rejected').length}
                            </p>
                            <p className="text-sm text-gray-600">Rejected</p>
                        </div>
                    </Card>
                </div>
            </div>

            {pendingClaims.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            Pending Claims Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Claim ID</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingClaims.map(claim => (
                                    <TableRow key={claim.id}>
                                        <TableCell className="font-medium">#{claim.id}</TableCell>
                                        <TableCell>{claim.patientName}</TableCell>
                                        <TableCell>{claim.doctorName}</TableCell>
                                        <TableCell>{claim.diagnosis}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            ${claim.cost}
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4" />
                                            {claim.submittedDate}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelectedClaim(claim.id)}
                                                className="flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {selectedClaim && selectedClaimData && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Review Claim #{selectedClaim}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-gray-900">Patient Information</h4>
                                <p className="text-gray-600">{selectedClaimData.patientName}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Doctor</h4>
                                <p className="text-gray-600">{selectedClaimData.doctorName}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Diagnosis</h4>
                                <p className="text-gray-600">{selectedClaimData.diagnosis}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Treatment Cost</h4>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    ${selectedClaimData.cost}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Submitted Date</h4>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4" />
                                    {selectedClaimData.submittedDate}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Documents</h4>
                                <div className="space-y-1">
                                    {selectedClaimData.documents.map((doc, index) => (
                                        <p key={index} className="text-gray-600 text-sm flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            {doc}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Review Notes</label>
                            <Textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add notes about your review decision..."
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleReview(selectedClaim, 'approved')}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Approve Claim
                            </Button>
                            <Button
                                onClick={() => handleReview(selectedClaim, 'rejected')}
                                variant="destructive"
                                className="flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject Claim
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedClaim(null)
                                    setReviewNotes('')
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Claims History</CardTitle>
                </CardHeader>
                <CardContent>
                    {claims.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No claims to review yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Claim ID</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {claims.map(claim => (
                                    <TableRow key={claim.id}>
                                        <TableCell className="font-medium">#{claim.id}</TableCell>
                                        <TableCell>{claim.patientName}</TableCell>
                                        <TableCell>{claim.doctorName}</TableCell>
                                        <TableCell>{claim.diagnosis}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            ${claim.cost}
                                        </TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4" />
                                            {claim.submittedDate}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(claim.status)}
                                                <Badge variant={getStatusColor(claim.status) as "default" | "secondary" | "destructive" | "outline"}>
                                                    {claim.status}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {claim.insuranceNotes && (
                                                <p className="text-sm text-gray-600">{claim.insuranceNotes}</p>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
