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
    const { treatments, claims, users, addClaim, appointments, bookAppointment } = useAppStore();
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [showClaimDetails, setShowClaimDetails] = useState(false);

    const [appointmentForm, setAppointmentForm] = useState({
        doctorId: '',
        date: '',
        time: ''
    });
    const [formData, setFormData] = useState({
        treatmentId: '',
        documents: [] as string[]
    });

    // Claim Preparation Details State
    const [claimDetails, setClaimDetails] = useState({
        patientName: '',
        policyNumber: '',
        dateOfBirth: '',
        memberId: '',
        providerName: '',
        providerNPI: '',
        providerAddress: '',
        providerPhone: '',
        dateOfService: '',
        serviceType: '',
        diagnosis: '',
        diagnosisCode: '',
        serviceDescription: '',
        totalAmount: '',
        receiptNumber: '',
        paymentMethod: '',
        amountPaid: ''
    });

    const patientId = '3'; // Current patient (John Smith)
    const availableTreatments = treatments.filter(t =>
        t.patientId === patientId &&
        t.status === 'submitted' &&
        !claims.some(c => c.treatmentId === t.id)
    );
    const patientClaims = claims.filter(c => c.patientId === patientId);
    const patientAppointments = appointments.filter(a => a.patientId === patientId);
    const doctorList = users.filter(u => u.role === 'doctor');

    const handleAppointmentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointmentForm.doctorId || !appointmentForm.date || !appointmentForm.time) return;
        const doctor = users.find(u => u.id === appointmentForm.doctorId);
        const patient = users.find(u => u.id === patientId);
        bookAppointment({
            patientId,
            patientName: patient ? patient.name : '',
            doctorId: appointmentForm.doctorId,
            doctorName: doctor ? doctor.name : '',
            date: appointmentForm.date,
            time: appointmentForm.time
        });
        setAppointmentForm({ doctorId: '', date: '', time: '' });
        setShowAppointmentForm(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.treatmentId) return;
        const treatment = treatments.find(t => t.id === formData.treatmentId);
        if (!treatment) return;
        addClaim({
            patientId,
            patientName: treatment.patientName,
            doctorId: treatment.doctorId,
            doctorName: treatment.doctorName,
            treatmentId: treatment.id,
            diagnosis: treatment.diagnosis,
            cost: treatment.cost,
            documents: formData.documents.length > 0 ? formData.documents : ['medical_report.pdf']
        });
        setFormData({ treatmentId: '', documents: [] });
        setShowClaimForm(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const fileNames = files.map(f => f.name);
        setFormData(prev => ({ ...prev, documents: [...prev.documents, ...fileNames] }));
    };

    const handleClaimDetailsSubmit = (e: any) => {
        e.preventDefault();
        // Validate required fields
        if (
            !claimDetails.patientName ||
            !claimDetails.policyNumber ||
            !claimDetails.providerName ||
            !claimDetails.dateOfService ||
            !claimDetails.diagnosis ||
            !claimDetails.totalAmount
        ) {
            console.log("Please fill in all required fields.");
            return;
        }

        // Here you could integrate with useAppStore to persist data
        console.log("Claim details saved successfully.");

        // Reset form and hide the view after saving
        setClaimDetails({
            patientName: '',
            policyNumber: '',
            dateOfBirth: '',
            memberId: '',
            providerName: '',
            providerNPI: '',
            providerAddress: '',
            providerPhone: '',
            dateOfService: '',
            serviceType: '',
            diagnosis: '',
            diagnosisCode: '',
            serviceDescription: '',
            totalAmount: '',
            receiptNumber: '',
            paymentMethod: '',
            amountPaid: ''
        });
        setShowClaimDetails(true); // Show the saved details
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'approved': return 'default';
            case 'rejected': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Member Portal</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage your healthcare claims and appointments</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Member ID: <span className="font-medium">MB-{patientId}</span></p>
                            <p className="text-sm text-gray-500">John Smith</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Quick Actions Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Claims</p>
                                    <p className="text-2xl font-bold text-blue-600">{patientClaims.filter((c: any) => c.status === 'pending').length}</p>
                                </div>
                                <FileText className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                                    <p className="text-2xl font-bold text-green-600">{patientAppointments.length}</p>
                                </div>
                                <CalendarDays className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Claims Value</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        ${patientClaims.reduce((sum: number, claim: any) => sum + parseFloat(claim.cost), 0).toLocaleString()}
                                    </p>
                                </div>
                                <DollarSign className="w-8 h-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Appointment Booking Section */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                                <CalendarDays className="w-5 h-5 text-blue-600" />
                                Schedule Appointment
                            </CardTitle>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowAppointmentForm(v => !v)}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                                {showAppointmentForm ? 'Cancel' : 'Book New'}
                            </Button>
                        </div>
                    </CardHeader>
                {showAppointmentForm && (
                    <CardContent className="p-6 bg-white">
                        <form onSubmit={handleAppointmentSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Healthcare Provider</label>
                                    <Select value={appointmentForm.doctorId} onValueChange={value => setAppointmentForm(f => ({ ...f, doctorId: value }))}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Choose your provider" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {doctorList.map(doc => (
                                                <SelectItem key={doc.id} value={doc.id}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{doc.name}</span>
                                                        <span className="text-sm text-gray-500">General Practitioner</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                                    <Input 
                                        type="date" 
                                        value={appointmentForm.date} 
                                        onChange={e => setAppointmentForm(f => ({ ...f, date: e.target.value }))} 
                                        required 
                                        className="h-11"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                                <Select value={appointmentForm.time} onValueChange={value => setAppointmentForm(f => ({ ...f, time: value }))}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select time slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="09:00">9:00 AM</SelectItem>
                                        <SelectItem value="10:00">10:00 AM</SelectItem>
                                        <SelectItem value="11:00">11:00 AM</SelectItem>
                                        <SelectItem value="14:00">2:00 PM</SelectItem>
                                        <SelectItem value="15:00">3:00 PM</SelectItem>
                                        <SelectItem value="16:00">4:00 PM</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={!appointmentForm.doctorId || !appointmentForm.date || !appointmentForm.time}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                >
                                    Schedule Appointment
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowAppointmentForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                )}
            </Card>

            {/* My Appointments Section */}
            <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <CalendarDays className="w-5 h-5 text-green-600" />
                        My Appointments
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {patientAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No appointments scheduled</p>
                            <p className="text-gray-400 text-sm">Book your first appointment above</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Healthcare Provider</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Date & Time</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patientAppointments.map((app: any) => (
                                        <TableRow key={app.id} className="hover:bg-gray-50">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <span className="text-green-600 font-medium text-sm">
                                                            {app.doctorName.split(' ').map((n: string) => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{app.doctorName}</p>
                                                        <p className="text-sm text-gray-500">General Practitioner</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{new Date(app.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                    <p className="text-sm text-gray-500">{app.time}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    Scheduled
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {app.diagnosis ? (
                                                    <p className="text-sm text-gray-600">{app.diagnosis}</p>
                                                ) : (
                                                    <span className="text-gray-400 italic text-sm">Appointment pending</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Claims Management Section */}
            <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                            <FileText className="w-5 h-5 text-purple-600" />
                            Claims Management
                        </CardTitle>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowClaimForm(v => !v)}
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                            {showClaimForm ? 'Cancel' : 'Submit New Claim'}
                        </Button>
                    </div>
                </CardHeader>
                {showClaimForm && (
                    <CardContent className="p-6 bg-white">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-1">Claim Submission Process</h4>
                                    <p className="text-sm text-blue-700">
                                        Please complete all required fields below. Ensure all information matches your insurance policy and medical records.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleClaimDetailsSubmit} className="space-y-8">
                            {/* Member Information Section */}
                            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                                    Member Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Patient Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={claimDetails.patientName}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, patientName: e.target.value }))}
                                            placeholder="Enter patient's full name"
                                            className="h-11"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Policy Number <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={claimDetails.policyNumber}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, policyNumber: e.target.value }))}
                                            placeholder="Enter insurance policy number"
                                            className="h-11"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date of Birth
                                        </label>
                                        <Input
                                            type="date"
                                            value={claimDetails.dateOfBirth || ''}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                            className="h-11"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Member ID
                                        </label>
                                        <Input
                                            type="text"
                                            value={claimDetails.memberId || ''}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, memberId: e.target.value }))}
                                            placeholder="Insurance member ID"
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Healthcare Provider Information */}
                            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                                <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                                    Healthcare Provider Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Provider Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={claimDetails.providerName}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, providerName: e.target.value }))}
                                            placeholder="Healthcare provider's name"
                                            className="h-11"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Provider NPI Number
                                        </label>
                                        <Input
                                            type="text"
                                            value={claimDetails.providerNPI || ''}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, providerNPI: e.target.value }))}
                                            placeholder="National Provider Identifier"
                                            className="h-11"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Provider Address
                                        </label>
                                        <Input
                                            type="text"
                                            value={claimDetails.providerAddress || ''}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, providerAddress: e.target.value }))}
                                            placeholder="Provider's clinic/hospital address"
                                            className="h-11"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Provider Phone
                                        </label>
                                        <Input
                                            type="tel"
                                            value={claimDetails.providerPhone || ''}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, providerPhone: e.target.value }))}
                                            placeholder="Provider's contact number"
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                                    Service Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date of Service <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            value={claimDetails.dateOfService}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, dateOfService: e.target.value }))}
                                            className="h-11"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Type of Service
                                        </label>
                                        <Select
                                            value={claimDetails.serviceType || ''}
                                            onValueChange={(value) => setClaimDetails(prev => ({ ...prev, serviceType: value }))}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select service type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="consultation">Medical Consultation</SelectItem>
                                                <SelectItem value="diagnostic">Diagnostic Tests</SelectItem>
                                                <SelectItem value="surgery">Surgery/Procedure</SelectItem>
                                                <SelectItem value="emergency">Emergency Care</SelectItem>
                                                <SelectItem value="prescription">Prescription Medication</SelectItem>
                                                <SelectItem value="therapy">Physical Therapy</SelectItem>
                                                <SelectItem value="preventive">Preventive Care</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Diagnosis/Condition <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={claimDetails.diagnosis}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, diagnosis: e.target.value }))}
                                            placeholder="Primary diagnosis or condition"
                                            className="h-11"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Diagnosis Code (ICD-10)
                                        </label>
                                        <Input
                                            type="text"
                                            value={claimDetails.diagnosisCode || ''}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, diagnosisCode: e.target.value }))}
                                            placeholder="ICD-10 diagnosis code"
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service Description
                                        </label>
                                        <textarea
                                            value={claimDetails.serviceDescription || ''}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, serviceDescription: e.target.value }))}
                                            placeholder="Detailed description of services provided"
                                            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Billing Information */}
                            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                                <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
                                    Billing Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Total Amount Charged <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={claimDetails.totalAmount}
                                                onChange={(e) => setClaimDetails(prev => ({ ...prev, totalAmount: e.target.value }))}
                                                placeholder="0.00"
                                                className="h-11 pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Receipt/Invoice Number
                                        </label>
                                        <Input
                                            type="text"
                                            value={claimDetails.receiptNumber}
                                            onChange={(e) => setClaimDetails(prev => ({ ...prev, receiptNumber: e.target.value }))}
                                            placeholder="Receipt or invoice number"
                                            className="h-11"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Method
                                        </label>
                                        <Select
                                            value={claimDetails.paymentMethod || ''}
                                            onValueChange={(value) => setClaimDetails(prev => ({ ...prev, paymentMethod: value }))}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="How was the bill paid?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="credit-card">Credit Card</SelectItem>
                                                <SelectItem value="debit-card">Debit Card</SelectItem>
                                                <SelectItem value="check">Check</SelectItem>
                                                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="insurance-direct">Insurance Direct Pay</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount Already Paid
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={claimDetails.amountPaid || ''}
                                                onChange={(e) => setClaimDetails(prev => ({ ...prev, amountPaid: e.target.value }))}
                                                placeholder="0.00"
                                                className="h-11 pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document Upload */}
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
                                    Supporting Documents
                                </h4>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                    <Input
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileUpload}
                                        className="mb-3"
                                    />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Upload medical reports, receipts, invoices, or other supporting documents
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Required: Receipt/Invoice, Medical Report (if applicable)
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Accepted formats: PDF, JPG, PNG (Max 10MB per file)
                                    </p>
                                </div>
                                {formData.documents.length > 0 && (
                                    <div className="mt-4 p-4 bg-white rounded-lg border">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</p>
                                        <div className="space-y-2">
                                            {formData.documents.map((doc: string, index: number) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    <FileText className="w-4 h-4 text-green-600" />
                                                    <span className="text-gray-700">{doc}</span>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Uploaded
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Declaration and Submit */}
                            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                                <h4 className="font-semibold text-yellow-900 mb-4">Declaration</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="declaration1"
                                            className="mt-1"
                                            required
                                        />
                                        <label htmlFor="declaration1" className="text-sm text-gray-700">
                                            I certify that the information provided in this claim is true and accurate to the best of my knowledge.
                                        </label>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="declaration2"
                                            className="mt-1"
                                            required
                                        />
                                        <label htmlFor="declaration2" className="text-sm text-gray-700">
                                            I understand that providing false information may result in claim denial and policy cancellation.
                                        </label>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="declaration3"
                                            className="mt-1"
                                        />
                                        <label htmlFor="declaration3" className="text-sm text-gray-700">
                                            I authorize my healthcare provider to release medical information necessary to process this claim.
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Section */}
                            <div className="flex gap-3 pt-6 border-t border-gray-200">
                                <Button 
                                    type="submit" 
                                    disabled={
                                        !claimDetails.patientName ||
                                        !claimDetails.policyNumber ||
                                        !claimDetails.providerName ||
                                        !claimDetails.dateOfService ||
                                        !claimDetails.diagnosis ||
                                        !claimDetails.totalAmount
                                    }
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                                >
                                    Submit Claim for Review
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setShowClaimForm(false)}
                                    className="px-6 py-3"
                                >
                                    Save as Draft
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => {
                                        setClaimDetails({
                                            patientName: '',
                                            policyNumber: '',
                                            dateOfBirth: '',
                                            memberId: '',
                                            providerName: '',
                                            providerNPI: '',
                                            providerAddress: '',
                                            providerPhone: '',
                                            dateOfService: '',
                                            serviceType: '',
                                            diagnosis: '',
                                            diagnosisCode: '',
                                            serviceDescription: '',
                                            totalAmount: '',
                                            receiptNumber: '',
                                            paymentMethod: '',
                                            amountPaid: ''
                                        });
                                        setFormData({ treatmentId: '', documents: [] });
                                    }}
                                    className="px-6 py-3 text-gray-500"
                                >
                                    Clear Form
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                )}
            </Card>

            {/* Claims History Section */}
            <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
                        <FileText className="w-5 h-5 text-gray-600" />
                        Claims History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {patientClaims.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No claims submitted yet</p>
                            <p className="text-gray-400 text-sm">Your claim history will appear here once you submit your first claim</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Claim Details</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Healthcare Provider</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Submitted</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Insurance Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patientClaims.map((claim: any) => (
                                        <TableRow key={claim.id} className="hover:bg-gray-50">
                                            <TableCell className="py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">Claim #{claim.id.toString().padStart(6, '0')}</p>
                                                    <p className="text-sm text-gray-600">{claim.diagnosis}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <span className="text-blue-600 font-medium text-xs">
                                                            {claim.doctorName.split(' ').map((n: string) => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{claim.doctorName}</p>
                                                        <p className="text-sm text-gray-500">General Practitioner</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-green-600" />
                                                    <span className="font-semibold text-gray-900">${parseFloat(claim.cost).toLocaleString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{claim.submittedDate}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(claim.status)}
                                                    <Badge 
                                                        variant={getStatusColor(claim.status) as any}
                                                        className={`
                                                            ${claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                                                            ${claim.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                                                            ${claim.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' : ''}
                                                        `}
                                                    >
                                                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 max-w-xs">
                                                {claim.insuranceNotes ? (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <p className="text-sm text-blue-800">{claim.insuranceNotes}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-sm">No notes available</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
    );
}