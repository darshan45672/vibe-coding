"use client"

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
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
        medicalReports: [] as string[]
    })
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
    const mostCommonDiagnosis = Object.entries(topDiagnoses).sort(([,a], [,b]) => b - a)[0]

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.patientId || !formData.diagnosis || !formData.cost) return

        const patient = patients.find(p => p.id === formData.patientId)
        if (!patient) return

        const totalCost = parseFloat(formData.cost)
        const breakdown = {
            consultation: parseFloat(formData.costBreakdown.consultation) || 0,
            procedures: parseFloat(formData.costBreakdown.procedures) || 0,
            medication: parseFloat(formData.costBreakdown.medication) || 0,
            equipment: parseFloat(formData.costBreakdown.equipment) || 0,
            other: parseFloat(formData.costBreakdown.other) || 0
        }

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
        setShowAddForm(false)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const fileNames = files.map(f => f.name)
        setFormData(prev => ({ ...prev, medicalReports: [...prev.medicalReports, ...fileNames] }))
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
        const headers = ['Patient', 'Diagnosis', 'Date', 'Cost', 'Status', 'Validated']
        const rows = doctorTreatments.map(t => [
            t.patientName,
            t.diagnosis,
            t.date,
            t.cost.toString(),
            t.status,
            t.validatedForClaim ? 'Yes' : 'No'
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
                            variant="outline"
                            size="sm"
                            onClick={() => setShowNotifications(!showNotifications)}
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
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className="flex items-center gap-2"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAppointments(!showAppointments)}
                            className="flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Schedule
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQuickNotes(!showQuickNotes)}
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
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Treatment
                        </Button>
                    </div>
                </div>

                {/* Add Treatment Form - Positioned at the top */}
                {showAddForm && (
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Add New Treatment
                            </CardTitle>
                            <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-2">
                                <p className="text-sm text-blue-800">
                                    <strong>📝 Remember:</strong> Complete all fields with accurate information to ensure successful claim validation. 
                                    Include detailed medical reports and proper cost breakdown for insurance purposes.
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Patient <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={formData.patientId}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select patient" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {patients.map(patient => (
                                                    <SelectItem key={patient.id} value={patient.id}>
                                                        {patient.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Treatment Date <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">
                                            Diagnosis <span className="text-red-500">*</span>
                                        </label>
                                        <Textarea
                                            value={formData.diagnosis}
                                            onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                                            placeholder="Enter detailed diagnosis with ICD codes if applicable..."
                                            required
                                            className="min-h-[80px]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Include specific medical conditions and ICD codes for insurance compliance</p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">
                                            Treatment Details <span className="text-red-500">*</span>
                                        </label>
                                        <Textarea
                                            value={formData.treatmentDetails}
                                            onChange={(e) => setFormData(prev => ({ ...prev, treatmentDetails: e.target.value }))}
                                            placeholder="Enter comprehensive treatment information including procedures, medications, and protocols used..."
                                            rows={4}
                                            required
                                            className="min-h-[100px]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Detailed treatment description improves insurance claim approval rates</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Total Treatment Cost ($) <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.cost}
                                            onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Total should match sum of cost breakdown</p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Cost Breakdown (Required for Insurance)</label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Consultation ($)</label>
                                                <Input
                                                    type="number"
                                                    value={formData.costBreakdown.consultation}
                                                    onChange={(e) => setFormData(prev => ({ 
                                                        ...prev, 
                                                        costBreakdown: { ...prev.costBreakdown, consultation: e.target.value }
                                                    }))}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Procedures ($)</label>
                                                <Input
                                                    type="number"
                                                    value={formData.costBreakdown.procedures}
                                                    onChange={(e) => setFormData(prev => ({ 
                                                        ...prev, 
                                                        costBreakdown: { ...prev.costBreakdown, procedures: e.target.value }
                                                    }))}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Medication ($)</label>
                                                <Input
                                                    type="number"
                                                    value={formData.costBreakdown.medication}
                                                    onChange={(e) => setFormData(prev => ({ 
                                                        ...prev, 
                                                        costBreakdown: { ...prev.costBreakdown, medication: e.target.value }
                                                    }))}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Equipment ($)</label>
                                                <Input
                                                    type="number"
                                                    value={formData.costBreakdown.equipment}
                                                    onChange={(e) => setFormData(prev => ({ 
                                                        ...prev, 
                                                        costBreakdown: { ...prev.costBreakdown, equipment: e.target.value }
                                                    }))}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Other ($)</label>
                                                <Input
                                                    type="number"
                                                    value={formData.costBreakdown.other}
                                                    onChange={(e) => setFormData(prev => ({ 
                                                        ...prev, 
                                                        costBreakdown: { ...prev.costBreakdown, other: e.target.value }
                                                    }))}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Detailed cost breakdown improves insurance approval rates</p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">
                                            Medical Reports <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                                    onChange={handleFileUpload}
                                                    className="flex-1"
                                                />
                                                <Upload className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Upload lab results, X-rays, prescriptions, and other medical documentation
                                            </p>
                                            {formData.medicalReports.length > 0 && (
                                                <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                                                    <p className="text-sm font-medium text-green-700 mb-1">Uploaded files:</p>
                                                    <ul className="text-sm text-green-600">
                                                        {formData.medicalReports.map((file, index) => (
                                                            <li key={index} className="flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" />
                                                                {file}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                    <h4 className="font-medium text-yellow-800 mb-2">📋 Treatment Checklist for Insurance Validation:</h4>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                        <li>• Complete patient information and accurate diagnosis</li>
                                        <li>• Detailed treatment description with medical necessity</li>
                                        <li>• Accurate cost breakdown by category</li>
                                        <li>• Upload all supporting medical documentation</li>
                                        <li>• Follow standard medical protocols and guidelines</li>
                                    </ul>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit">Save Treatment</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Notifications Panel */}
                {showNotifications && (
                    <Card className="border-l-4 border-l-red-500 bg-red-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <Bell className="w-5 h-5" />
                                Priority Alerts & Notifications
                            </CardTitle>
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
                {showAnalytics && (
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    Practice Analytics & Insights
                                </CardTitle>
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
                {showQuickNotes && (
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-green-600" />
                                Quick Notes & Reminders
                            </CardTitle>
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
                {showAppointments && (
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-600" />
                                Today's Schedule & Appointments
                            </CardTitle>
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
                                                treatment.status === 'discharged' ? 'info' : 
                                                'pending'
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
                                            <div className="bg-green-50 p-3 rounded-md border border-green-200">
                                                <ul className="space-y-1">
                                                    {treatment.medicalReports.map((report, index) => (
                                                        <li key={index} className="flex items-center gap-2 text-green-700">
                                                            <CheckCircle className="w-4 h-4" />
                                                            {report}
                                                        </li>
                                                    ))}
                                                </ul>
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
                                            <div className={`p-3 rounded-md border ${
                                                treatment.validatedForClaim 
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
                                                    <p className={`text-sm ${
                                                        treatment.validatedForClaim ? 'text-green-700' : 'text-red-700'
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
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Diagnosis</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Cost</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTreatments.map(treatment => (
                                            <TableRow key={treatment.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="link"
                                                            className="p-0 h-auto text-blue-600 hover:text-blue-800 underline font-medium"
                                                            onClick={() => handleViewTreatmentDetails(treatment.id)}
                                                        >
                                                            {treatment.patientName}
                                                        </Button>
                                                        <Badge variant="outline" className="text-xs">
                                                            #{treatment.patientId}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs">
                                                        <p className="truncate" title={treatment.diagnosis}>
                                                            {treatment.diagnosis}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="flex items-center gap-2">
                                                    <CalendarDays className="w-4 h-4" />
                                                    {treatment.date}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        ${treatment.cost}
                                                        {treatment.costBreakdown && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 px-2 text-xs"
                                                                onClick={() => {
                                                                    const breakdown = treatment.costBreakdown!
                                                                    alert(`Cost Breakdown:\nConsultation: $${breakdown.consultation}\nProcedures: $${breakdown.procedures}\nMedication: $${breakdown.medication}\nEquipment: $${breakdown.equipment}\nOther: $${breakdown.other}`)
                                                                }}
                                                            >
                                                                <Receipt className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        treatment.status === 'submitted' ? 'success' : 
                                                        treatment.status === 'discharged' ? 'info' : 
                                                        'pending'
                                                    }>
                                                        {treatment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {treatment.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSubmitTreatment(treatment.id)}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <Send className="w-4 h-4" />
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
                                                                className="flex items-center gap-2"
                                                            >
                                                                <FileCheck className="w-4 h-4" />
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
                                                                className="flex items-center gap-2"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                Validate
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
