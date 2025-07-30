"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarDays, DollarSign, FileText, Upload, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'

export function PatientView() {
    const { treatments, claims, users, addClaim } = useAppStore()
    const [showClaimForm, setShowClaimForm] = useState(false)
    const [formData, setFormData] = useState({
        treatmentId: '',
        documents: [] as string[]
    })

    const patientId = '3' // Current patient (John Smith)
    const availableTreatments = treatments.filter(t =>
        t.patientId === patientId &&
        t.status === 'submitted' &&
        !claims.some(c => c.treatmentId === t.id)
    )
    const patientClaims = claims.filter(c => c.patientId === patientId)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.treatmentId) return

        const treatment = treatments.find(t => t.id === formData.treatmentId)
        if (!treatment) return

        addClaim({
            patientId,
            patientName: treatment.patientName,
            doctorId: treatment.doctorId,
            doctorName: treatment.doctorName,
            treatmentId: treatment.id,
            diagnosis: treatment.diagnosis,
            cost: treatment.cost,
            documents: formData.documents.length > 0 ? formData.documents : ['medical_report.pdf']
        })

        setFormData({
            treatmentId: '',
            documents: []
        })
        setShowClaimForm(false)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const fileNames = files.map(f => f.name)
        setFormData(prev => ({ ...prev, documents: [...prev.documents, ...fileNames] }))
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Patient Portal</h2>
                    <p className="text-gray-600">File claims and track their status</p>
                </div>
                <Button
                    onClick={() => setShowClaimForm(!showClaimForm)}
                    className="flex items-center gap-2"
                    disabled={availableTreatments.length === 0}
                >
                    <Plus className="w-4 h-4" />
                    File New Claim
                </Button>
            </div>

            {availableTreatments.length === 0 && !showClaimForm && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500">
                            No treatments available for claims. Please visit a doctor first.
                        </p>
                    </CardContent>
                </Card>
            )}

            {showClaimForm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            File Insurance Claim
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Select Treatment</label>
                                <Select
                                    value={formData.treatmentId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, treatmentId: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a treatment to claim" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTreatments.map(treatment => (
                                            <SelectItem key={treatment.id} value={treatment.id}>
                                                {treatment.diagnosis} - ${treatment.cost} ({treatment.date})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Upload Documents</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <Input
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileUpload}
                                        className="mb-2"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Upload medical reports, bills, or other supporting documents
                                    </p>
                                    {formData.documents.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium">Uploaded files:</p>
                                            <ul className="text-sm text-gray-600">
                                                {formData.documents.map((doc, index) => (
                                                    <li key={index} className="flex items-center gap-2">
                                                        <Upload className="w-4 h-4" />
                                                        {doc}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={!formData.treatmentId}>
                                    Submit Claim
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowClaimForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>My Claims</CardTitle>
                </CardHeader>
                <CardContent>
                    {patientClaims.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No claims filed yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Claim ID</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patientClaims.map(claim => (
                                    <TableRow key={claim.id}>
                                        <TableCell className="font-medium">#{claim.id}</TableCell>
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
                                                <Badge variant={getStatusColor(claim.status) as any}>
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
