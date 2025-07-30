"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { CalendarDays, DollarSign, FileText, Upload, Plus, Clock, CheckCircle, XCircle, Calendar, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react'

export function PatientView() {
    const { treatments, claims, appointments, users, addClaim, updateClaim, deleteClaim, addAppointment, updateAppointment, deleteAppointment, currentUser } = useAppStore()
    const [showClaimForm, setShowClaimForm] = useState(false)
    const [showAppointmentForm, setShowAppointmentForm] = useState(false)
    const [editingClaim, setEditingClaim] = useState<string | null>(null)
    const [viewingClaim, setViewingClaim] = useState<string | null>(null)
    const [editingAppointment, setEditingAppointment] = useState<string | null>(null)
    const [viewingAppointment, setViewingAppointment] = useState<string | null>(null)
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
    const [appointmentFormData, setAppointmentFormData] = useState({
        doctorId: '',
        date: '',
        time: '',
        reason: ''
    })
    const [isDragOver, setIsDragOver] = useState(false)

    // Get current patient info - fallback to John Smith if no current user
    const currentPatient = currentUser?.role === 'patient' ? currentUser : users.find(u => u.id === '3')
    const patientId = currentPatient?.id || '3'
    const patientName = currentPatient?.name || 'John Smith'

    const doctors = users.filter(u => u.role === 'doctor')

    // Filter treatments for current patient that are submitted and not yet claimed
    const availableTreatments = treatments.filter(t =>
        t.patientId === patientId &&
        t.status === 'submitted' &&
        !claims.some(c => c.treatmentId === t.id)
    )

    // All treatments for current patient (for reference)
    const allPatientTreatments = treatments.filter(t => t.patientId === patientId)

    const patientClaims = claims.filter(c => c.patientId === patientId)

    const patientAppointments = appointments.filter(a => a.patientId === patientId)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (editingClaim) {
            // Update existing claim
            const claim = claims.find(c => c.id === editingClaim)
            if (!claim) {
                alert('Claim not found.')
                return
            }

            if (!formData.treatmentId) {
                alert('Please select a treatment to update the claim.')
                return
            }

            const treatment = treatments.find(t => t.id === formData.treatmentId)
            if (!treatment) {
                alert('Selected treatment not found.')
                return
            }

            const updateData = {
                patientId,
                patientName: treatment.patientName,
                doctorId: treatment.doctorId,
                doctorName: treatment.doctorName,
                treatmentId: treatment.id,
                diagnosis: treatment.diagnosis,
                cost: treatment.cost,
                documents: formData.documents.length > 0 ? formData.documents : claim.documents
            }

            updateClaim(editingClaim, updateData)
            setEditingClaim(null)
        } else {
            // Create new claim
            if (!formData.treatmentId) {
                alert('Please select a treatment to file a claim.')
                return
            }

            const treatment = treatments.find(t => t.id === formData.treatmentId)
            if (!treatment) {
                alert('Selected treatment not found.')
                return
            }

            const claimData = {
                patientId,
                patientName: treatment.patientName,
                doctorId: treatment.doctorId,
                doctorName: treatment.doctorName,
                treatmentId: treatment.id,
                diagnosis: treatment.diagnosis,
                cost: treatment.cost,
                documents: formData.documents.length > 0 ? formData.documents : ['medical_report.pdf']
            }

            addClaim(claimData)
            setShowClaimForm(false)
        }

        setFormData({
            treatmentId: '',
            documents: []
        })
    }

    const handleAppointmentSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!appointmentData.doctorId || !appointmentData.date || !appointmentData.time || !appointmentData.reason) return

        const doctor = doctors.find(d => d.id === appointmentData.doctorId)
        if (!doctor) return

        if (editingAppointment) {
            // Update existing appointment
            updateAppointment(editingAppointment, {
                doctorId: appointmentData.doctorId,
                doctorName: doctor.name,
                date: appointmentData.date,
                time: appointmentData.time,
                reason: appointmentData.reason
            })
            setEditingAppointment(null)
        } else {
            // Create new appointment
            addAppointment({
                patientId,
                patientName,
                doctorId: appointmentData.doctorId,
                doctorName: doctor.name,
                date: appointmentData.date,
                time: appointmentData.time,
                reason: appointmentData.reason
            })
        }

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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files)
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        const validFiles = files.filter(file => allowedTypes.includes(file.type))

        if (validFiles.length !== files.length) {
            alert('Some files were skipped. Only PDF, JPG, JPEG, and PNG files are allowed.')
        }

        const fileNames = validFiles.map(f => f.name)
        setFormData(prev => ({ ...prev, documents: [...prev.documents, ...fileNames] }))
    }

    const handleEditClaim = (claimId: string) => {
        const claim = claims.find(c => c.id === claimId)
        if (!claim) return

        // Only allow editing pending claims
        if (claim.status !== 'pending') {
            alert(`Cannot edit ${claim.status} claims. Only pending claims can be modified.`)
            return
        }

        setEditingClaim(claimId)
        setFormData({
            treatmentId: claim.treatmentId,
            documents: claim.documents
        })
        // Don't show the main claim form, use modal instead
    }

    const handleDeleteClaim = (claimId: string) => {
        const claim = claims.find(c => c.id === claimId)
        if (!claim) return

        // Only allow deleting pending claims
        if (claim.status !== 'pending') {
            alert(`Cannot delete ${claim.status} claims. Only pending claims can be removed.`)
            return
        }

        if (confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
            deleteClaim(claimId)
        }
    }

    const handleViewClaim = (claimId: string) => {
        setViewingClaim(claimId)
    }

    const handleCancelEdit = () => {
        setEditingClaim(null)
        setFormData({
            treatmentId: '',
            documents: []
        })
        // Don't close the main claim form, just reset editing state
    }

    const handleEditAppointment = (appointmentId: string) => {
        const appointment = appointments.find(a => a.id === appointmentId)
        if (!appointment) return

        // Only allow editing scheduled appointments
        if (appointment.status !== 'scheduled') {
            alert(`Cannot edit ${appointment.status} appointments. Only scheduled appointments can be modified.`)
            return
        }

        setEditingAppointment(appointmentId)
        setAppointmentData({
            doctorId: appointment.doctorId,
            date: appointment.date,
            time: appointment.time,
            reason: appointment.reason
        })
        setShowAppointmentForm(true)
    }

    const handleDeleteAppointment = (appointmentId: string) => {
        const appointment = appointments.find(a => a.id === appointmentId)
        if (!appointment) return

        // Only allow deleting scheduled appointments
        if (appointment.status !== 'scheduled') {
            alert(`Cannot delete ${appointment.status} appointments. Only scheduled appointments can be removed.`)
            return
        }

        if (confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
            deleteAppointment(appointmentId)
        }
    }

    const handleCancelAppointmentEdit = () => {
        setEditingAppointment(null)
        setAppointmentData({
            doctorId: '',
            date: '',
            time: '',
            reason: ''
        })
        setShowAppointmentForm(false)
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
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Portal</h2>
                    <p className="text-sm sm:text-base text-gray-600">Book appointments, file claims and track their status</p>
                    {currentPatient && (
                        <div className="mt-2">
                            <Badge variant="outline" className="text-xs sm:text-sm">
                                Welcome, {currentPatient.name}
                            </Badge>
                        </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                        onClick={() => setShowAppointmentForm(!showAppointmentForm)}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto"
                        variant="outline"
                    >
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Book Appointment</span>
                        <span className="sm:hidden">Book</span>
                    </Button>
                    <Button
                        onClick={() => setShowClaimForm(!showClaimForm)}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto"
                        disabled={availableTreatments.length === 0}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">File New Claim</span>
                        <span className="sm:hidden">File Claim</span>
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
                        <form onSubmit={handleAppointmentSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column: Doctor Selection and Details */}
                                <div className="space-y-4">
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
                                                        Dr. {doctor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Doctor Preview Card */}
                                    {appointmentData.doctorId && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            {(() => {
                                                const selectedDoctor = doctors.find(d => d.id === appointmentData.doctorId)
                                                if (!selectedDoctor) return null

                                                return (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <span className="text-xl">👨‍⚕️</span>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-lg text-gray-900">Dr. {selectedDoctor.name}</h3>
                                                                <p className="text-blue-700 font-medium">General Practitioner</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 text-sm text-gray-600">
                                                            <p>📍 Healthcare Center, Main Building</p>
                                                            <p>🕐 Available: Mon-Fri, 9:00 AM - 5:00 PM</p>
                                                            <p>📞 Contact: +1 (555) 123-4567</p>
                                                            <p>🩺 Specialization: Family Medicine</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center">
                                                                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                                                                <span className="ml-1 text-sm text-gray-600">(4.9/5.0)</span>
                                                            </div>
                                                            <span className="text-sm text-green-600 font-medium">• Available</span>
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Appointment Details */}
                                <div className="space-y-4">
                                    {/* Date and Time */}
                                    <div className="space-y-4">
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
                                            <label className="block text-sm font-medium mb-2">Preferred Time Slot</label>
                                            <Select
                                                value={appointmentData.time}
                                                onValueChange={(value) => setAppointmentData(prev => ({ ...prev, time: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select time slot" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="09:00">09:00 AM - Morning</SelectItem>
                                                    <SelectItem value="10:00">10:00 AM - Morning</SelectItem>
                                                    <SelectItem value="11:00">11:00 AM - Morning</SelectItem>
                                                    <SelectItem value="14:00">02:00 PM - Afternoon</SelectItem>
                                                    <SelectItem value="15:00">03:00 PM - Afternoon</SelectItem>
                                                    <SelectItem value="16:00">04:00 PM - Afternoon</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Reason for Visit */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Reason for Visit</label>
                                        <Textarea
                                            value={appointmentData.reason}
                                            onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                                            placeholder="Describe your symptoms or reason for visit..."
                                            className="min-h-[120px]"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Please provide details about your symptoms or the purpose of your visit</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                                <Button type="submit" className="w-full sm:w-auto">Book Appointment</Button>
                                <Button type="button" variant="outline" onClick={() => setShowAppointmentForm(false)} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* {availableTreatments.length === 0 && !showClaimForm && !showAppointmentForm && (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500">
                            No treatments available for claims yet. Please book an appointment with a doctor to receive treatment first.
                        </p>
                    </CardContent>
                </Card>
            )} */}

            {showClaimForm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {editingClaim ? 'Edit Insurance Claim' : 'File Insurance Claim'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {availableTreatments.length > 0 ? (
                                <>
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
                                        <h4 className="font-medium text-blue-900 mb-1">Select Your Treatment</h4>
                                        <p className="text-sm text-blue-800">
                                            Choose from treatments you&apos;ve received from our network doctors. Only submitted treatments that haven&apos;t been claimed yet are available.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Select Treatment to Claim
                                            <span className="text-blue-600 ml-2">({availableTreatments.length} available)</span>
                                        </label>
                                        <Select
                                            value={formData.treatmentId}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, treatmentId: value }))}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a treatment you've undergone..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTreatments.map(treatment => (
                                                    <SelectItem key={treatment.id} value={treatment.id}>
                                                        <div className="flex flex-col py-1">
                                                            <span className="font-medium">{treatment.diagnosis}</span>
                                                            <span className="text-sm text-gray-500">
                                                                {treatment.doctorName} • ${treatment.cost} • {treatment.date}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Upload Supporting Documents</label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${isDragOver
                                                ? 'border-blue-400 bg-blue-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <div className="text-center">
                                                <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                                                <div className="mt-4">
                                                    <label className="cursor-pointer">
                                                        <span className="mt-2 block text-sm font-medium text-gray-900">
                                                            {isDragOver ? 'Drop files here' : 'Drop files here or click to browse'}
                                                        </span>
                                                        <Input
                                                            type="file"
                                                            multiple
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={handleFileUpload}
                                                            className="sr-only"
                                                        />
                                                    </label>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        PDF, JPG, JPEG, PNG up to 10MB each
                                                    </p>
                                                </div>
                                            </div>

                                            {formData.documents.length > 0 && (
                                                <div className="mt-4 border-t border-gray-200 pt-4">
                                                    <p className="text-sm font-medium text-gray-900 mb-2">Uploaded files:</p>
                                                    <div className="space-y-2">
                                                        {formData.documents.map((doc, index) => (
                                                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-4 h-4 text-gray-500" />
                                                                    <span className="text-sm text-gray-700">{doc}</span>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            documents: prev.documents.filter((_, i) => i !== index)
                                                                        }))
                                                                    }}
                                                                    className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                                                                >
                                                                    ×
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button type="submit" disabled={!formData.treatmentId} className="w-full sm:w-auto">
                                            {editingClaim ? 'Update Claim' : 'Submit Claim'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={editingClaim ? handleCancelEdit : () => setShowClaimForm(false)} className="w-full sm:w-auto">
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                                        <h4 className="font-medium text-gray-900 mb-2">No Treatments Available for Claims</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            You need to receive treatment from one of our network doctors before you can file a claim.
                                        </p>
                                        <Button
                                            onClick={() => {
                                                setShowClaimForm(false)
                                                setShowAppointmentForm(true)
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Book Appointment
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">My Treatment History</CardTitle>
                </CardHeader>
                <CardContent>
                    {allPatientTreatments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No treatments recorded yet. Book an appointment to get started!</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[80px]">Date</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[100px]">Doctor</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[120px]">Diagnosis</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[80px]">Cost</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[90px]">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[120px]">Claim Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allPatientTreatments.map(treatment => {
                                        const associatedClaim = claims.find(c => c.treatmentId === treatment.id)
                                        const canClaim = treatment.status === 'submitted' && !associatedClaim

                                        return (
                                            <TableRow key={treatment.id} className="hover:bg-gray-50">
                                                <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <span className="text-gray-900 text-xs sm:text-sm">{treatment.date}</span>
                                                </TableCell>
                                                <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <div className="font-medium text-gray-900 text-xs sm:text-sm">{treatment.doctorName}</div>
                                                </TableCell>
                                                <TableCell className="py-3 sm:py-4 px-2 sm:px-4 max-w-[120px] sm:max-w-xs">
                                                    <div className="truncate text-xs sm:text-sm" title={treatment.diagnosis}>
                                                        {treatment.diagnosis}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <div className="flex items-center gap-1 sm:gap-2 font-medium">
                                                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                        <span className="text-gray-900 text-xs sm:text-sm">${treatment.cost}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
                                                    <Badge variant={treatment.status === 'submitted' ? 'default' : 'secondary'} className="capitalize text-xs">
                                                        {treatment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
                                                    {associatedClaim ? (
                                                        <Badge variant={getStatusColor(associatedClaim.status) as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                                                            <span className="hidden sm:inline">Claimed - </span>{associatedClaim.status}
                                                        </Badge>
                                                    ) : canClaim ? (
                                                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                                            <span className="hidden sm:inline">Available for claim</span>
                                                            <span className="sm:hidden">Available</span>
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Not ready
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">My Claims</CardTitle>
                </CardHeader>
                <CardContent>
                    {patientClaims.length === 0 ? (
                        <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No claims filed yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[80px]">Claim ID</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[100px]">Doctor</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[120px]">Diagnosis</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[80px]">Amount</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[90px]">Submitted</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm min-w-[80px]">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700 py-3 px-2 sm:px-4 text-xs sm:text-sm text-center min-w-[60px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patientClaims.map(claim => (
                                        <TableRow key={claim.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium py-3 sm:py-4 px-2 sm:px-4">
                                                <span className="text-blue-600 text-xs sm:text-sm">#{claim.id}</span>
                                            </TableCell>
                                            <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
                                                <div className="font-medium text-gray-900 text-xs sm:text-sm">{claim.doctorName}</div>
                                            </TableCell>
                                            <TableCell className="py-3 sm:py-4 px-2 sm:px-4 max-w-[120px] sm:max-w-xs">
                                                <div className="truncate text-xs sm:text-sm" title={claim.diagnosis}>
                                                    {claim.diagnosis}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
                                                <div className="flex items-center gap-1 sm:gap-2 font-medium">
                                                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                    <span className="text-gray-900 text-xs sm:text-sm">${claim.cost}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
                                                <div className="flex items-center gap-1 sm:gap-2 text-gray-600">
                                                    <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span className="text-xs sm:text-sm">{claim.submittedDate}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    {getStatusIcon(claim.status)}
                                                    <Badge variant={getStatusColor(claim.status) as "default" | "secondary" | "destructive" | "outline"} className="capitalize text-xs">
                                                        {claim.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 sm:py-4 px-2 sm:px-4">
                                                <div className="flex justify-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-gray-100"
                                                            >
                                                                <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewClaim(claim.id)}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleEditClaim(claim.id)}
                                                                disabled={claim.status !== 'pending'}
                                                                className={claim.status !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''}
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit Claim
                                                                {claim.status !== 'pending' && (
                                                                    <span className="ml-2 text-xs text-gray-400">(Pending only)</span>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClaim(claim.id)}
                                                                disabled={claim.status !== 'pending'}
                                                                className={`${claim.status !== 'pending' ? 'opacity-50 cursor-not-allowed' : 'text-red-600 focus:text-red-600'}`}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete Claim
                                                                {claim.status !== 'pending' && (
                                                                    <span className="ml-2 text-xs text-gray-400">(Pending only)</span>
                                                                )}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Claim Details Modal */}
            <Dialog open={!!viewingClaim} onOpenChange={(open) => !open && setViewingClaim(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Claim Details - #{viewingClaim}</span>
                            <span className="sm:hidden">Claim #{viewingClaim}</span>
                        </DialogTitle>
                    </DialogHeader>

                    {(() => {
                        const claim = claims.find(c => c.id === viewingClaim)
                        if (!claim) return <p>Claim not found</p>

                        return (
                            <div className="space-y-4 sm:space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Patient Name</label>
                                            <p className="text-sm sm:text-base text-gray-900 font-medium">{claim.patientName}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Doctor</label>
                                            <p className="text-sm sm:text-base text-gray-900 font-medium">{claim.doctorName}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Diagnosis</label>
                                            <p className="text-sm sm:text-base text-gray-900">{claim.diagnosis}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Cost</label>
                                            <p className="text-sm sm:text-base text-gray-900 font-semibold flex items-center gap-1">
                                                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                ${claim.cost}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Dates */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Status & Timeline</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Submitted Date</label>
                                            <p className="text-sm sm:text-base text-gray-900 flex items-center gap-1">
                                                <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                                {claim.submittedDate}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Status</label>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(claim.status)}
                                                <Badge variant={getStatusColor(claim.status) as "default" | "secondary" | "destructive" | "outline"} className="capitalize text-xs">
                                                    {claim.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        {claim.reviewedDate && (
                                            <div>
                                                <label className="text-xs sm:text-sm font-medium text-gray-600">Reviewed Date</label>
                                                <p className="text-sm sm:text-base text-gray-900 flex items-center gap-1">
                                                    <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                    {claim.reviewedDate}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Insurance Notes */}
                                {claim.insuranceNotes && (
                                    <div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Insurance Notes</h3>
                                        <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm sm:text-base text-blue-900">{claim.insuranceNotes}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Documents */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Supporting Documents</h3>
                                    <div className="space-y-2">
                                        {claim.documents.map((doc, index) => (
                                            <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors">
                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                                <span className="text-sm sm:text-base text-gray-700 flex-1 truncate">{doc}</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm px-2 sm:px-3"
                                                >
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })()}

                    <DialogFooter className="border-t pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
                        {(() => {
                            const claim = claims.find(c => c.id === viewingClaim)
                            if (!claim) return null

                            return claim.status === 'pending' ? (
                                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                    <Button
                                        onClick={() => {
                                            setViewingClaim(null)
                                            handleEditClaim(claim.id)
                                        }}
                                        className="flex items-center justify-center gap-2 w-full sm:w-auto"
                                        variant="outline"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Claim
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setViewingClaim(null)
                                            handleDeleteClaim(claim.id)
                                        }}
                                        className="flex items-center justify-center gap-2 w-full sm:w-auto"
                                        variant="destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Claim
                                    </Button>
                                    <Button
                                        onClick={() => setViewingClaim(null)}
                                        variant="ghost"
                                        className="w-full sm:w-auto sm:ml-auto"
                                    >
                                        Close
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-2 w-full">
                                    <Button
                                        disabled
                                        className="flex items-center justify-center gap-2 w-full sm:w-auto"
                                        variant="outline"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Claim
                                    </Button>
                                    <Button
                                        disabled
                                        className="flex items-center justify-center gap-2 w-full sm:w-auto"
                                        variant="outline"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Claim
                                    </Button>
                                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500 mx-2 py-2 sm:py-0">
                                        Only pending claims can be edited or deleted
                                    </div>
                                    <Button
                                        onClick={() => setViewingClaim(null)}
                                        variant="ghost"
                                        className="w-full sm:w-auto sm:ml-auto"
                                    >
                                        Close
                                    </Button>
                                </div>
                            )
                        })()}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Claim Modal */}
            <Dialog open={!!editingClaim} onOpenChange={(open) => !open && handleCancelEdit()}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Edit Claim - #{editingClaim}</span>
                            <span className="sm:hidden">Edit #{editingClaim}</span>
                        </DialogTitle>
                    </DialogHeader>

                    {(() => {
                        const claim = claims.find(c => c.id === editingClaim)
                        if (!claim) return <p>Claim not found</p>

                        return (
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                {/* Current Claim Info */}
                                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Current Claim Information</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-800">
                                        <p><span className="font-medium">Patient:</span> {claim.patientName}</p>
                                        <p><span className="font-medium">Doctor:</span> {claim.doctorName}</p>
                                        <p><span className="font-medium">Diagnosis:</span> {claim.diagnosis}</p>
                                        <p><span className="font-medium">Cost:</span> ${claim.cost}</p>
                                    </div>
                                </div>

                                {/* Treatment Selection */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            Treatment Selection
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-600 mb-4">
                                            Choose from your available treatments. You can switch to any submitted treatment that hasn&apos;t been claimed yet.
                                        </p>
                                    </div>

                                    {/* Current Treatment Card */}
                                    <div className="relative p-4 sm:p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
                                        {/* Background pattern */}
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full opacity-20 -mr-10 -mt-10"></div>
                                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-100 rounded-full opacity-20 -ml-8 -mb-8"></div>

                                        <div className="relative">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">✓</span>
                                                    </div>
                                                    <h5 className="text-sm font-semibold text-green-900">Current Treatment Selection</h5>
                                                </div>
                                                <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-full shadow-sm">
                                                    Active Claim
                                                </Badge>
                                            </div>

                                            <div className="space-y-3">
                                                {/* Main diagnosis */}
                                                <div className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-green-200/50">
                                                    <span className="text-green-700 font-medium text-xs uppercase tracking-wide">Diagnosis</span>
                                                    <p className="text-green-900 font-semibold text-sm mt-1">{claim.diagnosis}</p>
                                                </div>

                                                {/* Information grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <div className="flex items-center gap-2 p-2.5 bg-white/50 backdrop-blur-sm rounded-lg border border-green-200/30">
                                                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white text-xs">👨‍⚕️</span>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-green-600 font-medium">Doctor</p>
                                                            <p className="text-green-900 font-semibold text-xs truncate">{claim.doctorName}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 p-2.5 bg-white/50 backdrop-blur-sm rounded-lg border border-green-200/30">
                                                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <DollarSign className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-green-600 font-medium">Cost</p>
                                                            <p className="text-green-900 font-bold text-xs">${claim.cost}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 p-2.5 bg-white/50 backdrop-blur-sm rounded-lg border border-green-200/30">
                                                        <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <Calendar className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs text-green-600 font-medium">Date</p>
                                                            <p className="text-green-900 font-semibold text-xs">{treatments.find(t => t.id === claim.treatmentId)?.date}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bottom accent */}
                                            <div className="mt-4 h-1 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-full shadow-sm"></div>
                                        </div>
                                    </div>

                                    {/* Treatment Selection Dropdown */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-semibold text-gray-900">
                                                Select Different Treatment
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs px-2 py-1">
                                                    {treatments.filter(t =>
                                                        t.patientId === patientId &&
                                                        t.status === 'submitted' &&
                                                        !claims.some(c => c.treatmentId === t.id && c.id !== editingClaim)
                                                    ).length} alternatives
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Select
                                                value={formData.treatmentId}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, treatmentId: value }))}
                                                required
                                            >
                                                <SelectTrigger className="h-auto min-h-[54px] p-4 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors bg-white">
                                                    <SelectValue placeholder="Browse and select a different treatment option..." />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px] w-[500px]">
                                                    {/* Include current treatment plus available ones */}
                                                    {treatments
                                                        .filter(t =>
                                                            t.patientId === patientId &&
                                                            (t.id === claim.treatmentId ||
                                                                (t.status === 'submitted' && !claims.some(c => c.treatmentId === t.id && c.id !== editingClaim)))
                                                        )
                                                        .map(treatment => (
                                                            <SelectItem key={treatment.id} value={treatment.id} className="py-3 px-3 cursor-pointer hover:bg-gray-50">
                                                                <div className="flex flex-col w-full space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="font-semibold text-gray-900 text-sm">{treatment.diagnosis}</span>
                                                                        {treatment.id === claim.treatmentId && (
                                                                            <Badge variant="outline" className="text-xs border-blue-600 text-blue-700 ml-2 px-1.5 py-0.5 flex-shrink-0">
                                                                                Current
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-600">
                                                                        <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                                                            👨‍⚕️ <span className="font-medium">{treatment.doctorName}</span>
                                                                        </span>
                                                                        <span className="text-gray-400">•</span>
                                                                        <span className="flex items-center gap-1 bg-green-100 px-1.5 py-0.5 rounded text-green-700">
                                                                            <DollarSign className="w-3 h-3" />
                                                                            <span className="font-semibold">${treatment.cost}</span>
                                                                        </span>
                                                                        <span className="text-gray-400">•</span>
                                                                        <span className="flex items-center gap-1 bg-blue-100 px-1.5 py-0.5 rounded text-blue-700">
                                                                            <Calendar className="w-3 h-3" />
                                                                            <span className="font-medium">{treatment.date}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                            Only submitted treatments without existing claims are available for selection
                                        </p>
                                    </div>

                                    {/* Treatment Change Warning */}
                                    {formData.treatmentId && formData.treatmentId !== claim.treatmentId && (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">!</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h6 className="text-sm font-medium text-amber-900 mb-1">
                                                        Treatment Change Notice
                                                    </h6>
                                                    <p className="text-xs text-amber-800">
                                                        You&apos;re about to change this claim to a different treatment. This will update the diagnosis, doctor, cost, and date associated with this claim.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Document Management */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Update Supporting Documents</label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 transition-colors ${isDragOver
                                            ? 'border-blue-400 bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <div className="text-center">
                                            <Upload className={`mx-auto h-8 w-8 sm:h-12 sm:w-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                                            <div className="mt-2 sm:mt-4">
                                                <label className="cursor-pointer">
                                                    <span className="block text-sm font-medium text-gray-900">
                                                        {isDragOver ? 'Drop files here' : 'Drop files here or click to browse'}
                                                    </span>
                                                    <Input
                                                        type="file"
                                                        multiple
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={handleFileUpload}
                                                        className="sr-only"
                                                    />
                                                </label>
                                                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                                    PDF, JPG, JPEG, PNG up to 10MB each
                                                </p>
                                            </div>
                                        </div>

                                        {formData.documents.length > 0 && (
                                            <div className="mt-4 border-t border-gray-200 pt-4">
                                                <p className="text-sm font-medium text-gray-900 mb-2">Current documents:</p>
                                                <div className="space-y-2">
                                                    {formData.documents.map((doc, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-gray-500" />
                                                                <span className="text-sm text-gray-700">{doc}</span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        documents: prev.documents.filter((_, i) => i !== index)
                                                                    }))
                                                                }}
                                                                className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                                                            >
                                                                ×
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        )
                    })()}

                    <DialogFooter className="border-t pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <Button
                                onClick={handleSubmit}
                                disabled={!formData.treatmentId}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                <Edit className="w-4 h-4" />
                                Update Claim
                            </Button>
                            <Button
                                onClick={handleCancelEdit}
                                variant="outline"
                                className="w-full sm:w-auto sm:ml-auto"
                            >
                                Cancel
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* My Appointments Section */}
            <Card className="w-full">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        My Appointments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {patientAppointments.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            <Calendar className="mx-auto w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" />
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                            <p className="text-sm text-gray-500 mb-4">Book your first appointment using the form above</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-xs sm:text-sm px-2 sm:px-4">Date</TableHead>
                                        <TableHead className="text-xs sm:text-sm px-2 sm:px-4">Time</TableHead>
                                        <TableHead className="text-xs sm:text-sm px-2 sm:px-4 hidden sm:table-cell">Doctor</TableHead>
                                        <TableHead className="text-xs sm:text-sm px-2 sm:px-4">Reason</TableHead>
                                        <TableHead className="text-xs sm:text-sm px-2 sm:px-4">Status</TableHead>
                                        <TableHead className="text-xs sm:text-sm px-2 sm:px-4 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patientAppointments.map((appointment) => (
                                        <TableRow key={appointment.id} className="group hover:bg-gray-50/50">
                                            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 py-3 sm:py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{appointment.date}</span>
                                                    <span className="text-xs text-gray-500 sm:hidden">{appointment.doctorId}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 py-3 sm:py-4">
                                                <span className="font-medium">{appointment.time}</span>
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                                                <span className="font-medium">{appointment.doctorId}</span>
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 py-3 sm:py-4">
                                                <span className="truncate max-w-[120px] sm:max-w-none block">{appointment.reason}</span>
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 py-3 sm:py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'scheduled'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : appointment.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 py-3 sm:py-4 text-right">
                                                <div className="flex items-center justify-end">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40">
                                                            <DropdownMenuItem onClick={() => setViewingAppointment(appointment.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditAppointment(appointment.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                                {appointment.status !== 'scheduled' && (
                                                                    <span className="ml-2 text-xs text-gray-400">(Scheduled only)</span>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteAppointment(appointment.id)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Appointment Details Modal */}
            <Dialog open={!!viewingAppointment} onOpenChange={(open) => !open && setViewingAppointment(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Appointment Details - #{viewingAppointment}</span>
                            <span className="sm:hidden">Appointment #{viewingAppointment}</span>
                        </DialogTitle>
                    </DialogHeader>

                    {(() => {
                        const appointment = appointments.find(a => a.id === viewingAppointment)
                        if (!appointment) return <p>Appointment not found</p>

                        return (
                            <div className="space-y-4 sm:space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Appointment Information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Date & Time</label>
                                            <p className="text-sm sm:text-base text-gray-900 font-medium">{appointment.date} at {appointment.time}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Doctor</label>
                                            <p className="text-sm sm:text-base text-gray-900 font-medium">{appointment.doctorId}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Reason for Visit</label>
                                            <p className="text-sm sm:text-base text-gray-900">{appointment.reason}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Status</label>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'scheduled'
                                                ? 'bg-blue-100 text-blue-800'
                                                : appointment.status === 'completed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-600">Booked On</label>
                                            <p className="text-sm sm:text-base text-gray-900">{appointment.bookedDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })()}
                </DialogContent>
            </Dialog>

            {/* Edit Appointment Modal */}
            <Dialog open={!!editingAppointment} onOpenChange={(open) => !open && handleCancelAppointmentEdit()}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Edit Appointment - #{editingAppointment}</span>
                            <span className="sm:hidden">Edit #{editingAppointment}</span>
                        </DialogTitle>
                    </DialogHeader>

                    {(() => {
                        const appointment = appointments.find(a => a.id === editingAppointment)
                        if (!appointment) return <p>Appointment not found</p>

                        return (
                            <form onSubmit={handleAppointmentSubmit} className="space-y-4 sm:space-y-6">
                                {/* Current Appointment Info */}
                                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Current Appointment Information</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-800">
                                        <p><span className="font-medium">Date:</span> {appointment.date}</p>
                                        <p><span className="font-medium">Time:</span> {appointment.time}</p>
                                        <p><span className="font-medium">Doctor:</span> {appointment.doctorId}</p>
                                        <p><span className="font-medium">Reason:</span> {appointment.reason}</p>
                                    </div>
                                </div>

                                {/* Edit Form */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="edit-date" className="text-sm font-medium">Date *</Label>
                                            <Input
                                                id="edit-date"
                                                type="date"
                                                value={appointmentFormData.date}
                                                onChange={(e) => setAppointmentFormData(prev => ({ ...prev, date: e.target.value }))}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="edit-time" className="text-sm font-medium">Time *</Label>
                                            <Input
                                                id="edit-time"
                                                type="time"
                                                value={appointmentFormData.time}
                                                onChange={(e) => setAppointmentFormData(prev => ({ ...prev, time: e.target.value }))}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="edit-doctor" className="text-sm font-medium">Doctor *</Label>
                                        <select
                                            id="edit-doctor"
                                            value={appointmentFormData.doctorId}
                                            onChange={(e) => setAppointmentFormData(prev => ({ ...prev, doctorId: e.target.value }))}
                                            required
                                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="">Select a doctor</option>
                                            {doctors.map((doctor) => (
                                                <option key={doctor.id} value={doctor.name}>
                                                    {doctor.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="edit-reason" className="text-sm font-medium">Reason for Visit *</Label>
                                        <Textarea
                                            id="edit-reason"
                                            value={appointmentFormData.reason}
                                            onChange={(e) => setAppointmentFormData(prev => ({ ...prev, reason: e.target.value }))}
                                            placeholder="Please describe the reason for your appointment"
                                            required
                                            className="mt-1"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </form>
                        )
                    })()}

                    <DialogFooter className="border-t pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <Button
                                onClick={handleAppointmentSubmit}
                                disabled={!appointmentFormData.date || !appointmentFormData.time || !appointmentFormData.doctorId || !appointmentFormData.reason}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                <Calendar className="w-4 h-4" />
                                Update Appointment
                            </Button>
                            <Button
                                onClick={handleCancelAppointmentEdit}
                                variant="outline"
                                className="w-full sm:w-auto sm:ml-auto"
                            >
                                Cancel
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
