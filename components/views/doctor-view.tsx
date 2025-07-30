"use client"

import { useState } from 'react'
import { useAppStore, type MedicalReport } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, DollarSign, FileText, Send, Plus, Upload, CheckCircle, XCircle, Eye, FileCheck, Receipt, Search, Filter, Users, TrendingUp, Clock, User, AlertTriangle, BarChart3, Download, MessageSquare, Calendar, Activity, Target, Stethoscope, FileSpreadsheet, Bell, Settings, HelpCircle, Phone } from 'lucide-react'

export function DoctorView() {
    const { treatments, users, claims, addTreatment, updateTreatment, submitTreatment, addDischargeSummary, validateTreatmentForClaim } = useAppStore()
    const [showAddForm, setShowAddForm] = useState(false)
    const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null)
    const [showDischargeForm, setShowDischargeForm] = useState(false)
    const [showValidationForm, setShowValidationForm] = useState(false)
    const [showTreatmentDetails, setShowTreatmentDetails] = useState(false)
    const [selectedTreatmentForDetails, setSelectedTreatmentForDetails] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterPatient, setFilterPatient] = useState<string>('all')
    const [showAnalytics, setShowAnalytics] = useState(false)
    const [showAppointments, setShowAppointments] = useState(false)
    const [showQuickNotes, setShowQuickNotes] = useState(false)
    const [quickNotes, setQuickNotes] = useState('')
    const [selectedDateRange, setSelectedDateRange] = useState('week')
    const [showNotifications, setShowNotifications] = useState(false)
    const [activeSection, setActiveSection] = useState<'notifications' | 'analytics' | 'appointments' | 'quickNotes' | null>(null)
    const [formData, setFormData] = useState({
        patientId: '',
        patientName: '',
        diagnosis: '',
        treatmentDetails: '',
        cost: '',
        costBreakdown: {
            consultation: '',
            procedures: '',
            medication: '',
            equipment: '',
            other: ''
        },
        date: new Date().toISOString().split('T')[0],
        medicalReports: [] as MedicalReport[]
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [dischargeSummary, setDischargeSummary] = useState('')
    const [validationData, setValidationData] = useState({
        isValid: true,
        notes: ''
    })

    const patients = users.filter(u => u.role === 'patient')
    const doctorTreatments = treatments.filter(t => t.doctorId === '1') // Current doctor
    const doctorClaims = claims.filter(c => c.doctorId === '1') // Claims for current doctor's treatments

    // Enhanced filtering and search
    const filteredTreatments = doctorTreatments.filter(treatment => {
        const matchesSearch = treatment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            treatment.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || treatment.status === filterStatus
        const matchesPatient = filterPatient === 'all' || treatment.patientId === filterPatient
        return matchesSearch && matchesStatus && matchesPatient
    })

    // Enhanced analytics calculations
    const recentTreatments = doctorTreatments.filter(t => {
        const treatmentDate = new Date(t.date)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        return treatmentDate >= oneWeekAgo
    }).length

    const pendingActions = doctorTreatments.filter(t =>
        t.status === 'pending' ||
        (t.status === 'submitted' && !t.dischargeSummary) ||
        (t.status === 'submitted' && t.validatedForClaim === undefined)
    ).length

    // Advanced analytics
    const totalRevenue = doctorTreatments.reduce((sum, t) => sum + t.cost, 0)
    const avgTreatmentCost = doctorTreatments.length > 0 ? totalRevenue / doctorTreatments.length : 0
    const successRate = doctorTreatments.length > 0 ?
        (doctorTreatments.filter(t => t.validatedForClaim === true).length / doctorTreatments.length) * 100 : 0

    // Patient demographics
    const uniquePatients = [...new Set(doctorTreatments.map(t => t.patientId))].length
    const repeatPatients = doctorTreatments.reduce((acc, t) => {
        acc[t.patientId] = (acc[t.patientId] || 0) + 1
        return acc
    }, {} as Record<string, number>)
    const loyalPatients = Object.values(repeatPatients).filter(count => count > 1).length

    // Treatment categories analysis
    const topDiagnoses = doctorTreatments.reduce((acc, t) => {
        const diagnosis = t.diagnosis.split(' ').slice(0, 3).join(' ') // First 3 words
        acc[diagnosis] = (acc[diagnosis] || 0) + 1
        return acc
    }, {} as Record<string, number>)
    const mostCommonDiagnosis = Object.entries(topDiagnoses).sort(([, a], [, b]) => b - a)[0]

    // Function to handle section toggling - only one section can be active at a time
    const handleSectionToggle = (section: 'notifications' | 'analytics' | 'appointments' | 'quickNotes') => {
        if (activeSection === section) {
            // If clicking the same section, close it
            setActiveSection(null)
        } else {
            // Otherwise, open the new section and close others
            setActiveSection(section)
        }
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!formData.patientId) errors.patientId = 'Please select a patient'
        if (!formData.diagnosis.trim()) errors.diagnosis = 'Diagnosis is required'
        if (!formData.treatmentDetails.trim()) errors.treatmentDetails = 'Treatment details are required'
        if (!formData.cost || parseFloat(formData.cost) <= 0) errors.cost = 'Valid cost is required'
        if (!formData.date) errors.date = 'Treatment date is required'
        if (formData.medicalReports.length === 0) errors.medicalReports = 'At least one medical report is required'

        // Validate cost breakdown totals
        const breakdown = {
            consultation: parseFloat(formData.costBreakdown.consultation) || 0,
            procedures: parseFloat(formData.costBreakdown.procedures) || 0,
            medication: parseFloat(formData.costBreakdown.medication) || 0,
            equipment: parseFloat(formData.costBreakdown.equipment) || 0,
            other: parseFloat(formData.costBreakdown.other) || 0
        }
        const totalBreakdown = Object.values(breakdown).reduce((sum, val) => sum + val, 0)
        const totalCost = parseFloat(formData.cost) || 0

        if (Math.abs(totalBreakdown - totalCost) > 0.01) {
            errors.costBreakdown = `Cost breakdown (${totalBreakdown.toFixed(2)}) must equal total cost (${totalCost.toFixed(2)})`
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const resetForm = () => {
        setFormData({
            patientId: '',
            patientName: '',
            diagnosis: '',
            treatmentDetails: '',
            cost: '',
            costBreakdown: {
                consultation: '',
                procedures: '',
                medication: '',
                equipment: '',
                other: ''
            },
            date: new Date().toISOString().split('T')[0],
            medicalReports: []
        })
        setFormErrors({})
        setCurrentStep(1)
        setIsSubmitting(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            // Scroll to first error
            const firstErrorElement = document.querySelector('.error-field')
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            return
        }

        setIsSubmitting(true)

        try {
            const patient = patients.find(p => p.id === formData.patientId)
            if (!patient) throw new Error('Patient not found')

            const totalCost = parseFloat(formData.cost)
            const breakdown = {
                consultation: parseFloat(formData.costBreakdown.consultation) || 0,
                procedures: parseFloat(formData.costBreakdown.procedures) || 0,
                medication: parseFloat(formData.costBreakdown.medication) || 0,
                equipment: parseFloat(formData.costBreakdown.equipment) || 0,
                other: parseFloat(formData.costBreakdown.other) || 0
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            addTreatment({
                doctorId: '1',
                doctorName: 'Dr. Sarah Johnson',
                patientId: formData.patientId,
                patientName: patient.name,
                diagnosis: formData.diagnosis,
                treatmentDetails: formData.treatmentDetails,
                cost: totalCost,
                costBreakdown: breakdown,
                date: formData.date,
                medicalReports: formData.medicalReports,
                validatedForClaim: false
            })

            // Success feedback
            alert('Treatment added successfully! 🎉')
            resetForm()
            setShowAddForm(false)

        } catch (error) {
            alert('Error adding treatment. Please try again.')
            console.error('Error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])

        if (files.length === 0) return

        // Validate file types and sizes
        const validFiles = files.filter(file => {
            const isValidType = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'].includes(
                file.name.toLowerCase().split('.').pop() || ''
            )
            const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB

            if (!isValidType) {
                alert(`Invalid file type: ${file.name}. Please upload PDF, DOC, DOCX, JPG, or PNG files.`)
                return false
            }
            if (!isValidSize) {
                alert(`File too large: ${file.name}. Maximum size is 10MB.`)
                return false
            }
            return true
        })

        const newReports: MedicalReport[] = validFiles.map(file => ({
            id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fileName: file.name,
            uploadDate: new Date().toISOString().split('T')[0],
            status: Math.random() > 0.3 ? 'uploaded' : 'pending', // Simulate different statuses
            type: getFileType(file.name),
            notes: `Uploaded on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`
        }))

        setFormData(prev => ({
            ...prev,
            medicalReports: [...prev.medicalReports, ...newReports]
        }))

        // Clear form errors for medical reports if files are added
        if (formErrors.medicalReports && newReports.length > 0) {
            setFormErrors(prev => ({ ...prev, medicalReports: '' }))
        }

        // Reset file input
        e.target.value = ''
    }

    const removeReport = (reportId: string) => {
        setFormData(prev => ({
            ...prev,
            medicalReports: prev.medicalReports.filter(report => report.id !== reportId)
        }))
    }

    const updateFormReportStatus = (reportId: string, newStatus: MedicalReport['status']) => {
        setFormData(prev => ({
            ...prev,
            medicalReports: prev.medicalReports.map(report =>
                report.id === reportId ? { ...report, status: newStatus } : report
            )
        }))
    }

    const getFileType = (fileName: string): MedicalReport['type'] => {
        const extension = fileName.toLowerCase().split('.').pop() || ''
        const name = fileName.toLowerCase()

        if (name.includes('lab') || name.includes('blood') || name.includes('test')) return 'lab_result'
        if (name.includes('xray') || name.includes('x-ray')) return 'xray'
        if (name.includes('prescription') || name.includes('rx')) return 'prescription'
        if (name.includes('scan') || name.includes('mri') || name.includes('ct')) return 'scan'
        if (['pdf', 'doc', 'docx'].includes(extension)) return 'document'
        return 'other'
    }

    const handleDischargeSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTreatment || !dischargeSummary) return

        addDischargeSummary(selectedTreatment, dischargeSummary)
        setDischargeSummary('')
        setSelectedTreatment(null)
        setShowDischargeForm(false)
    }

    const handleValidationSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTreatment) return

        validateTreatmentForClaim(selectedTreatment, validationData.isValid, validationData.notes)
        setValidationData({ isValid: true, notes: '' })
        setSelectedTreatment(null)
        setShowValidationForm(false)
    }

    const handleSubmitTreatment = (treatmentId: string) => {
        submitTreatment(treatmentId)
    }

    const handleViewTreatmentDetails = (treatmentId: string) => {
        setSelectedTreatmentForDetails(treatmentId)
        setShowTreatmentDetails(true)
    }

    const exportToCSV = () => {
        const headers = ['Patient', 'Diagnosis', 'Date', 'Cost', 'Status', 'Validated', 'Reports Status']
        const rows = doctorTreatments.map(t => [
            t.patientName,
            t.diagnosis,
            t.date,
            t.cost.toString(),
            t.status,
            t.validatedForClaim ? 'Yes' : 'No',
            t.medicalReports ? `${t.medicalReports.length} reports (${t.medicalReports.filter(r => r.status === 'verified' || r.status === 'uploaded').length} ready)` : 'No reports'
        ])

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `treatments_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const updateReportStatus = (treatmentId: string, reportId: string, newStatus: MedicalReport['status']) => {
        const treatment = doctorTreatments.find(t => t.id === treatmentId)
        if (treatment && treatment.medicalReports) {
            const updatedReports = treatment.medicalReports.map(report =>
                report.id === reportId ? { ...report, status: newStatus } : report
            )
            updateTreatment(treatmentId, { medicalReports: updatedReports })
        }
    }

    const getDateRangeData = (range: string) => {
        const now = new Date()
        let startDate = new Date()

        switch (range) {
            case 'week':
                startDate.setDate(now.getDate() - 7)
                break
            case 'month':
                startDate.setMonth(now.getMonth() - 1)
                break
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3)
                break
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1)
                break
        }

        return doctorTreatments.filter(t => new Date(t.date) >= startDate)
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Header with Comprehensive Statistics */}
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h2>
                        <p className="text-gray-600">Comprehensive medical practice management system</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={activeSection === 'notifications' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSectionToggle('notifications')}
                            className="flex items-center gap-2"
                        >
                            <Bell className="w-4 h-4" />
                            Alerts
                            {pendingActions > 0 && (
                                <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                                    {pendingActions}
                                </Badge>
                            )}
                        </Button>
                        <Button
                            variant={activeSection === 'analytics' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSectionToggle('analytics')}
                            className="flex items-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </Button>
                        <Button
                            variant={activeSection === 'appointments' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSectionToggle('appointments')}
                            className="flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Schedule
                        </Button>
                        <Button
                            variant={activeSection === 'quickNotes' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSectionToggle('quickNotes')}
                            className="flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Quick Notes
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportToCSV}
                            className="flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                        <Button
                            onClick={() => {
                                resetForm()
                                setShowAddForm(true)
                            }}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                            size="lg"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Treatment
                        </Button>
                    </div>
                </div>

                {/* Enhanced Add Treatment Form with Step-by-Step Layout - MODAL */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            <Card className="border-l-4 border-l-blue-500 shadow-none border-0">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            Add New Treatment Record
                                        </CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                resetForm()
                                                setShowAddForm(false)
                                            }}
                                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {/* Progress Steps */}
                                    <div className="flex items-center justify-center mt-4">
                                        <div className="flex items-center space-x-4">
                                            {[1, 2, 3].map((step) => (
                                                <div key={step} className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${currentStep >= step
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-gray-200 text-gray-600'
                                                        }`}>
                                                        {currentStep > step ? (
                                                            <CheckCircle className="w-5 h-5" />
                                                        ) : (
                                                            step
                                                        )}
                                                    </div>
                                                    <span className={`ml-2 text-sm transition-colors duration-300 ${currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'
                                                        }`}>
                                                        {step === 1 && 'Patient & Basic Info'}
                                                        {step === 2 && 'Treatment Details'}
                                                        {step === 3 && 'Medical Reports'}
                                                    </span>
                                                    {step < 3 && (
                                                        <div className={`w-16 h-0.5 ml-4 transition-colors duration-300 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                                                            }`} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>📝 Step {currentStep} of 3:</strong>
                                            {currentStep === 1 && ' Start by selecting the patient and basic treatment information.'}
                                            {currentStep === 2 && ' Provide detailed diagnosis, treatment description, and cost breakdown.'}
                                            {currentStep === 3 && ' Upload medical reports and documents to complete the record.'}
                                        </p>
                                    </div>
                                </CardHeader>

                                <div className="max-h-[60vh] overflow-y-auto">
                                    <CardContent className="p-6">
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Step 1: Patient & Basic Info */}
                                            {currentStep === 1 && (
                                                <div className="space-y-6 animate-in fade-in duration-300">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">
                                                                Patient <span className="text-red-500">*</span>
                                                            </label>
                                                            <Select
                                                                value={formData.patientId}
                                                                onValueChange={(value) => {
                                                                    setFormData(prev => ({ ...prev, patientId: value }))
                                                                    if (formErrors.patientId) {
                                                                        setFormErrors(prev => ({ ...prev, patientId: '' }))
                                                                    }
                                                                }}
                                                            >
                                                                <SelectTrigger className={`transition-colors ${formErrors.patientId ? 'border-red-500 error-field bg-red-50' : 'hover:border-blue-400'}`}>
                                                                    <SelectValue placeholder="Select patient" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {patients.map(patient => (
                                                                        <SelectItem key={patient.id} value={patient.id}>
                                                                            <div className="flex items-center gap-2">
                                                                                <User className="w-4 h-4" />
                                                                                {patient.name}
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {formErrors.patientId && (
                                                                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">{formErrors.patientId}</p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">
                                                                Treatment Date <span className="text-red-500">*</span>
                                                            </label>
                                                            <Input
                                                                type="date"
                                                                value={formData.date}
                                                                onChange={(e) => {
                                                                    setFormData(prev => ({ ...prev, date: e.target.value }))
                                                                    if (formErrors.date) {
                                                                        setFormErrors(prev => ({ ...prev, date: '' }))
                                                                    }
                                                                }}
                                                                className={`transition-colors ${formErrors.date ? 'border-red-500 error-field bg-red-50' : 'hover:border-blue-400'}`}
                                                                max={new Date().toISOString().split('T')[0]}
                                                            />
                                                            {formErrors.date && (
                                                                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">{formErrors.date}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end mb-6">
                                                        <Button
                                                            type="button"
                                                            onClick={() => setCurrentStep(2)}
                                                            disabled={!formData.patientId || !formData.date}
                                                            className="flex items-center gap-2"
                                                        >
                                                            Next: Treatment Details
                                                            <FileText className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2: Treatment Details */}
                                            {currentStep === 2 && (
                                                <div className="space-y-6 animate-in fade-in duration-300">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">
                                                            Diagnosis <span className="text-red-500">*</span>
                                                        </label>
                                                        <Textarea
                                                            value={formData.diagnosis}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({ ...prev, diagnosis: e.target.value }))
                                                                if (formErrors.diagnosis) {
                                                                    setFormErrors(prev => ({ ...prev, diagnosis: '' }))
                                                                }
                                                            }}
                                                            placeholder="Enter detailed diagnosis with ICD codes if applicable..."
                                                            className={`min-h-[80px] transition-colors ${formErrors.diagnosis ? 'border-red-500 error-field bg-red-50' : 'hover:border-blue-400'}`}
                                                        />
                                                        {formErrors.diagnosis && (
                                                            <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">{formErrors.diagnosis}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1">Include specific medical conditions and ICD codes for insurance compliance</p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">
                                                            Treatment Details <span className="text-red-500">*</span>
                                                        </label>
                                                        <Textarea
                                                            value={formData.treatmentDetails}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({ ...prev, treatmentDetails: e.target.value }))
                                                                if (formErrors.treatmentDetails) {
                                                                    setFormErrors(prev => ({ ...prev, treatmentDetails: '' }))
                                                                }
                                                            }}
                                                            placeholder="Enter comprehensive treatment information including procedures, medications, and protocols used..."
                                                            rows={4}
                                                            className={`min-h-[100px] transition-colors ${formErrors.treatmentDetails ? 'border-red-500 error-field bg-red-50' : 'hover:border-blue-400'}`}
                                                        />
                                                        {formErrors.treatmentDetails && (
                                                            <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">{formErrors.treatmentDetails}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1">Detailed treatment description improves insurance claim approval rates</p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">
                                                                Total Treatment Cost ($) <span className="text-red-500">*</span>
                                                            </label>
                                                            <Input
                                                                type="number"
                                                                value={formData.cost}
                                                                onChange={(e) => {
                                                                    setFormData(prev => ({ ...prev, cost: e.target.value }))
                                                                    if (formErrors.cost) {
                                                                        setFormErrors(prev => ({ ...prev, cost: '' }))
                                                                    }
                                                                }}
                                                                placeholder="0.00"
                                                                min="0"
                                                                step="0.01"
                                                                className={`transition-colors ${formErrors.cost ? 'border-red-500 error-field bg-red-50' : 'hover:border-blue-400'}`}
                                                            />
                                                            {formErrors.cost && (
                                                                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">{formErrors.cost}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">Cost Breakdown (Optional but Recommended)</label>
                                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                                            {[
                                                                { key: 'consultation', label: 'Consultation' },
                                                                { key: 'procedures', label: 'Procedures' },
                                                                { key: 'medication', label: 'Medication' },
                                                                { key: 'equipment', label: 'Equipment' },
                                                                { key: 'other', label: 'Other' }
                                                            ].map(({ key, label }) => (
                                                                <div key={key}>
                                                                    <label className="block text-xs font-medium mb-1">{label} ($)</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={formData.costBreakdown[key as keyof typeof formData.costBreakdown]}
                                                                        onChange={(e) => setFormData(prev => ({
                                                                            ...prev,
                                                                            costBreakdown: { ...prev.costBreakdown, [key]: e.target.value }
                                                                        }))}
                                                                        placeholder="0.00"
                                                                        min="0"
                                                                        step="0.01"
                                                                        className="hover:border-blue-400 transition-colors"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {formErrors.costBreakdown && (
                                                            <p className="text-red-500 text-xs mt-2 animate-in slide-in-from-top-1 duration-200">{formErrors.costBreakdown}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-2">Detailed cost breakdown improves insurance approval rates</p>
                                                    </div>

                                                    <div className="flex justify-between mb-6">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setCurrentStep(1)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <User className="w-4 h-4" />
                                                            Back: Patient Info
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            onClick={() => setCurrentStep(3)}
                                                            disabled={!formData.diagnosis.trim() || !formData.treatmentDetails.trim() || !formData.cost}
                                                            className="flex items-center gap-2"
                                                        >
                                                            Next: Medical Reports
                                                            <Upload className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3: Medical Reports */}
                                            {currentStep === 3 && (
                                                <div className="space-y-6 animate-in fade-in duration-300">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">
                                                            Medical Reports <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className={`border-2 border-dashed rounded-lg p-6 hover:border-blue-400 transition-colors ${formErrors.medicalReports ? 'border-red-500 bg-red-50 error-field' : 'border-gray-300'
                                                            }`}>
                                                            <div className="text-center">
                                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                                <div className="space-y-2">
                                                                    <Input
                                                                        type="file"
                                                                        multiple
                                                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                                        onChange={handleFileUpload}
                                                                        className="w-full"
                                                                        id="file-upload"
                                                                    />
                                                                    <p className="text-sm text-gray-600">
                                                                        Drag and drop files here or click to browse
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {formErrors.medicalReports && (
                                                            <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">{formErrors.medicalReports}</p>
                                                        )}
                                                    </div>

                                                    {/* Uploaded Reports Display */}
                                                    {formData.medicalReports.length > 0 && (
                                                        <div className="space-y-3">
                                                            <h4 className="font-medium text-gray-900">Uploaded Reports ({formData.medicalReports.length})</h4>
                                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                                {formData.medicalReports.map((report, index) => (
                                                                    <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex items-center gap-1">
                                                                                {report.status === 'uploaded' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                                                {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-600" />}
                                                                                {report.status === 'processing' && <Settings className="w-4 h-4 text-blue-600 animate-spin" />}
                                                                                {report.status === 'verified' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-sm">{report.fileName}</p>
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <Badge
                                                                                        variant={
                                                                                            report.status === 'verified' ? 'success' :
                                                                                                report.status === 'uploaded' ? 'default' :
                                                                                                    report.status === 'pending' ? 'secondary' : 'default'
                                                                                        }
                                                                                        className="text-xs"
                                                                                    >
                                                                                        {report.status}
                                                                                    </Badge>
                                                                                    <Badge variant="outline" className="text-xs">
                                                                                        {report.type.replace('_', ' ')}
                                                                                    </Badge>
                                                                                    <span className="text-xs text-gray-500">{report.uploadDate}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {report.status === 'pending' && (
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => updateFormReportStatus(report.id, 'uploaded')}
                                                                                    className="text-xs hover:bg-green-50"
                                                                                >
                                                                                    Mark Uploaded
                                                                                </Button>
                                                                            )}
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() => removeReport(report.id)}
                                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                                            >
                                                                                <XCircle className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Treatment Summary */}
                                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                        <h4 className="font-medium text-blue-800 mb-3">📋 Treatment Summary</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p><strong>Patient:</strong> {patients.find(p => p.id === formData.patientId)?.name || 'Not selected'}</p>
                                                                <p><strong>Date:</strong> {formData.date}</p>
                                                                <p><strong>Cost:</strong> ${formData.cost}</p>
                                                            </div>
                                                            <div>
                                                                <p><strong>Diagnosis:</strong> {formData.diagnosis.substring(0, 50)}{formData.diagnosis.length > 50 ? '...' : ''}</p>
                                                                <p><strong>Reports:</strong> {formData.medicalReports.length} files</p>
                                                                <p><strong>Ready to Submit:</strong> {formData.medicalReports.filter(r => r.status === 'uploaded' || r.status === 'verified').length} files</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Navigation and Submit */}
                                                    <div className="flex justify-between mb-6">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setCurrentStep(2)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            Back: Treatment Details
                                                        </Button>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    resetForm()
                                                                    setShowAddForm(false)
                                                                }}
                                                                disabled={isSubmitting}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="submit"
                                                                disabled={isSubmitting || formData.medicalReports.length === 0}
                                                                className="flex items-center gap-2 min-w-[120px]"
                                                            >
                                                                {isSubmitting ? (
                                                                    <>
                                                                        <Settings className="w-4 h-4 animate-spin" />
                                                                        Saving...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        Save Treatment
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </form>
                                    </CardContent>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Notifications Panel */}
                {activeSection === 'notifications' && (
                    <Card className="border-l-4 border-l-red-500 bg-red-50/30">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <Bell className="w-5 h-5" />
                                    Priority Alerts & Notifications
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveSection(null)}
                                    className="h-6 w-6 p-0 text-red-700 hover:text-red-900 hover:bg-red-100"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {doctorTreatments.filter(t => t.status === 'pending').length > 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium text-yellow-800">
                                                {doctorTreatments.filter(t => t.status === 'pending').length} treatments pending submission
                                            </p>
                                            <p className="text-sm text-yellow-700">Submit treatments to make them available for claims</p>
                                        </div>
                                    </div>
                                )}
                                {doctorTreatments.filter(t => t.status === 'submitted' && !t.dischargeSummary).length > 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                                        <FileCheck className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-blue-800">
                                                {doctorTreatments.filter(t => t.status === 'submitted' && !t.dischargeSummary).length} discharge summaries required
                                            </p>
                                            <p className="text-sm text-blue-700">Complete discharge summaries for processed treatments</p>
                                        </div>
                                    </div>
                                )}
                                {doctorTreatments.filter(t => t.status === 'submitted' && t.validatedForClaim === undefined).length > 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-200">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-green-800">
                                                {doctorTreatments.filter(t => t.status === 'submitted' && t.validatedForClaim === undefined).length} treatments awaiting validation
                                            </p>
                                            <p className="text-sm text-green-700">Validate treatments for insurance claim eligibility</p>
                                        </div>
                                    </div>
                                )}
                                {recentTreatments > 5 && (
                                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded border border-purple-200">
                                        <TrendingUp className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium text-purple-800">High activity week!</p>
                                            <p className="text-sm text-purple-700">{recentTreatments} treatments completed this week</p>
                                        </div>
                                    </div>
                                )}
                                {pendingActions === 0 && (
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-200">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-medium text-green-800">All caught up! 🎉</p>
                                            <p className="text-sm text-green-700">No pending actions required</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Analytics Dashboard */}
                {activeSection === 'analytics' && (
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    Practice Analytics & Insights
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="month">This Month</SelectItem>
                                            <SelectItem value="quarter">This Quarter</SelectItem>
                                            <SelectItem value="year">This Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveSection(null)}
                                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-900 hover:bg-blue-100"
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Financial Metrics */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Financial Overview
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-green-50 rounded border">
                                            <p className="text-sm text-gray-600">Total Revenue</p>
                                            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded border">
                                            <p className="text-sm text-gray-600">Avg Treatment Cost</p>
                                            <p className="text-xl font-bold text-blue-600">${avgTreatmentCost.toFixed(2)}</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 rounded border">
                                            <p className="text-sm text-gray-600">Validation Success Rate</p>
                                            <p className="text-xl font-bold text-purple-600">{successRate.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Patient Metrics */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Patient Insights
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-indigo-50 rounded border">
                                            <p className="text-sm text-gray-600">Total Patients</p>
                                            <p className="text-2xl font-bold text-indigo-600">{uniquePatients}</p>
                                        </div>
                                        <div className="p-3 bg-teal-50 rounded border">
                                            <p className="text-sm text-gray-600">Repeat Patients</p>
                                            <p className="text-xl font-bold text-teal-600">{loyalPatients}</p>
                                        </div>
                                        <div className="p-3 bg-orange-50 rounded border">
                                            <p className="text-sm text-gray-600">Patient Retention</p>
                                            <p className="text-xl font-bold text-orange-600">
                                                {uniquePatients > 0 ? ((loyalPatients / uniquePatients) * 100).toFixed(1) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Treatment Analysis */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Treatment Analysis
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-gray-50 rounded border">
                                            <p className="text-sm text-gray-600">Most Common</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                {mostCommonDiagnosis ? mostCommonDiagnosis[0] : 'N/A'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {mostCommonDiagnosis ? `${mostCommonDiagnosis[1]} cases` : ''}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-yellow-50 rounded border">
                                            <p className="text-sm text-gray-600">This {selectedDateRange}</p>
                                            <p className="text-xl font-bold text-yellow-600">
                                                {getDateRangeData(selectedDateRange).length} treatments
                                            </p>
                                        </div>
                                        <div className="p-3 bg-red-50 rounded border">
                                            <p className="text-sm text-gray-600">Pending Actions</p>
                                            <p className="text-xl font-bold text-red-600">{pendingActions}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Notes Panel */}
                {activeSection === 'quickNotes' && (
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                    Quick Notes & Reminders
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveSection(null)}
                                    className="h-6 w-6 p-0 text-green-600 hover:text-green-900 hover:bg-green-100"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Textarea
                                    value={quickNotes}
                                    onChange={(e) => setQuickNotes(e.target.value)}
                                    placeholder="Add your quick notes, reminders, or observations here..."
                                    rows={4}
                                    className="w-full"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            // Save notes (in a real app, this would persist to storage)
                                            alert('Notes saved successfully!')
                                        }}
                                    >
                                        Save Notes
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setQuickNotes('')}
                                    >
                                        Clear
                                    </Button>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                                    <h5 className="font-medium text-blue-800 mb-2">💡 Quick Tips:</h5>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Use this space to track patient follow-ups</li>
                                        <li>• Note important observations or concerns</li>
                                        <li>• Set reminders for future appointments</li>
                                        <li>• Track treatment effectiveness patterns</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Appointment Scheduler */}
                {activeSection === 'appointments' && (
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                    Today's Schedule & Appointments
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveSection(null)}
                                    className="h-6 w-6 p-0 text-purple-600 hover:text-purple-900 hover:bg-purple-100"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Today's Appointments</h4>
                                    <div className="space-y-3">
                                        <div className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">John Smith</p>
                                                    <p className="text-sm text-gray-600">Annual Checkup</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">9:00 AM</p>
                                                    <Badge variant="success" className="text-xs">Confirmed</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">Emma Wilson</p>
                                                    <p className="text-sm text-gray-600">Follow-up Visit</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">2:30 PM</p>
                                                    <Badge variant="warning" className="text-xs">Pending</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">Robert Davis</p>
                                                    <p className="text-sm text-gray-600">Consultation</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">4:00 PM</p>
                                                    <Badge variant="info" className="text-xs">New Patient</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                                    <div className="space-y-2">
                                        <Button className="w-full justify-start" variant="outline">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Call Next Patient
                                        </Button>
                                        <Button className="w-full justify-start" variant="outline">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Schedule Appointment
                                        </Button>
                                        <Button className="w-full justify-start" variant="outline">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Send Appointment Reminders
                                        </Button>
                                        <Button className="w-full justify-start" variant="outline">
                                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                                            View Weekly Schedule
                                        </Button>
                                    </div>
                                    <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
                                        <h5 className="font-medium text-purple-800 mb-2">📅 Schedule Overview</h5>
                                        <div className="text-sm text-purple-700 space-y-1">
                                            <p>• Today: 3 appointments</p>
                                            <p>• This week: 12 appointments</p>
                                            <p>• Next available: Tomorrow 10:00 AM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Comprehensive Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <Card className="p-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{doctorTreatments.length}</p>
                            <p className="text-sm text-gray-600">Total Treatments</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {doctorTreatments.filter(t => t.validatedForClaim === true).length}
                            </p>
                            <p className="text-sm text-gray-600">Validated</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <p className="text-2xl font-bold text-orange-600">
                                {doctorTreatments.filter(t => t.validatedForClaim === undefined).length}
                            </p>
                            <p className="text-sm text-gray-600">Pending Validation</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{recentTreatments}</p>
                            <p className="text-sm text-gray-600">This Week</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <p className="text-2xl font-bold text-indigo-600">
                                {[...new Set(doctorTreatments.map(t => t.patientId))].length}
                            </p>
                            <p className="text-sm text-gray-600">Unique Patients</p>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <p className="text-2xl font-bold text-red-600">{pendingActions}</p>
                            <p className="text-sm text-gray-600">Actions Needed</p>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions Panel */}
                {pendingActions > 0 && (
                    <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-700">
                                <Clock className="w-5 h-5" />
                                Pending Actions Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {doctorTreatments.filter(t => t.status === 'pending').length > 0 && (
                                    <div className="text-center p-3 bg-white rounded border">
                                        <p className="text-xl font-bold text-blue-600">
                                            {doctorTreatments.filter(t => t.status === 'pending').length}
                                        </p>
                                        <p className="text-sm text-gray-600">Treatments to Submit</p>
                                    </div>
                                )}
                                {doctorTreatments.filter(t => t.status === 'submitted' && !t.dischargeSummary).length > 0 && (
                                    <div className="text-center p-3 bg-white rounded border">
                                        <p className="text-xl font-bold text-purple-600">
                                            {doctorTreatments.filter(t => t.status === 'submitted' && !t.dischargeSummary).length}
                                        </p>
                                        <p className="text-sm text-gray-600">Discharge Summaries Needed</p>
                                    </div>
                                )}
                                {doctorTreatments.filter(t => t.status === 'submitted' && t.validatedForClaim === undefined).length > 0 && (
                                    <div className="text-center p-3 bg-white rounded border">
                                        <p className="text-xl font-bold text-green-600">
                                            {doctorTreatments.filter(t => t.status === 'submitted' && t.validatedForClaim === undefined).length}
                                        </p>
                                        <p className="text-sm text-gray-600">Validations Pending</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Discharge Summary Form */}
            {showDischargeForm && selectedTreatment && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck className="w-5 h-5" />
                            Submit Discharge Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleDischargeSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Patient:</label>
                                <p className="text-sm text-gray-600">
                                    {treatments.find(t => t.id === selectedTreatment)?.patientName}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Discharge Summary</label>
                                <Textarea
                                    value={dischargeSummary}
                                    onChange={(e) => setDischargeSummary(e.target.value)}
                                    placeholder="Enter comprehensive discharge summary including treatment outcome, follow-up instructions, and medications..."
                                    rows={6}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Submit Discharge Summary</Button>
                                <Button type="button" variant="outline" onClick={() => {
                                    setShowDischargeForm(false)
                                    setSelectedTreatment(null)
                                    setDischargeSummary('')
                                }}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Treatment Validation Form */}
            {showValidationForm && selectedTreatment && (
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            Certify Treatment Validity for Insurance Claims
                        </CardTitle>
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-2">
                            <p className="text-sm text-blue-800">
                                <strong>⚖️ Important:</strong> This certification confirms that the treatment meets insurance standards
                                and medical necessity requirements. Your decision affects claim approval.
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleValidationSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Patient:</label>
                                    <p className="text-sm text-gray-600 font-medium">
                                        {treatments.find(t => t.id === selectedTreatment)?.patientName}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Treatment Date:</label>
                                    <p className="text-sm text-gray-600">
                                        {treatments.find(t => t.id === selectedTreatment)?.date}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Diagnosis:</label>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                                        {treatments.find(t => t.id === selectedTreatment)?.diagnosis}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Treatment Validity for Insurance <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={validationData.isValid ? 'valid' : 'invalid'}
                                    onValueChange={(value) => setValidationData(prev => ({
                                        ...prev,
                                        isValid: value === 'valid'
                                    }))}
                                >
                                    <SelectTrigger className={validationData.isValid ? 'border-green-300' : 'border-red-300'}>
                                        <SelectValue placeholder="Select validity status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="valid">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                Valid for Insurance Claim
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="invalid">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="w-4 h-4 text-red-500" />
                                                Not Valid for Insurance Claim
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Medical Justification & Validation Notes <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    value={validationData.notes}
                                    onChange={(e) => setValidationData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Provide detailed medical justification for your validation decision including:
• Medical necessity and appropriateness
• Compliance with standard protocols
• Quality of documentation
• Insurance coverage criteria met
• Any special circumstances or considerations..."
                                    rows={5}
                                    required
                                    className="min-h-[120px]"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Detailed justification helps insurance reviewers understand your decision
                                </p>
                            </div>

                            {validationData.isValid && (
                                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                                    <h4 className="font-medium text-green-800 mb-2">✅ Validating Treatment as Insurance-Eligible</h4>
                                    <p className="text-sm text-green-700">
                                        This treatment will be marked as valid for insurance claims,
                                        improving the patient's chance of claim approval.
                                    </p>
                                </div>
                            )}

                            {!validationData.isValid && (
                                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                                    <h4 className="font-medium text-red-800 mb-2">❌ Marking Treatment as Not Insurance-Eligible</h4>
                                    <p className="text-sm text-red-700">
                                        This treatment will be marked as invalid for insurance claims.
                                        Patients should be informed about self-pay options.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" className={validationData.isValid ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                                    {validationData.isValid ? 'Validate Treatment' : 'Mark as Invalid'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => {
                                    setShowValidationForm(false)
                                    setSelectedTreatment(null)
                                    setValidationData({ isValid: true, notes: '' })
                                }}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Treatment Details Modal */}
            {showTreatmentDetails && selectedTreatmentForDetails && (
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-green-600" />
                            Treatment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const treatment = treatments.find(t => t.id === selectedTreatmentForDetails)
                            if (!treatment) return null

                            return (
                                <div className="space-y-6">
                                    {/* Patient and Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Patient Name</h4>
                                            <p className="text-gray-600">{treatment.patientName}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Treatment Date</h4>
                                            <p className="text-gray-600 flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                {treatment.date}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Doctor</h4>
                                            <p className="text-gray-600">{treatment.doctorName}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                                            <Badge variant={
                                                treatment.status === 'submitted' ? 'success' :
                                                    'default'
                                            }>
                                                {treatment.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Diagnosis */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                                        <div className="bg-gray-50 p-3 rounded-md border">
                                            <p className="text-gray-700">{treatment.diagnosis}</p>
                                        </div>
                                    </div>

                                    {/* Treatment Details */}
                                    {treatment.treatmentDetails && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Treatment Details</h4>
                                            <div className="bg-gray-50 p-3 rounded-md border">
                                                <p className="text-gray-700">{treatment.treatmentDetails}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Cost Information */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Cost Information</h4>
                                        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <DollarSign className="w-5 h-5 text-blue-600" />
                                                <span className="text-xl font-bold text-blue-700">${treatment.cost}</span>
                                                <span className="text-sm text-blue-600">Total Cost</span>
                                            </div>

                                            {treatment.costBreakdown && (
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-gray-600">Consultation</p>
                                                        <p className="text-lg font-bold text-green-600">${treatment.costBreakdown.consultation}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-gray-600">Procedures</p>
                                                        <p className="text-lg font-bold text-green-600">${treatment.costBreakdown.procedures}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-gray-600">Medication</p>
                                                        <p className="text-lg font-bold text-green-600">${treatment.costBreakdown.medication}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-gray-600">Equipment</p>
                                                        <p className="text-lg font-bold text-green-600">${treatment.costBreakdown.equipment}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium text-gray-600">Other</p>
                                                        <p className="text-lg font-bold text-green-600">${treatment.costBreakdown.other}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Medical Reports */}
                                    {treatment.medicalReports && treatment.medicalReports.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Medical Reports</h4>
                                            <div className="space-y-2">
                                                {treatment.medicalReports.map((report, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1">
                                                                {report.status === 'uploaded' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                                {report.status === 'pending' && <Clock className="w-4 h-4 text-yellow-600" />}
                                                                {report.status === 'processing' && <Settings className="w-4 h-4 text-blue-600 animate-spin" />}
                                                                {report.status === 'verified' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                                                            </div>
                                                            <span className="font-medium">{report.fileName}</span>
                                                            <div className="flex gap-1">
                                                                <Badge
                                                                    variant={
                                                                        report.status === 'verified' ? 'success' :
                                                                            report.status === 'uploaded' ? 'default' :
                                                                                report.status === 'pending' ? 'secondary' : 'default'
                                                                    }
                                                                    className="text-xs"
                                                                >
                                                                    {report.status}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {report.type.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500">{report.uploadDate}</p>
                                                            {report.notes && (
                                                                <p className="text-xs text-gray-400" title={report.notes}>
                                                                    {report.notes.length > 30 ? `${report.notes.substring(0, 30)}...` : report.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Discharge Summary */}
                                    {treatment.dischargeSummary && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Discharge Summary</h4>
                                            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                                                <p className="text-gray-700">{treatment.dischargeSummary}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Validation Status */}
                                    {treatment.validatedForClaim !== undefined && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Insurance Validation</h4>
                                            <div className={`p-3 rounded-md border ${treatment.validatedForClaim
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-red-50 border-red-200'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {treatment.validatedForClaim ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-600" />
                                                    )}
                                                    <Badge variant={treatment.validatedForClaim ? 'success' : 'destructive'}>
                                                        {treatment.validatedForClaim ? 'Valid for Claims' : 'Invalid for Claims'}
                                                    </Badge>
                                                </div>
                                                {treatment.validationNotes && (
                                                    <p className={`text-sm ${treatment.validatedForClaim ? 'text-green-700' : 'text-red-700'
                                                        }`}>
                                                        {treatment.validationNotes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowTreatmentDetails(false)
                                                setSelectedTreatmentForDetails(null)
                                            }}
                                        >
                                            Close
                                        </Button>
                                        {treatment.status === 'pending' && (
                                            <Button
                                                onClick={() => {
                                                    handleSubmitTreatment(treatment.id)
                                                    setShowTreatmentDetails(false)
                                                    setSelectedTreatmentForDetails(null)
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <Send className="w-4 h-4" />
                                                Submit Treatment
                                            </Button>
                                        )}
                                        {treatment.status === 'submitted' && !treatment.dischargeSummary && (
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedTreatment(treatment.id)
                                                    setShowDischargeForm(true)
                                                    setShowTreatmentDetails(false)
                                                    setSelectedTreatmentForDetails(null)
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <FileCheck className="w-4 h-4" />
                                                Add Discharge Summary
                                            </Button>
                                        )}
                                        {treatment.status === 'submitted' && treatment.validatedForClaim === undefined && (
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedTreatment(treatment.id)
                                                    setShowValidationForm(true)
                                                    setShowTreatmentDetails(false)
                                                    setSelectedTreatmentForDetails(null)
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Validate for Claims
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })()}
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="treatments" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="treatments">Treatment Records</TabsTrigger>
                    <TabsTrigger value="claims">Patient Claims Status</TabsTrigger>
                </TabsList>

                <TabsContent value="treatments">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Treatment Records</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="info" className="text-xs">
                                        {filteredTreatments.length} of {doctorTreatments.length} treatments
                                    </Badge>
                                </div>
                            </div>

                            {/* Search and Filter Controls */}
                            <div className="flex flex-col md:flex-row gap-4 mt-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="Search by patient name or diagnosis..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="w-40">
                                            <Filter className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="submitted">Submitted</SelectItem>
                                            <SelectItem value="discharged">Discharged</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterPatient} onValueChange={setFilterPatient}>
                                        <SelectTrigger className="w-40">
                                            <User className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Patient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Patients</SelectItem>
                                            {patients.map(patient => (
                                                <SelectItem key={patient.id} value={patient.id}>
                                                    {patient.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {(searchTerm || filterStatus !== 'all' || filterPatient !== 'all') && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSearchTerm('')
                                                setFilterStatus('all')
                                                setFilterPatient('all')
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredTreatments.length === 0 ? (
                                <div className="text-center py-8">
                                    {doctorTreatments.length === 0 ? (
                                        <p className="text-gray-500">No treatments recorded yet.</p>
                                    ) : (
                                        <div>
                                            <p className="text-gray-500 mb-2">No treatments match your search criteria.</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSearchTerm('')
                                                    setFilterStatus('all')
                                                    setFilterPatient('all')
                                                }}
                                            >
                                                Clear Filters
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredTreatments.map(treatment => (
                                        <Card key={treatment.id} className="hover:shadow-md transition-shadow duration-200">
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                                    {/* Patient Info */}
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-blue-600" />
                                                            <Button
                                                                variant="link"
                                                                className="p-0 h-auto text-blue-600 hover:text-blue-800 font-semibold text-left"
                                                                onClick={() => handleViewTreatmentDetails(treatment.id)}
                                                            >
                                                                {treatment.patientName}
                                                            </Button>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs w-fit">
                                                            ID: {treatment.patientId}
                                                        </Badge>
                                                    </div>

                                                    {/* Treatment Info */}
                                                    <div className="space-y-1">
                                                        <div className="flex items-start gap-2">
                                                            <Stethoscope className="w-4 h-4 text-green-600 mt-0.5" />
                                                            <div>
                                                                <p className="font-medium text-sm">{treatment.diagnosis}</p>
                                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                                    <CalendarDays className="w-3 h-3" />
                                                                    {treatment.date}
                                                                </div>
                                                                {/* Medical Reports Summary */}
                                                                {treatment.medicalReports && treatment.medicalReports.length > 0 && (
                                                                    <div className="flex items-center gap-1 text-xs mt-1">
                                                                        <FileText className="w-3 h-3 text-blue-500" />
                                                                        <span className="text-blue-600">{treatment.medicalReports.length} reports</span>
                                                                        <span className="text-gray-400">•</span>
                                                                        <span className="text-green-600">
                                                                            {treatment.medicalReports.filter(r => r.status === 'verified' || r.status === 'uploaded').length} ready
                                                                        </span>
                                                                        {treatment.medicalReports.some(r => r.status === 'pending') && (
                                                                            <>
                                                                                <span className="text-gray-400">•</span>
                                                                                <span className="text-yellow-600">
                                                                                    {treatment.medicalReports.filter(r => r.status === 'pending').length} pending
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Cost & Status */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4 text-emerald-600" />
                                                            <span className="font-semibold text-emerald-700">${treatment.cost}</span>
                                                            {treatment.costBreakdown && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                                                    onClick={() => {
                                                                        const breakdown = treatment.costBreakdown!
                                                                        alert(`Cost Breakdown:\nConsultation: $${breakdown.consultation}\nProcedures: $${breakdown.procedures}\nMedication: $${breakdown.medication}\nEquipment: $${breakdown.equipment}\nOther: $${breakdown.other}`)
                                                                    }}
                                                                >
                                                                    <Receipt className="w-3 h-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <Badge
                                                            variant={treatment.status === 'submitted' ? 'success' : 'default'}
                                                            className="w-fit"
                                                        >
                                                            {treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}
                                                        </Badge>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2 md:justify-end flex-wrap">
                                                        {treatment.medicalReports && treatment.medicalReports.length > 0 && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleViewTreatmentDetails(treatment.id)}
                                                                className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <FileText className="w-3 h-3" />
                                                                Reports
                                                            </Button>
                                                        )}
                                                        {treatment.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSubmitTreatment(treatment.id)}
                                                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                <Send className="w-3 h-3" />
                                                                Submit
                                                            </Button>
                                                        )}
                                                        {treatment.status === 'submitted' && !treatment.dischargeSummary && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedTreatment(treatment.id)
                                                                    setShowDischargeForm(true)
                                                                }}
                                                                className="flex items-center gap-1 border-green-600 text-green-600 hover:bg-green-50"
                                                            >
                                                                <FileCheck className="w-3 h-3" />
                                                                Discharge
                                                            </Button>
                                                        )}
                                                        {treatment.status === 'submitted' && treatment.validatedForClaim === undefined && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedTreatment(treatment.id)
                                                                    setShowValidationForm(true)
                                                                }}
                                                                className="flex items-center gap-1 border-purple-600 text-purple-600 hover:bg-purple-50"
                                                            >
                                                                <CheckCircle className="w-3 h-3" />
                                                                Validate
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="claims">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                Patient Claims Status (Read-Only)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {doctorClaims.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No claims found for your patients.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Claim ID</TableHead>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Diagnosis</TableHead>
                                            <TableHead>Cost</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Insurance Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {doctorClaims.map(claim => (
                                            <TableRow key={claim.id}>
                                                <TableCell className="font-medium">#{claim.id}</TableCell>
                                                <TableCell>{claim.patientName}</TableCell>
                                                <TableCell>{claim.diagnosis}</TableCell>
                                                <TableCell>${claim.cost}</TableCell>
                                                <TableCell>{claim.submittedDate}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {claim.status === 'approved' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                        {claim.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                                                        {claim.status === 'pending' && <div className="w-4 h-4 rounded-full bg-yellow-500" />}
                                                        <Badge variant={
                                                            claim.status === 'approved' ? 'default' :
                                                                claim.status === 'rejected' ? 'destructive' :
                                                                    'secondary'
                                                        }>
                                                            {claim.status}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {claim.insuranceNotes || 'No notes'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
