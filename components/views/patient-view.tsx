"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CalendarDays, DollarSign, FileText, Upload, Plus, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'

export function PatientView() {
    const { treatments, claims, users, addClaim, currentUser, currentRole } = useAppStore()
    const [showClaimForm, setShowClaimForm] = useState(false)
    const [showAppointmentForm, setShowAppointmentForm] = useState(false)
    const [formData, setFormData] = useState({
        treatmentId: '',
        documents: [] as string[]
    })
    const [appointmentData, setAppointmentData] = useState({
        doctorId: '',
        date: '',
        time: '',
        reason: ''
    })

    // Get current patient ID from the store, fallback to patient '3' for demo
    const patientId = currentRole === 'patient' ? (currentUser?.id || '3') : '3'
    const patientName = currentRole === 'patient' ? (currentUser?.name || 'John Smith') : 'John Smith'
    const doctors = users.filter(u => u.role === 'doctor')
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
            patientName,
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

    const handleAppointmentSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!appointmentData.doctorId || !appointmentData.date || !appointmentData.time || !appointmentData.reason) return

        // Simulate appointment booking
        alert(`Appointment booked successfully!\nDoctor: ${doctors.find(d => d.id === appointmentData.doctorId)?.name}\nDate: ${appointmentData.date}\nTime: ${appointmentData.time}\nReason: ${appointmentData.reason}`)

        setAppointmentData({
            doctorId: '',
            date: '',
            time: '',
            reason: ''
        })
        setShowAppointmentForm(false)
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
                    <p className="text-gray-600">Book appointments, file claims and track their status</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Current Patient: {patientName} | Available Treatments: {availableTreatments.length}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowAppointmentForm(!showAppointmentForm)}
                        className="flex items-center gap-2"
                        variant="outline"
                    >
                        <Calendar className="w-4 h-4" />
                        Book Appointment
                    </Button>
                    <Button
                        onClick={() => setShowClaimForm(!showClaimForm)}
                        className="flex items-center gap-2"
                        disabled={availableTreatments.length === 0}
                        title={availableTreatments.length === 0 ? "No treatments available for claims. Visit a doctor first." : "File a new insurance claim"}
                    >
                        <Plus className="w-4 h-4" />
                        File New Claim
                        {availableTreatments.length > 0 && (
                            <Badge variant="secondary" className="ml-2">{availableTreatments.length}</Badge>
                        )}
                    </Button>
                </div>
            </div>

            {showAppointmentForm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Book Appointment with Doctor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Select Doctor</label>
                                    <Select
                                        value={appointmentData.doctorId}
                                        onValueChange={(value) => setAppointmentData(prev => ({ ...prev, doctorId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctors.map(doctor => (
                                                <SelectItem key={doctor.id} value={doctor.id}>
                                                    {doctor.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Preferred Date</label>
                                    <Input
                                        type="date"
                                        value={appointmentData.date}
                                        onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Preferred Time</label>
                                    <Select
                                        value={appointmentData.time}
                                        onValueChange={(value) => setAppointmentData(prev => ({ ...prev, time: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select time slot" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="09:00">09:00 AM</SelectItem>
                                            <SelectItem value="10:00">10:00 AM</SelectItem>
                                            <SelectItem value="11:00">11:00 AM</SelectItem>
                                            <SelectItem value="14:00">02:00 PM</SelectItem>
                                            <SelectItem value="15:00">03:00 PM</SelectItem>
                                            <SelectItem value="16:00">04:00 PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Reason for Visit</label>
                                    <Input
                                        value={appointmentData.reason}
                                        onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Describe your symptoms or reason for visit..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">Book Appointment</Button>
                                <Button type="button" variant="outline" onClick={() => setShowAppointmentForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {availableTreatments.length === 0 && !showClaimForm && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-3">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                                <p className="text-gray-700 font-medium">No treatments available for claims</p>
                                <p className="text-gray-500 text-sm">
                                    You need completed treatments to file insurance claims. 
                                    {treatments.filter(t => t.patientId === patientId).length === 0 
                                        ? " Please visit a doctor first to get treatment."
                                        : " Your treatments may still be pending or already have claims filed."
                                    }
                                </p>
                                {treatments.filter(t => t.patientId === patientId).length > 0 && (
                                    <div className="mt-3 text-xs text-gray-400">
                                        <p>Your treatments:</p>
                                        <ul className="mt-1 space-y-1">
                                            {treatments.filter(t => t.patientId === patientId).map(t => (
                                                <li key={t.id}>
                                                    {t.diagnosis} - {t.status} 
                                                    {claims.some(c => c.treatmentId === t.id) && " (claim filed)"}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
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
